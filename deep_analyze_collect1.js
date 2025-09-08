import { promises as fs } from 'fs';
import { resolve, join } from 'path';

async function deepAnalyzeCollect1() {
  try {
    const rootDir = resolve('.');
    const dataDir = join(rootDir, 'data');

    // 读取相关数据
    const driveTickets = JSON.parse(await fs.readFile(join(dataDir, 'drive_ticket.json'), 'utf8'));
    const rideTickets = JSON.parse(await fs.readFile(join(dataDir, 'drive_ride_ticket.json'), 'utf8'));
    const logicStations = JSON.parse(await fs.readFile(join(dataDir, 'cw_logic_station.json'), 'utf8'));
    const stations = JSON.parse(await fs.readFile(join(dataDir, 'cw_station.json'), 'utf8'));
    const trainSchedules = JSON.parse(await fs.readFile(join(dataDir, 'cw_train_schedule.json'), 'utf8'));
    const trainScheduleDetails = JSON.parse(await fs.readFile(join(dataDir, 'cw_train_schedule_detail.json'), 'utf8'));
    
    console.log('=== 深入分析交路票夹序号1 ===');
    
    // 获取第一个交路票
    const firstTicket = driveTickets.find(ticket => ticket.ticket_id === 1);
    console.log('第一个交路票:', firstTicket);
    
    // 检查上车站点是否为出勤站点
    const startStation = firstTicket.start_station;
    console.log('上车站点:', startStation);
    
    // 找到上车站点的ID
    const station = stations.find(s => s.station_name === startStation);
    console.log('上车站点ID:', station?.station_id);
    
    if (station) {
      // 检查该站点是否为出勤站点（station_type === 1）
      const isAttendanceStation = logicStations.some(ls => 
        ls.station_id === station.station_id && ls.station_type === 1);
      console.log('是否为出勤站点:', isAttendanceStation);
      
      if (!isAttendanceStation) {
        console.log('上车站点不是出勤站点，需要查找便乘票');
        
        // 找到对应的车次时刻表
        const trainSchedule = trainSchedules.find(ts => ts.train_name === firstTicket.train_name);
        console.log('车次时刻表:', trainSchedule);
        
        if (trainSchedule) {
          // 获取该车次的所有站点明细并按到达时间升序排列
          const scheduleDetails = trainScheduleDetails
            .filter(detail => detail.train_schedule_id === trainSchedule.train_schedule_id)
            .sort((a, b) => a.arrive_time.localeCompare(b.arrive_time));
          
          console.log('车次站点明细:');
          scheduleDetails.forEach((detail, index) => {
            const stationName = stations.find(s => s.station_id === detail.station_id)?.station_name;
            console.log(`  ${index}: ${stationName} (${detail.station_id}) - 到达时间: ${detail.arrive_time}`);
          });
          
          // 查找上车站的到达时间
          const startStationDetail = scheduleDetails.find(
            detail => {
              const station = stations.find(s => s.station_id === detail.station_id);
              return station && station.station_name === startStation;
            }
          );
          
          if (startStationDetail) {
            const arriveTime = startStationDetail.arrive_time;
            console.log('上车站到达时间:', arriveTime);
            
            // 查找所有以王府井站为下车站点的便乘票
            const validRideTickets = rideTickets.filter(rideTicket => 
              rideTicket.end_station === startStation
            );
            
            console.log(`所有以${startStation}为下车站点的便乘票:`);
            validRideTickets.forEach((rt, index) => {
              console.log(`  ${index+1}. [${rt.ride_id}] ${rt.start_station} -> ${rt.end_station} (${rt.pickup_time} - ${rt.dropoff_time})`);
            });
            
            // 查找符合条件的便乘票（下车站到站时间早于该到达时间）
            const eligibleRideTickets = rideTickets.filter(rideTicket => 
              rideTicket.end_station === startStation && 
              rideTicket.dropoff_time <= arriveTime
            );
            
            console.log(`符合条件的便乘票（下车站到站时间早于${arriveTime}）:`);
            eligibleRideTickets.forEach((rt, index) => {
              console.log(`  ${index+1}. [${rt.ride_id}] ${rt.start_station} -> ${rt.end_station} (${rt.pickup_time} - ${rt.dropoff_time})`);
            });
            
            if (eligibleRideTickets.length === 0) {
              console.log('❌ 没有找到符合条件的便乘票');
              console.log('原因分析:');
              console.log('1. 王府井站的到达时间是06:00:00，这是最早的班次');
              console.log('2. 没有任何便乘票的下车站到站时间早于06:00:00');
              console.log('3. 因此无法找到合适的出勤便乘票');
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('分析过程中发生错误:', error);
  }
}

deepAnalyzeCollect1();