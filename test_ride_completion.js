import { promises as fs } from 'fs';
import { resolve, join } from 'path';

async function testRideTicketCompletion() {
  try {
    const rootDir = resolve('.');
    const dataDir = join(rootDir, 'data');

    // 读取交路票数据
    const driveTickets = JSON.parse(await fs.readFile(join(dataDir, 'drive_ticket.json'), 'utf8'));
    const collectList = JSON.parse(await fs.readFile(join(dataDir, 'drive_ticket_collect.json'), 'utf8'));
    
    console.log('开始测试便乘票补全逻辑...');
    console.log(`读取到 ${driveTickets.length} 条交路票`);
    console.log(`读取到 ${collectList.length} 个交路票夹`);

    // 测试出勤便乘票补全逻辑
    console.log('\n=== 测试出勤便乘票补全逻辑 ===');
    for (let i = 0; i < Math.min(3, collectList.length); i++) {
      const collect = collectList[i];
      console.log(`处理交路票夹 ${i+1}: ${collect.ticket_chain}`);
      const result = await completeAttendanceRideTickets(collect.ticket_chain, driveTickets, dataDir);
      console.log(`补全结果: ${result}`);
    }

    // 测试退勤便乘票补全逻辑
    console.log('\n=== 测试退勤便乘票补全逻辑 ===');
    for (let i = 0; i < Math.min(3, collectList.length); i++) {
      const collect = collectList[i];
      console.log(`处理交路票夹 ${i+1}: ${collect.ticket_chain}`);
      const result = await completeOffDutyRideTickets(collect.ticket_chain, driveTickets, dataDir);
      console.log(`补全结果: ${result}`);
    }

  } catch (error) {
    console.error('测试过程中发生错误:', error);
  }
}

// 将时间字符串转换为分钟数（用于时间比较）
function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

// 3.7 出勤便乘票补全逻辑
async function completeAttendanceRideTickets(ticketChain, driveTickets, dataDir) {
  try {
    // 读取便乘票数据
    let rideTickets = [];
    try {
      rideTickets = JSON.parse(await fs.readFile(join(dataDir, 'drive_ride_ticket.json'), 'utf8'));
    } catch (error) {
      console.warn('警告: 未找到便乘票数据，将跳过出勤便乘票补全');
      return ticketChain;
    }
    
    // 3.7.1 输入的参数字符串用"->"作为分隔符，把字符串分割成多个子字符串，每个子字符串表示一个交路票序号
    const ticketIds = ticketChain.split('->').map(id => parseInt(id));
    
    // 3.7.2 取出第一个子字符串，作为当前交路票序号
    const firstTicketId = ticketIds[0];
    const firstTicket = driveTickets.find(ticket => ticket.ticket_id === firstTicketId);
    
    if (!firstTicket) {
      return ticketChain;
    }
    
    // 3.7.3 从交路票数据表中，根据当前交路票序号，取出当前交路票的车次名称和上车站点名称
    const trainName = firstTicket.train_name;
    const startStation = firstTicket.start_station;
    
    console.log(`  交路票 ${firstTicketId}: 车次=${trainName}, 上车站点=${startStation}`);
    
    // 查询逻辑车站表，如果上车站点是出勤站点，则不做处理，直接返回输入的字符串
    const logicStations = JSON.parse(await fs.readFile(join(dataDir, 'cw_logic_station.json'), 'utf8'));
    const stations = JSON.parse(await fs.readFile(join(dataDir, 'cw_station.json'), 'utf8'));
    
    // 找到上车站点的ID
    const station = stations.find(s => s.station_name === startStation);
    if (!station) {
      console.log(`  未找到站点信息`);
      return ticketChain;
    }
    
    // 检查上车站点是否是出勤站点（station_type === 1）
    const isAttendanceStation = logicStations.some(ls => 
      ls.station_id === station.station_id && ls.station_type === 1);
    
    console.log(`  上车站点ID=${station.station_id}, 是否为出勤站点=${isAttendanceStation}`);
    
    if (isAttendanceStation) {
      // 如果上车站点是出勤站点，则不做处理，直接返回输入的字符串
      console.log(`  是出勤站点，无需补全`);
      return ticketChain;
    }
    
    console.log(`  不是出勤站点，需要补全`);
    
    // 如果上车站点不是出勤站点，则根据车次名称和下车站点名称，查询列车时刻表明细表，获得到达时间
    const trainSchedules = JSON.parse(await fs.readFile(join(dataDir, 'cw_train_schedule.json'), 'utf8'));
    const trainScheduleDetails = JSON.parse(await fs.readFile(join(dataDir, 'cw_train_schedule_detail.json'), 'utf8'));
    
    // 找到对应的车次时刻表
    const trainSchedule = trainSchedules.find(ts => ts.train_name === trainName);
    if (!trainSchedule) {
      console.log(`  未找到车次时刻表`);
      return ticketChain;
    }
    
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
    
    if (!startStationDetail) {
      console.log(`  未找到上车站点明细`);
      return ticketChain;
    }
    
    const arriveTime = startStationDetail.arrive_time;
    console.log(`  上车站到达时间=${arriveTime}`);
    
    // 查询便乘票表，获得下车站点为该下车站点，下车站到站时间早于该到达时间，但是差距最小的记录
    const validRideTickets = rideTickets.filter(rideTicket => 
      rideTicket.end_station === startStation && 
      rideTicket.dropoff_time <= arriveTime
    );
    
    console.log(`  找到 ${validRideTickets.length} 条符合条件的便乘票`);
    
    if (validRideTickets.length === 0) {
      return ticketChain;
    }
    
    // 按时间差排序，找到时间差最小的记录
    validRideTickets.sort((a, b) => {
      const timeDiffA = timeToMinutes(arriveTime) - timeToMinutes(a.dropoff_time);
      const timeDiffB = timeToMinutes(arriveTime) - timeToMinutes(b.dropoff_time);
      return timeDiffA - timeDiffB;
    });
    
    // 构建结果字符串
    let resultString = "";
    if (validRideTickets.length === 1) {
      // 只有一条记录
      resultString = `[出勤便]${validRideTickets[0].ride_id}`;
      console.log(`  找到便乘票: [出勤便]${validRideTickets[0].ride_id}`);
    } else {
      // 多条记录，格式为："[出勤便1]"串上第一条便乘票序号串上":"串上"[出勤便n]"串上第n条便乘票序号
      resultString = validRideTickets.map((ticket, index) => 
        `[出勤便${index + 1}]${ticket.ride_id}`
      ).join(':');
      console.log(`  找到多条便乘票: ${resultString}`);
    }
    
    // 3.7.4 返回字符串，字符串的值为：结果字符串串上"=>"再串上输入的字符串
    return `${resultString}=>${ticketChain}`;
  } catch (error) {
    console.error('出勤便乘票补全逻辑出错:', error);
    return ticketChain;
  }
}

// 3.8 退勤便乘票补全逻辑
async function completeOffDutyRideTickets(ticketChain, driveTickets, dataDir) {
  try {
    // 读取便乘票数据
    let rideTickets = [];
    try {
      rideTickets = JSON.parse(await fs.readFile(join(dataDir, 'drive_ride_ticket.json'), 'utf8'));
    } catch (error) {
      console.warn('警告: 未找到便乘票数据，将跳过退勤便乘票补全');
      return ticketChain;
    }
    
    // 3.8.1 输入的参数字符串用"->"作为分隔符，把字符串分割成多个子字符串，每个子字符串表示一个交路票序号
    const ticketIds = ticketChain.split('->').map(id => parseInt(id));
    
    // 3.8.2 取出最后一个子字符串，作为当前交路票序号
    const lastTicketId = ticketIds[ticketIds.length - 1];
    const lastTicket = driveTickets.find(ticket => ticket.ticket_id === lastTicketId);
    
    if (!lastTicket) {
      return ticketChain;
    }
    
    // 3.8.3 从交路票数据表中，根据当前交路票序号，取出当前交路票的车次名称和下车站点名称
    const trainName = lastTicket.train_name;
    const endStation = lastTicket.end_station;
    
    console.log(`  交路票 ${lastTicketId}: 车次=${trainName}, 下车站点=${endStation}`);
    
    // 查询逻辑车站表，如果下车站点是退勤站点，则不做处理，直接返回输入的字符串
    const logicStations = JSON.parse(await fs.readFile(join(dataDir, 'cw_logic_station.json'), 'utf8'));
    const stations = JSON.parse(await fs.readFile(join(dataDir, 'cw_station.json'), 'utf8'));
    
    // 找到下车站点的ID
    const station = stations.find(s => s.station_name === endStation);
    if (!station) {
      console.log(`  未找到站点信息`);
      return ticketChain;
    }
    
    // 检查下车站点是否是退勤站点（station_type === 2）
    const isOffDutyStation = logicStations.some(ls => 
      ls.station_id === station.station_id && ls.station_type === 2);
    
    console.log(`  下车站点ID=${station.station_id}, 是否为退勤站点=${isOffDutyStation}`);
    
    if (isOffDutyStation) {
      // 如果下车站点是退勤站点，则不做处理，直接返回输入的字符串
      console.log(`  是退勤站点，无需补全`);
      return ticketChain;
    }
    
    console.log(`  不是退勤站点，需要补全`);
    
    // 如果下车站点不是退勤站点，则根据车次名称和下车站点名称，查询列车时刻表明细表，获得到达时间
    const trainSchedules = JSON.parse(await fs.readFile(join(dataDir, 'cw_train_schedule.json'), 'utf8'));
    const trainScheduleDetails = JSON.parse(await fs.readFile(join(dataDir, 'cw_train_schedule_detail.json'), 'utf8'));
    
    // 找到对应的车次时刻表
    const trainSchedule = trainSchedules.find(ts => ts.train_name === trainName);
    if (!trainSchedule) {
      console.log(`  未找到车次时刻表`);
      return ticketChain;
    }
    
    // 获取该车次的所有站点明细并按到达时间升序排列
    const scheduleDetails = trainScheduleDetails
      .filter(detail => detail.train_schedule_id === trainSchedule.train_schedule_id)
      .sort((a, b) => a.arrive_time.localeCompare(b.arrive_time));
    
    // 查找下车站的到达时间
    const endStationDetail = scheduleDetails.find(
      detail => {
        const station = stations.find(s => s.station_id === detail.station_id);
        return station && station.station_name === endStation;
      }
    );
    
    if (!endStationDetail) {
      console.log(`  未找到下车站点明细`);
      return ticketChain;
    }
    
    const arriveTime = endStationDetail.arrive_time;
    console.log(`  下车站到达时间=${arriveTime}`);
    
    // 查询便乘票表，获得上车站点为该下车站点，上车站到站时间晚于该到达时间，但是差距最小的记录
    const validRideTickets = rideTickets.filter(rideTicket => 
      rideTicket.start_station === endStation && 
      rideTicket.pickup_time >= arriveTime
    );
    
    console.log(`  找到 ${validRideTickets.length} 条符合条件的便乘票`);
    
    if (validRideTickets.length === 0) {
      return ticketChain;
    }
    
    // 按时间差排序，找到时间差最小的记录
    validRideTickets.sort((a, b) => {
      const timeDiffA = timeToMinutes(a.pickup_time) - timeToMinutes(arriveTime);
      const timeDiffB = timeToMinutes(b.pickup_time) - timeToMinutes(arriveTime);
      return timeDiffA - timeDiffB;
    });
    
    // 构建结果字符串
    let resultString = "";
    if (validRideTickets.length === 1) {
      // 只有一条记录
      resultString = `[退勤便]${validRideTickets[0].ride_id}`;
      console.log(`  找到便乘票: [退勤便]${validRideTickets[0].ride_id}`);
    } else {
      // 多条记录，格式为："[退勤便1]"串上第一条便乘票序号串上":"串上"[退勤便n]"串上第n条便乘票序号
      resultString = validRideTickets.map((ticket, index) => 
        `[退勤便${index + 1}]${ticket.ride_id}`
      ).join(':');
      console.log(`  找到多条便乘票: ${resultString}`);
    }
    
    // 3.8.4 返回字符串，字符串的值为：输入的字符串串上"=>"再串上结果字符串
    return `${ticketChain}=>${resultString}`;
  } catch (error) {
    console.error('退勤便乘票补全逻辑出错:', error);
    return ticketChain;
  }
}

testRideTicketCompletion();