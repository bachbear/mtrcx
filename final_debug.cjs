// 便乘票生成主函数 - 有更详细调试信息
const fs = require('fs').promises;
const { join } = require('path');

async function generateRideTickets() {
  try {
    console.log('=== 开始便乘票生成 ===');
    
    // 计算项目根目录路径
    const rootDir = __dirname;
    const dataDir = join(rootDir, 'data');
    
    // 读取所有必要的数据文件
    const trainSchedules = JSON.parse(await fs.readFile(join(dataDir, 'cw_train_schedule.json'), 'utf8'));
    const trainScheduleDetails = JSON.parse(await fs.readFile(join(dataDir, 'cw_train_schedule_detail.json'), 'utf8'));
    const logicStations = JSON.parse(await fs.readFile(join(dataDir, 'cw_logic_station.json'), 'utf8'));
    const stations = JSON.parse(await fs.readFile(join(dataDir, 'cw_station.json'), 'utf8'));
    
    console.log('数据加载完成');
    
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
    
    console.log('=== 调试信息 ===');
    console.log('总共车次数量:', trainSchedules.length);
    console.log('逻辑车站数量:', logicStations.length);
    
    // 4.1.1 对当天所有的车次按发车时间递增排序
    const sortedTrainSchedulesAsc = [...trainSchedules].sort((a, b) => 
      a.begin_time.localeCompare(b.begin_time)
    );
    
    console.log('=== 处理出勤便乘票 ===');
    
    // 4.1.2 生成出勤便乘票 - 根据完整算法逻辑
    for (const schedule of sortedTrainSchedulesAsc) {
      const trainName = schedule.train_name;
      const trainScheduleId = schedule.train_schedule_id;
      
      console.log(`\n处理车次 ${trainName} (ID: ${trainScheduleId})`);
      
      // 获取该车次的所有站点明细并按到达时间升序排列
      const scheduleDetails = trainScheduleDetails
        .filter(detail => detail.train_schedule_id === trainScheduleId)
        .sort((a, b) => a.arrive_time.localeCompare(b.arrive_time));
      
      console.log(`  车次详情数量: ${scheduleDetails.length}`);
      
      // 如果没有站点明细，跳过该车次
      if (scheduleDetails.length === 0) {
        console.log('  没有站点明细，跳过');
        continue;
      }
      
      // 按算法逻辑：找出第一个出勤站点（station_type === 1）
      let firstAttendanceStation = null;
      let firstAttendanceIndex = -1;
      
      console.log('  查找出勤站点:');
      for (let i = 0; i < scheduleDetails.length; i++) {
        const detail = scheduleDetails[i];
        const isAttendanceStation = logicStations.some(ls => 
          ls.station_id === detail.station_id && ls.station_type === 1);
        console.log(`    站点${i}: ${stationMap[detail.station_id]} (${detail.station_id}) 出勤站? ${isAttendanceStation}`);
        if (isAttendanceStation) {
          firstAttendanceStation = detail;
          firstAttendanceIndex = i;
          console.log(`    找到出勤站点: ${stationMap[detail.station_id]} (索引 ${i})`);
          break;
        }
      }
      
      // 如果找到出勤站点，生成出勤便乘票
      if (firstAttendanceStation) {
        const startStationName = stationMap[firstAttendanceStation.station_id];
        if (!startStationName) {
          console.log('    起始站点名称无效，跳过');
          continue;
        }
        
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
          
          // 按算法：如果下一个站点是接车站点，或者该站点是最后一个站点，则生成
          if (isPickupStation || isLastStation) {
            endStationName = stationMap[nextDetail.station_id];
            console.log(`  终点站: ${endStationName}`);
          } else {
            console.log('  不满足生成条件，跳过');
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
      } else {
        console.log('  没有找到出勤站点');
      }
    }
    
    console.log('\n=== 处理完成，开始处理退勤便乘票 ===');
    console.log('生成的便乘票数量:', rideTickets.length);
    
    // 保存结果到drive_ride_ticket.json文件
    await fs.writeFile(
      join(dataDir, 'drive_ride_ticket.json'),
      JSON.stringify(rideTickets, null, 2),
      'utf8'
    );
    
    console.log('便乘票生成完成，共生成', rideTickets.length, '条记录');
    console.log('结果已保存到data/drive_ride_ticket.json文件中');
    
    // 返回生成的便乘票数据
    return rideTickets;
  } catch (error) {
    console.error('生成便乘票时发生错误:', error);
    console.error(error.stack);
    throw error;
  }
}

// 如果直接运行此脚本，则执行生成便乘票的函数
if (require.main === module) {
  console.log('正在执行便乘票生成...');
  generateRideTickets().then(() => {
    console.log('便乘票生成完成');
  }).catch(err => {
    console.error('便乘票生成失败:', err);
  });
}

module.exports = { generateRideTickets };