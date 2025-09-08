import { promises as fs } from 'fs';
import { resolve, join } from 'path';

async function analyzeTicketCollect1() {
  try {
    const rootDir = resolve('.');
    const dataDir = join(rootDir, 'data');

    // 读取相关数据
    const driveTickets = JSON.parse(await fs.readFile(join(dataDir, 'drive_ticket.json'), 'utf8'));
    const collectList = JSON.parse(await fs.readFile(join(dataDir, 'drive_ticket_collect.json'), 'utf8'));
    const logicStations = JSON.parse(await fs.readFile(join(dataDir, 'cw_logic_station.json'), 'utf8'));
    const stations = JSON.parse(await fs.readFile(join(dataDir, 'cw_station.json'), 'utf8'));
    
    console.log('=== 分析交路票夹序号1 ===');
    
    // 获取交路票夹1的信息
    const collect1 = collectList.find(c => c.collect_id === 1);
    console.log('交路票夹1的ticket_chain:', collect1.ticket_chain);
    
    // 解析交路票序号
    const ticketIds = collect1.ticket_chain.split('=>')[0].split('->').map(id => parseInt(id));
    console.log('交路票序号:', ticketIds);
    
    // 获取第一个交路票
    const firstTicketId = ticketIds[0];
    const firstTicket = driveTickets.find(ticket => ticket.ticket_id === firstTicketId);
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
      
      if (isAttendanceStation) {
        console.log('✅ 原因：上车站点是出勤站点，根据算法要求不需要补全出勤便乘票');
      } else {
        console.log('❌ 上车站点不是出勤站点，应该补全出勤便乘票');
        
        // 检查是否有可用的便乘票
        let rideTickets = [];
        try {
          rideTickets = JSON.parse(await fs.readFile(join(dataDir, 'drive_ride_ticket.json'), 'utf8'));
        } catch (error) {
          console.log('未找到便乘票数据');
          return;
        }
        
        // 查找符合条件的便乘票
        const trainSchedules = JSON.parse(await fs.readFile(join(dataDir, 'cw_train_schedule.json'), 'utf8'));
        const trainScheduleDetails = JSON.parse(await fs.readFile(join(dataDir, 'cw_train_schedule_detail.json'), 'utf8'));
        
        // 找到对应的车次时刻表
        const trainSchedule = trainSchedules.find(ts => ts.train_name === firstTicket.train_name);
        if (trainSchedule) {
          // 获取该车次的所有站点明细并按到达时间升序排列
          const scheduleDetails = trainScheduleDetails
            .filter(detail => detail.train_schedule_id === trainSchedule.train_schedule_id)
            .sort((a, b) => a.arrive_time.localeCompare(b.arrive_time));
          
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
            
            // 查找符合条件的便乘票
            const validRideTickets = rideTickets.filter(rideTicket => 
              rideTicket.end_station === startStation && 
              rideTicket.dropoff_time <= arriveTime
            );
            
            console.log('符合条件的便乘票数量:', validRideTickets.length);
            if (validRideTickets.length > 0) {
              console.log('便乘票详情:');
              validRideTickets.forEach((rt, index) => {
                console.log(`  ${index+1}. [${rt.ride_id}] ${rt.start_station} -> ${rt.end_station} (${rt.pickup_time} - ${rt.dropoff_time})`);
              });
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('分析过程中发生错误:', error);
  }
}

analyzeTicketCollect1();