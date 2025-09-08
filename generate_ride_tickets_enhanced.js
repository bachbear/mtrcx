import { promises as fs } from 'fs';

async function runEnhancedAlgorithm() {
  try {
    console.log('=== 运行增强算法 - 生成所有可能的便乘票 ===');
    
    // 读取所有必要的数据文件
    const trainSchedules = JSON.parse(await fs.readFile('./data/cw_train_schedule.json', 'utf8'));
    const trainScheduleDetails = JSON.parse(await fs.readFile('./data/cw_train_schedule_detail.json', 'utf8'));
    const logicStations = JSON.parse(await fs.readFile('./data/cw_logic_station.json', 'utf8'));
    const stations = JSON.parse(await fs.readFile('./data/cw_station.json', 'utf8'));
    
    console.log('读取数据完成');
    
    // 生成便乘票记录
    const rideTickets = [];
    
    // 创建station_id到station_name的映射
    const stationMap = {};
    for (const station of stations) {
      stationMap[station.station_id] = station.station_name;
    }
    
    // 处理出勤便乘票
    console.log('\n=== 生成出勤便乘票 ===');
    
    for (const schedule of trainSchedules) {
      const trainName = schedule.train_name;
      const trainScheduleId = schedule.train_schedule_id;
      
      // 获取该车次的所有站点明细并按到达时间升序排列
      const scheduleDetails = trainScheduleDetails
        .filter(detail => detail.train_schedule_id === trainScheduleId)
        .sort((a, b) => a.arrive_time.localeCompare(b.arrive_time));
      
      if (scheduleDetails.length === 0) continue;
      
      // 查找所有的出勤站点
      for (let i = 0; i < scheduleDetails.length; i++) {
        const detail = scheduleDetails[i];
        const isAttendanceStation = logicStations.some(ls => 
          ls.station_id === detail.station_id && ls.station_type === 1);
        
        if (isAttendanceStation) {
          const startStationName = stationMap[detail.station_id];
          console.log(`在车次 ${trainName} 中找到出勤站点: ${startStationName} (索引 ${i})`);
          
          // 查找从这个出勤站点开始的第一个接车站点和末站
          let firstPickupStation = null;
          let lastStation = null;
          
          for (let j = i + 1; j < scheduleDetails.length; j++) {
            const nextDetail = scheduleDetails[j];
            const isPickupStation = logicStations.some(ls => 
              ls.station_id === nextDetail.station_id && ls.station_type === 3);
            const isLastStation = (j === scheduleDetails.length - 1);
            
            // 记录第一个接车站点
            if (isPickupStation && !firstPickupStation) {
              firstPickupStation = nextDetail;
            }
            
            // 记录末站
            if (isLastStation) {
              lastStation = nextDetail;
            }
          }
          
          // 生成到接车站点的便乘票（如果存在）
          if (firstPickupStation) {
            const endStationName = stationMap[firstPickupStation.station_id];
            const rideTicket = {
              train_name: trainName,
              start_station: startStationName,
              end_station: endStationName
            };
            rideTickets.push(rideTicket);
            console.log('  生成便乘票(接车):', trainName, startStationName, '->', endStationName);
          }
          
          // 生成到末站的便乘票（如果末站不是接车站点，且与接车站点不同）
          if (lastStation) {
            const endStationName = stationMap[lastStation.station_id];
            const isLastStationPickup = logicStations.some(ls => 
              ls.station_id === lastStation.station_id && ls.station_type === 3);
            
            // 如果末站不是接车站点，或者末站与接车站点不同，则生成便乘票
            if (!isLastStationPickup || 
                (firstPickupStation && firstPickupStation.station_id !== lastStation.station_id)) {
              const rideTicket = {
                train_name: trainName,
                start_station: startStationName,
                end_station: endStationName
              };
              rideTickets.push(rideTicket);
              console.log('  生成便乘票(末站):', trainName, startStationName, '->', endStationName);
            }
          }
          
          // 对于出勤便乘票，通常只处理第一个出勤站点（根据算法描述）
          break;
        }
      }
    }
    
    // 处理退勤便乘票
    console.log('\n=== 生成退勤便乘票 ===');
    
    // 按到达时间递减排序
    const sortedTrainSchedulesDesc = [...trainSchedules].sort((a, b) => 
      b.end_time.localeCompare(a.end_time)
    );
    
    for (const schedule of sortedTrainSchedulesDesc) {
      const trainName = schedule.train_name;
      const trainScheduleId = schedule.train_schedule_id;
      
      // 获取该车次的所有站点明细并按到达时间降序排列
      const scheduleDetails = trainScheduleDetails
        .filter(detail => detail.train_schedule_id === trainScheduleId)
        .sort((a, b) => b.arrive_time.localeCompare(a.arrive_time));
      
      if (scheduleDetails.length === 0) continue;
      
      // 查找所有的退勤站点
      for (let i = 0; i < scheduleDetails.length; i++) {
        const detail = scheduleDetails[i];
        const isOffDutyStation = logicStations.some(ls => 
          ls.station_id === detail.station_id && ls.station_type === 2);
        
        if (isOffDutyStation) {
          const endStationName = stationMap[detail.station_id];
          console.log(`在车次 ${trainName} 中找到退勤站点: ${endStationName} (索引 ${i})`);
          
          // 查找从这个退勤站点开始的第一个退车站点和首站
          let firstDropoffStation = null;
          let firstStation = null;
          
          for (let j = i + 1; j < scheduleDetails.length; j++) {
            const nextDetail = scheduleDetails[j];
            const isDropoffStation = logicStations.some(ls => 
              ls.station_id === nextDetail.station_id && ls.station_type === 4);
            const isFirstStation = (j === scheduleDetails.length - 1);
            
            // 记录第一个退车站点
            if (isDropoffStation && !firstDropoffStation) {
              firstDropoffStation = nextDetail;
            }
            
            // 记录首站
            if (isFirstStation) {
              firstStation = nextDetail;
            }
          }
          
          // 生成从退车站点的便乘票（如果存在）
          if (firstDropoffStation) {
            const startStationName = stationMap[firstDropoffStation.station_id];
            const rideTicket = {
              train_name: trainName,
              start_station: startStationName,
              end_station: endStationName
            };
            rideTickets.push(rideTicket);
            console.log('  生成便乘票(退车):', trainName, startStationName, '->', endStationName);
          }
          
          // 生成从首站的便乘票（如果首站不是退车站点，且与退车站点不同）
          if (firstStation) {
            const startStationName = stationMap[firstStation.station_id];
            const isFirstStationDropoff = logicStations.some(ls => 
              ls.station_id === firstStation.station_id && ls.station_type === 4);
            
            // 如果首站不是退车站点，或者首站与退车站点不同，则生成便乘票
            if (!isFirstStationDropoff || 
                (firstDropoffStation && firstDropoffStation.station_id !== firstStation.station_id)) {
              const rideTicket = {
                train_name: trainName,
                start_station: startStationName,
                end_station: endStationName
              };
              rideTickets.push(rideTicket);
              console.log('  生成便乘票(首站):', trainName, startStationName, '->', endStationName);
            }
          }
          
          // 对于退勤便乘票，通常只处理第一个退勤站点（根据算法描述）
          break;
        }
      }
    }
    
    console.log('\n=== 结果 ===');
    console.log('总共生成便乘票:', rideTickets.length, '条');
    
    // 添加时间信息
    const rideTicketsWithTime = rideTickets.map(rideTicket => {
      const scheduleDetailsForTrain = trainScheduleDetails.filter(
        detail => {
          const trainSchedule = trainSchedules.find(ts => ts.train_name === rideTicket.train_name);
          return trainSchedule && detail.train_schedule_id === trainSchedule.train_schedule_id;
        }
      ).sort((a, b) => a.arrive_time.localeCompare(b.arrive_time));
      
      let pickupTime = '';
      const startStationDetail = scheduleDetailsForTrain.find(
        detail => {
          const station = stations.find(s => s.station_id === detail.station_id);
          return station && station.station_name === rideTicket.start_station;
        }
      );
      if (startStationDetail) {
        pickupTime = startStationDetail.arrive_time;
      }
      
      let dropoffTime = '';
      const endStationDetail = scheduleDetailsForTrain.find(
        detail => {
          const station = stations.find(s => s.station_id === detail.station_id);
          return station && station.station_name === rideTicket.end_station;
        }
      );
      if (endStationDetail) {
        dropoffTime = endStationDetail.arrive_time;
      }
      
      return {
        ...rideTicket,
        pickup_time: pickupTime,
        dropoff_time: dropoffTime
      };
    });
    
    // 排序
    const sortedRideTickets = rideTicketsWithTime.sort((a, b) => {
      const timeComparison = a.pickup_time.localeCompare(b.pickup_time);
      if (timeComparison !== 0) {
        return timeComparison;
      }
      return a.train_name.localeCompare(b.train_name);
    });
    
    // 添加ID
    const finalRideTickets = sortedRideTickets.map((ticket, index) => ({
      id: index + 1,
      ride_id: index + 1,
      ...ticket
    }));
    
    // 保存结果
    await fs.writeFile(
      './data/drive_ride_ticket.json',
      JSON.stringify(finalRideTickets, null, 2),
      'utf8'
    );
    
    console.log('结果已保存到 data/drive_ride_ticket.json');
    
    if (finalRideTickets.length > 0) {
      console.log('\n生成的便乘票:');
      finalRideTickets.forEach((ticket, index) => {
        if (index < 30) { // 显示更多条目
          console.log(index + 1 + '.', ticket.train_name + ':', ticket.start_station, '->', ticket.end_station, '(' + ticket.pickup_time + ' - ' + ticket.dropoff_time + ')');
        }
      });
    }
    
    return finalRideTickets;
  } catch (error) {
    console.error('执行错误:', error);
  }
}

runEnhancedAlgorithm();