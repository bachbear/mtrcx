import { promises as fs } from 'fs';
import { resolve, join } from 'path';

async function updateTicketCollectWithRideTickets() {
  try {
    const rootDir = resolve('.');
    const dataDir = join(rootDir, 'data');

    // 读取交路票和交路票夹数据
    const driveTickets = JSON.parse(await fs.readFile(join(dataDir, 'drive_ticket.json'), 'utf8'));
    let collectList = JSON.parse(await fs.readFile(join(dataDir, 'drive_ticket_collect.json'), 'utf8'));
    
    console.log(`读取到 ${driveTickets.length} 条交路票`);
    console.log(`读取到 ${collectList.length} 个交路票夹`);

    // 对每个交路票夹进行便乘票补全
    console.log('\n=== 开始便乘票补全 ===');
    
    // 3.2.6 出勤便乘票补全
    console.log('处理出勤便乘票补全...');
    for (let i = 0; i < collectList.length; i++) {
      const originalChain = collectList[i].ticket_chain;
      const result = await completeAttendanceRideTickets(originalChain, driveTickets, dataDir);
      collectList[i].ticket_chain = result;
      if (result !== originalChain) {
        console.log(`  交路票夹 ${i+1}: ${originalChain} -> ${result}`);
      }
    }

    // 3.2.7 退勤便乘票补全
    console.log('处理退勤便乘票补全...');
    for (let i = 0; i < collectList.length; i++) {
      const originalChain = collectList[i].ticket_chain;
      const result = await completeOffDutyRideTickets(originalChain, driveTickets, dataDir);
      collectList[i].ticket_chain = result;
      if (result !== originalChain) {
        console.log(`  交路票夹 ${i+1}: ${originalChain} -> ${result}`);
      }
    }

    // 保存更新后的交路票夹数据
    await fs.writeFile(
      join(dataDir, 'drive_ticket_collect.json'),
      JSON.stringify(collectList, null, 2),
      'utf8'
    );
    
    console.log('\n=== 更新完成 ===');
    console.log('生成的交路票夹:');
    collectList.forEach((collect, index) => {
      console.log(`${index+1}. ${collect.ticket_chain}`);
    });
    
    console.log('\n结果已保存到 data/drive_ticket_collect.json');
    
  } catch (error) {
    console.error('更新交路票夹时发生错误:', error);
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
    
    // 查询逻辑车站表，如果上车站点是出勤站点，则不做处理，直接返回输入的字符串
    const logicStations = JSON.parse(await fs.readFile(join(dataDir, 'cw_logic_station.json'), 'utf8'));
    const stations = JSON.parse(await fs.readFile(join(dataDir, 'cw_station.json'), 'utf8'));
    
    // 找到上车站点的ID
    const station = stations.find(s => s.station_name === startStation);
    if (!station) {
      return ticketChain;
    }
    
    // 检查上车站点是否是出勤站点（station_type === 1）
    const isAttendanceStation = logicStations.some(ls => 
      ls.station_id === station.station_id && ls.station_type === 1);
    
    if (isAttendanceStation) {
      // 如果上车站点是出勤站点，则不做处理，直接返回输入的字符串
      return ticketChain;
    }
    
    // 如果上车站点不是出勤站点，则根据车次名称和下车站点名称，查询列车时刻表明细表，获得到达时间
    const trainSchedules = JSON.parse(await fs.readFile(join(dataDir, 'cw_train_schedule.json'), 'utf8'));
    const trainScheduleDetails = JSON.parse(await fs.readFile(join(dataDir, 'cw_train_schedule_detail.json'), 'utf8'));
    
    // 找到对应的车次时刻表
    const trainSchedule = trainSchedules.find(ts => ts.train_name === trainName);
    if (!trainSchedule) {
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
      return ticketChain;
    }
    
    const arriveTime = startStationDetail.arrive_time;
    
    // 查询便乘票表，获得下车站点为该下车站点，下车站到站时间早于该到达时间，但是差距最小的记录
    const validRideTickets = rideTickets.filter(rideTicket => 
      rideTicket.end_station === startStation && 
      rideTicket.dropoff_time <= arriveTime
    );
    
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
    } else {
      // 多条记录，格式为："[出勤便1]"串上第一条便乘票序号串上":"串上"[出勤便n]"串上第n条便乘票序号
      resultString = validRideTickets.map((ticket, index) => 
        `[出勤便${index + 1}]${ticket.ride_id}`
      ).join(':');
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
    
    // 查询逻辑车站表，如果下车站点是退勤站点，则不做处理，直接返回输入的字符串
    const logicStations = JSON.parse(await fs.readFile(join(dataDir, 'cw_logic_station.json'), 'utf8'));
    const stations = JSON.parse(await fs.readFile(join(dataDir, 'cw_station.json'), 'utf8'));
    
    // 找到下车站点的ID
    const station = stations.find(s => s.station_name === endStation);
    if (!station) {
      return ticketChain;
    }
    
    // 检查下车站点是否是退勤站点（station_type === 2）
    const isOffDutyStation = logicStations.some(ls => 
      ls.station_id === station.station_id && ls.station_type === 2);
    
    if (isOffDutyStation) {
      // 如果下车站点是退勤站点，则不做处理，直接返回输入的字符串
      return ticketChain;
    }
    
    // 如果下车站点不是退勤站点，则根据车次名称和下车站点名称，查询列车时刻表明细表，获得到达时间
    const trainSchedules = JSON.parse(await fs.readFile(join(dataDir, 'cw_train_schedule.json'), 'utf8'));
    const trainScheduleDetails = JSON.parse(await fs.readFile(join(dataDir, 'cw_train_schedule_detail.json'), 'utf8'));
    
    // 找到对应的车次时刻表
    const trainSchedule = trainSchedules.find(ts => ts.train_name === trainName);
    if (!trainSchedule) {
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
      return ticketChain;
    }
    
    const arriveTime = endStationDetail.arrive_time;
    
    // 查询便乘票表，获得上车站点为该下车站点，上车站到站时间晚于该到达时间，但是差距最小的记录
    const validRideTickets = rideTickets.filter(rideTicket => 
      rideTicket.start_station === endStation && 
      rideTicket.pickup_time >= arriveTime
    );
    
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
    } else {
      // 多条记录，格式为："[退勤便1]"串上第一条便乘票序号串上":"串上"[退勤便n]"串上第n条便乘票序号
      resultString = validRideTickets.map((ticket, index) => 
        `[退勤便${index + 1}]${ticket.ride_id}`
      ).join(':');
    }
    
    // 3.8.4 返回字符串，字符串的值为：输入的字符串串上"=>"再串上结果字符串
    return `${ticketChain}=>${resultString}`;
  } catch (error) {
    console.error('退勤便乘票补全逻辑出错:', error);
    return ticketChain;
  }
}

updateTicketCollectWithRideTickets();