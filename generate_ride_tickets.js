import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 便乘票生成主函数
async function generateRideTickets() {
  try {
    // 计算项目根目录路径
    const rootDir = __dirname;
    const dataDir = join(rootDir, 'data');
    
    // 读取所有必要的数据文件
    const trainSchedules = JSON.parse(await fs.readFile(join(dataDir, 'cw_train_schedule.json'), 'utf8'));
    const trainScheduleDetails = JSON.parse(await fs.readFile(join(dataDir, 'cw_train_schedule_detail.json'), 'utf8'));
    const logicStations = JSON.parse(await fs.readFile(join(dataDir, 'cw_logic_station.json'), 'utf8'));
    const stations = JSON.parse(await fs.readFile(join(dataDir, 'cw_station.json'), 'utf8'));
    
    // 检查逻辑车站数据
    if (logicStations.length === 0) {
      console.warn('警告: 未找到逻辑车站数据，将无法生成便乘票');
      return [];
    }
    
    // 生成便乘票记录
    const rideTickets = [];
    
    // 创建station_id到station_name的映射
    const stationMap = {};
    for (const station of stations) {
      stationMap[station.station_id] = station.station_name;
    }
    
    // 4.1.1 对当天所有的车次按发车时间递增排序
    const sortedTrainSchedulesAsc = [...trainSchedules].sort((a, b) => 
      a.begin_time.localeCompare(b.begin_time)
    );
    
    console.log('=== 调试信息 ===');
    console.log('总共车次数量:', trainSchedules.length);
    console.log('逻辑车站数量:', logicStations.length);
    
    // 4.1.2 生成出勤便乘票 - 根据完整算法逻辑
    for (const schedule of sortedTrainSchedulesAsc) {
      const trainName = schedule.train_name;
      const trainScheduleId = schedule.train_schedule_id;
      
      // 获取该车次的所有站点明细并按到达时间升序排列
      const scheduleDetails = trainScheduleDetails
        .filter(detail => detail.train_schedule_id === trainScheduleId)
        .sort((a, b) => a.arrive_time.localeCompare(b.arrive_time));
      
      // 如果没有站点明细，跳过该车次
      if (scheduleDetails.length === 0) {
        continue;
      }
      
      console.log(`\n处理车次 ${trainName}: ${scheduleDetails.length} 个站点`);
      
      // 按算法逻辑：找出第一个出勤站点（station_type === 1）
      let firstAttendanceStation = null;
      let firstAttendanceIndex = -1;
      
      for (let i = 0; i < scheduleDetails.length; i++) {
        const detail = scheduleDetails[i];
        const isAttendanceStation = logicStations.some(ls => 
          ls.station_id === detail.station_id && ls.station_type === 1);
        if (isAttendanceStation) {
          firstAttendanceStation = detail;
          firstAttendanceIndex = i;
          console.log(`  找到出勤站点: ${stationMap[detail.station_id]} (索引 ${i})`);
          break;
        }
      }
      
      // 如果找到出勤站点，生成出勤便乘票
      if (firstAttendanceStation) {
        const startStationName = stationMap[firstAttendanceStation.station_id];
        if (!startStationName) continue;
        
        console.log(`  起始站点: ${startStationName}`);
        
        // 找到下一个站点，如果该站点是接车站点（station_type === 3）或最后一个站点
        let endStationName = null;
        let nextIndex = firstAttendanceIndex + 1;
        
        if (nextIndex < scheduleDetails.length) {
          const nextDetail = scheduleDetails[nextIndex];
          const isPickupStation = logicStations.some(ls => 
            ls.station_id === nextDetail.station_id && ls.station_type === 3);
          const isLastStation = (nextIndex === scheduleDetails.length - 1);
          
          console.log(`  下一个站点: ${stationMap[nextDetail.station_id]} (索引 ${nextIndex}), 接车站点: ${isPickupStation}, 最后一个站点: ${isLastStation}`);
          
          // 修改逻辑：只要不是最后站点，就可以考虑接车站点
          if (isPickupStation || isLastStation) {
            endStationName = stationMap[nextDetail.station_id];
            console.log(`  终点站: ${endStationName}`);
          }
        } else {
          // 如果是最后一个站点，使用该站点作为下车站点
          endStationName = startStationName;
          console.log(`  终点站: ${endStationName} (因为是最后一个站点)`);
        }
        
        if (endStationName) {
          const rideTicket = {
            train_name: trainName,
            start_station: startStationName,
            end_station: endStationName
          };
          rideTickets.push(rideTicket);
          console.log(`  生成便乘票: ${trainName} ${startStationName} -> ${endStationName}`);
        }
      }
    }
    
    // 4.1.3 对当天所有车次按到达时间递减排序
    const sortedTrainSchedulesDesc = [...trainSchedules].sort((a, b) => 
      b.end_time.localeCompare(a.end_time)
    );
    
    // 4.1.4 生成退勤便乘票 - 根据完整算法逻辑
    for (const schedule of sortedTrainSchedulesDesc) {
      const trainName = schedule.train_name;
      const trainScheduleId = schedule.train_schedule_id;
      
      // 获取该车次的所有站点明细并按到达时间降序排列
      const scheduleDetails = trainScheduleDetails
        .filter(detail => detail.train_schedule_id === trainScheduleId)
        .sort((a, b) => b.arrive_time.localeCompare(a.arrive_time));
      
      // 如果没有站点明细，跳过该车次
      if (scheduleDetails.length === 0) {
        continue;
      }
      
      console.log(`\n处理退勤车次 ${trainName}: ${scheduleDetails.length} 个站点`);
      
      // 按算法逻辑：找出第一个退勤站点（station_type === 2）
      let firstOffDutyStation = null;
      let firstOffDutyIndex = -1;
      
      for (let i = 0; i < scheduleDetails.length; i++) {
        const detail = scheduleDetails[i];
        const isOffDutyStation = logicStations.some(ls => 
          ls.station_id === detail.station_id && ls.station_type === 2);
        if (isOffDutyStation) {
          firstOffDutyStation = detail;
          firstOffDutyIndex = i;
          console.log(`  找到退勤站点: ${stationMap[detail.station_id]} (索引 ${i})`);
          break;
        }
      }
      
      // 如果找到退勤站点，生成退勤便乘票
      if (firstOffDutyStation) {
        const endStationName = stationMap[firstOffDutyStation.station_id];
        if (!endStationName) continue;
        
        console.log(`  终点站: ${endStationName}`);
        
        // 找到下一个站点，如果该站点是退车站点（station_type === 4）或第一个站点
        let startStationName = null;
        let nextIndex = firstOffDutyIndex + 1;
        
        if (nextIndex < scheduleDetails.length) {
          const nextDetail = scheduleDetails[nextIndex];
          const isDropoffStation = logicStations.some(ls => 
            ls.station_id === nextDetail.station_id && ls.station_type === 4);
          const isFirstStation = (nextIndex === scheduleDetails.length - 1);
          
          console.log(`  下一个站点: ${stationMap[nextDetail.station_id]} (索引 ${nextIndex}), 退车站点: ${isDropoffStation}, 第一个站点: ${isFirstStation}`);
          
          // 修改逻辑：只要不是最后站点，就可以考虑退车站点
          if (isDropoffStation || isFirstStation) {
            startStationName = stationMap[nextDetail.station_id];
            console.log(`  起始站: ${startStationName}`);
          }
        } else {
          // 如果是第一个站点，使用该站点作为上车站点
          startStationName = endStationName;
          console.log(`  起始站: ${startStationName} (因为是第一个站点)`);
        }
        
        if (startStationName) {
          const rideTicket = {
            train_name: trainName,
            start_station: startStationName,
            end_station: endStationName
          };
          rideTickets.push(rideTicket);
          console.log(`  生成退勤便乘票: ${trainName} ${startStationName} -> ${endStationName}`);
        }
      }
    }
    
    console.log('\n=== 总结 ===');
    console.log('生成的便乘票总数:', rideTickets.length);
    
    // 4.1.5 查询列车时刻表明细表，针对获得的车次名称，上车站点，下车站点，查询列车时刻表明细表，获得以下两个字段的时间数据：上车站到站时间，下车站到站时间
    const rideTicketsWithTime = rideTickets.map(rideTicket => {
      // 查找该车次的时刻表明细
      const scheduleDetailsForTrain = trainScheduleDetails.filter(
        detail => {
          // 找到对应的车次时刻表
          const trainSchedule = trainSchedules.find(ts => ts.train_name === rideTicket.train_name);
          return trainSchedule && detail.train_schedule_id === trainSchedule.train_schedule_id;
        }
      ).sort((a, b) => a.arrive_time.localeCompare(b.arrive_time));
      
      // 查找上车站的到达时间
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
      
      // 查找下车站的到达时间
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
    
    // 对生成的所有便乘票按上车站到站时间升序排列，如果上车站到站时间相同，则叠加按车次号升序条件排列
    const sortedRideTickets = rideTicketsWithTime.sort((a, b) => {
      // 首先按上车站到站时间排序
      const timeComparison = a.pickup_time.localeCompare(b.pickup_time);
      if (timeComparison !== 0) {
        return timeComparison;
      }
      // 如果上车站到站时间相同，按车次号排序
      return a.train_name.localeCompare(b.train_name);
    });
    
    // 添加主键ID和便乘票序号
    const finalRideTickets = sortedRideTickets.map((ticket, index) => ({
      id: index + 1,
      ride_id: index + 1,
      ...ticket
    }));
    
    // 保存结果到drive_ride_ticket.json文件
    await fs.writeFile(
      join(dataDir, 'drive_ride_ticket.json'),
      JSON.stringify(finalRideTickets, null, 2),
      'utf8'
    );
    
    console.log('便乘票生成完成，共生成', finalRideTickets.length, '条记录');
    console.log('结果已保存到data/drive_ride_ticket.json文件中');
    
    // 返回生成的便乘票数据
    return finalRideTickets;
  } catch (error) {
    console.error('生成便乘票时发生错误:', error);
    throw error;
  }
}

// 如果直接运行此脚本，则执行生成便乘票的函数
if (import.meta.url === `file://${__filename}`) {
  console.log('正在执行便乘票生成...');
  generateRideTickets().then(() => {
    console.log('便乘票生成完成');
  }).catch(err => {
    console.error('便乘票生成失败:', err);
  });
}

// 导出生成便乘票的函数
export { generateRideTickets };