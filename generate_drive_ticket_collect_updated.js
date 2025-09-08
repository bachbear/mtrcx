import { promises as fs } from 'fs';
import { resolve, join } from 'path';

// 交路票夹生成主函数
async function generateDriveTicketCollect() {
  try {
    const rootDir = resolve('.');
    const dataDir = join(rootDir, 'data');

    // 读取所有必要的数据文件
    let driveTickets = JSON.parse(await fs.readFile(join(dataDir, 'drive_ticket.json'), 'utf8'));
    const params = JSON.parse(await fs.readFile(join(dataDir, 'drive_ticket_param.json'), 'utf8'));

    console.log(`开始生成交路票夹，共有 ${driveTickets.length} 条交路票`);

    // 3.2.1 把交路票数据表中的所有记录的is_sold字段设置为false
    driveTickets = driveTickets.map(ticket => ({
      ...ticket,
      is_sold: false
    }));

    // 将参数转换为易于使用的格式
    const paramMap = {};
    params.forEach(param => {
      paramMap[param.param_name] = {
        value: param.param_value,
        type: param.param_type,
        enabled: param.is_checked
      };
    });

    // 获取业务参数值（带默认值）和启用状态
    const changeInterval = parseInt(paramMap['变更车次间隔时间']?.value.split(':')[1] || '30');
    const maxDriveTime = timeToMinutes(paramMap['最大开车时间']?.value || '24:00:00');
    const maxDriveTimeEnabled = paramMap['最大开车时间']?.enabled || false;
    const earlyShiftStart = paramMap['早班接车时间']?.value || '04:00:00';
    const earlyShiftStartEnabled = paramMap['早班接车时间']?.enabled || false;
    const earlyShiftEnd = paramMap['早班退车时间']?.value || '11:00:00';
    const earlyShiftEndEnabled = paramMap['早班退车时间']?.enabled || false;
    const whiteShiftStart = paramMap['白班接车时间']?.value || '11:00:00';
    const whiteShiftStartEnabled = paramMap['白班接车时间']?.enabled || false;
    const whiteShiftEnd = paramMap['白班退车时间']?.value || '16:00:00';
    const whiteShiftEndEnabled = paramMap['白班退车时间']?.enabled || false;
    const nightShiftStart = paramMap['夜班接车时间']?.value || '16:00:00';
    const nightShiftStartEnabled = paramMap['夜班接车时间']?.enabled || false;
    const nightShiftEnd = paramMap['夜班退车时间']?.value || '22:00:00';
    const nightShiftEndEnabled = paramMap['夜班退车时间']?.enabled || false;
    const mandatoryReturnStation = paramMap['强制回程站点']?.value || '';
    const mandatoryReturnStationEnabled = paramMap['强制回程站点']?.enabled || false;

    // 按接车站到站时间排序，用于挑选逻辑
    const sortedTickets = [...driveTickets].sort((a, b) => 
      timeToMinutes(a.pickup_time) - timeToMinutes(b.pickup_time)
    );

    // 创建一个映射以便快速查找ticket
    const ticketMap = {};
    sortedTickets.forEach(ticket => {
      ticketMap[ticket.ticket_id] = ticket;
    });

    // 创建一个新的数组用于标记未售出的票
    let unsoldTickets = [...sortedTickets];
    const collectList = [];
    let collectId = 1;

    // 主循环：生成交路票夹直到所有票都被处理
    while (unsoldTickets.some(ticket => !ticket.is_sold)) {
      // 3.2.1 交路票挑选逻辑：选择未售出且序号最小的票作为起始
      // 过滤出未售出的票并按ticket_id排序
      const availableTickets = unsoldTickets.filter(ticket => !ticket.is_sold);
      if (availableTickets.length === 0) {
        break;
      }
      
      // 按ticket_id排序选择最小的
      availableTickets.sort((a, b) => a.ticket_id - b.ticket_id);
      const firstTicket = availableTickets[0];
      
      // 标记为已售出
      firstTicket.is_sold = true;
      // 更新unsoldTickets数组
      unsoldTickets = unsoldTickets.map(ticket => 
        ticket.ticket_id === firstTicket.ticket_id ? {...ticket, is_sold: true} : ticket
      );
      console.log(`选择起始票: ${firstTicket.ticket_id}, 车次: ${firstTicket.train_name}, 站点: ${firstTicket.start_station} -> ${firstTicket.end_station}`);
      
      const currentCollect = [firstTicket];
      let currentState = {
        dropoffTime: firstTicket.dropoff_time,
        dropoffStation: firstTicket.end_station,
        currentTrain: firstTicket.train_name
      };

      // 3.2.3 调用"交路票串联逻辑"，挑选下一张交路票；如果无法选出下一张交路票，则更新保存交路票序号链；
      let nextTicket;
      do {
        // 只从未售出的票中寻找下一个票
        const availableUnsoldTickets = unsoldTickets.filter(ticket => !ticket.is_sold);
        nextTicket = findNextTicket(availableUnsoldTickets, currentState, changeInterval);
        
        if (nextTicket) {
          // 3.2.4 调用"交路截止逻辑"，把3.2.2产生的交路票序号链和3.2.3产生的交路票作为输入参数，判断是否需要继续挑选下一张交路票
          // 如果交路截止逻辑返回true，表示应该结束当前交路票夹，则退出循环
          const shouldEnd = shouldEndCollect(currentCollect, nextTicket, {
            maxDriveTime: maxDriveTime,
            maxDriveTimeEnabled: maxDriveTimeEnabled,
            earlyShiftStart,
            earlyShiftStartEnabled: earlyShiftStartEnabled,
            earlyShiftEnd,
            earlyShiftEndEnabled: earlyShiftEndEnabled,
            whiteShiftStart,
            whiteShiftStartEnabled: whiteShiftStartEnabled,
            whiteShiftEnd,
            whiteShiftEndEnabled: whiteShiftEndEnabled,
            nightShiftStart,
            nightShiftStartEnabled: nightShiftStartEnabled,
            nightShiftEnd,
            nightShiftEndEnabled: nightShiftEndEnabled,
            mandatoryReturnStation,
            mandatoryReturnStationEnabled: mandatoryReturnStationEnabled
          });
          if (shouldEnd) {
            console.log(`截止逻辑返回true，结束链条。当前链条: [${currentCollect.map(t => t.ticket_id).join(', ')}], 下一张票: ${nextTicket.ticket_id}`);
            break;
          }

          // 如果交路截止逻辑返回false，表示不需要结束当前交路票夹，继续添加当前交路票到链条中
          currentCollect.push(nextTicket);
          // 标记为已售出
          nextTicket.is_sold = true;
          // 更新unsoldTickets数组
          unsoldTickets = unsoldTickets.map(ticket => 
            ticket.ticket_id === nextTicket.ticket_id ? {...ticket, is_sold: true} : ticket
          );
          console.log(`添加票到链条: ${nextTicket.ticket_id}, 车次: ${nextTicket.train_name}, 站点: ${nextTicket.start_station} -> ${nextTicket.end_station}`);
          // 更新状态以便继续寻找下一张票
          currentState = {
            dropoffTime: nextTicket.dropoff_time,
            dropoffStation: nextTicket.end_station,
            currentTrain: nextTicket.train_name
          };
        }
      } while (nextTicket);

      // 生成ticket_chain（用'->'连接交路票序号）
      const ticketChain = currentCollect.map(ticket => ticket.ticket_id).join('->');
      
      // 添加到交路票夹列表
      collectList.push({
        id: collectId,
        collect_id: collectId,
        ticket_chain: ticketChain
      });

      collectId++;
    }

    console.log(`生成了 ${collectList.length} 个交路票夹`);

    // 3.2.4 更新交路票的is_sold状态
    const updatedDriveTickets = driveTickets.map(ticket => {
      // 检查该票是否在任何collect中
      const isSold = collectList.some(collect => 
        collect.ticket_chain.split('->').map(id => parseInt(id)).includes(ticket.ticket_id)
      );
      return {
        ...ticket,
        is_sold: isSold
      };
    });

    // 3.2.6 按交路票夹记录序号，升序遍历所有交路票夹记录，取出当前交路票夹记录中的交路票序号链，作为输入参数传给"出勤便乘票补全逻辑"
    console.log('开始出勤便乘票补全...');
    for (let i = 0; i < collectList.length; i++) {
      const collect = collectList[i];
      const result = await completeAttendanceRideTickets(collect.ticket_chain, driveTickets, dataDir);
      collectList[i].ticket_chain = result;
      if (result !== collect.ticket_chain) {
        console.log(`交路票夹 ${i+1} 出勤便乘票补全: ${collect.ticket_chain} -> ${result}`);
      }
    }

    // 3.2.7 按交路票夹记录序号，升序遍历所有交路票夹记录，取出当前交路票夹记录中的交路票序号链，作为输入参数传给"退勤便乘票补全逻辑"
    console.log('开始退勤便乘票补全...');
    for (let i = 0; i < collectList.length; i++) {
      const collect = collectList[i];
      const result = await completeOffDutyRideTickets(collect.ticket_chain, driveTickets, dataDir);
      collectList[i].ticket_chain = result;
      if (result !== collect.ticket_chain) {
        console.log(`交路票夹 ${i+1} 退勤便乘票补全: ${collect.ticket_chain} -> ${result}`);
      }
    }

    // 保存结果到文件
    await fs.writeFile(
      join(dataDir, 'drive_ticket_collect.json'),
      JSON.stringify(collectList, null, 2),
      'utf8'
    );

    await fs.writeFile(
      join(dataDir, 'drive_ticket.json'),
      JSON.stringify(updatedDriveTickets, null, 2),
      'utf8'
    );

    console.log(`成功生成 ${collectList.length} 个交路票夹，共处理 ${updatedDriveTickets.length} 条交路票`);
    console.log('结果已保存到 data/drive_ticket_collect.json 和 data/drive_ticket.json');
    
    // 显示前几个交路票夹作为示例
    console.log('\n生成的交路票夹示例:');
    collectList.slice(0, 5).forEach((collect, index) => {
      console.log(`${index+1}. ${collect.ticket_chain}`);
    });
    
    return collectList;
  } catch (error) {
    console.error('生成交路票夹时发生错误:', error);
    throw error;
  }
}

// 将时间字符串转换为分钟数（用于时间比较）
function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

// 添加分钟到时间字符串
function addMinutesToTime(timeStr, minutes) {
  const totalMinutes = timeToMinutes(timeStr) + minutes;
  const hours = Math.floor(totalMinutes / 60) % 24;
  const mins = totalMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

// 交路票串联逻辑：找到下一张合适的交路票
function findNextTicket(tickets, currentState, changeInterval) {
  // 3.4.2-3.4.3：优先寻找相同车次的后续交路票
  if (currentState.currentTrain) {
    const sameTrainTickets = tickets.filter(ticket =>
      ticket.train_name === currentState.currentTrain &&
      ticket.start_station === currentState.dropoffStation &&  // 确保站点连续
      timeToMinutes(ticket.pickup_time) >= timeToMinutes(currentState.dropoffTime) &&
      !ticket.is_sold  // 只考虑未售出的票
    );

    if (sameTrainTickets.length > 0) {
      // 按接车站到站时间排序取最早的一张
      sameTrainTickets.sort((a, b) => 
        timeToMinutes(a.pickup_time) - timeToMinutes(b.pickup_time)
      );
      return sameTrainTickets[0];
    }
  }

  // 3.4.5：寻找换乘的交路票（相同站点，考虑休息间隔）
  const minPickupTime = addMinutesToTime(currentState.dropoffTime, changeInterval);
  const changeTrainTickets = tickets.filter(ticket =>
    ticket.start_station === currentState.dropoffStation &&
    timeToMinutes(ticket.pickup_time) >= timeToMinutes(minPickupTime) &&
    !ticket.is_sold  // 只考虑未售出的票
  );

  if (changeTrainTickets.length > 0) {
    changeTrainTickets.sort((a, b) => 
      timeToMinutes(a.pickup_time) - timeToMinutes(b.pickup_time)
    );
    return changeTrainTickets[0];
  }

  return null;
}

// 交路截止逻辑：判断是否应该结束当前交路票夹
function shouldEndCollect(currentCollect, nextTicket, params) {
  const firstTicket = currentCollect[0];
  const nextPickupMinutes = timeToMinutes(nextTicket.pickup_time);
  const firstPickupMinutes = timeToMinutes(firstTicket.pickup_time);
  
  // 3.5.1.1：当前交路票的接车站到站时间与当前交路票链的第一张交路票的接车站到站时间间隔超过"最大开车时间"参数
  // (只有当"最大开车时间"参数启用时才应用此规则)
  if (params.maxDriveTimeEnabled && nextPickupMinutes - firstPickupMinutes > params.maxDriveTime) {
    console.log(`截止原因1: 时间间隔超过最大开车时间。当前票接车时间: ${nextTicket.pickup_time}, 第一张票接车时间: ${firstTicket.pickup_time}, 间隔: ${nextPickupMinutes - firstPickupMinutes}, 最大开车时间: ${params.maxDriveTime}`);
    return true;
  }
  
  // 3.5.1.2：当前交路票的退车站到站时间超过"白班接车时间"参数并且当前交路票链的第一张交路票的接车站到站时间超过"早班退车时间"参数
  // (只有当相关参数都启用时才应用此规则)
  // 修改：放宽条件，允许同一车次的连续票串联
  if (params.whiteShiftStartEnabled && params.earlyShiftEndEnabled && 
      timeToMinutes(nextTicket.dropoff_time) > timeToMinutes(params.whiteShiftStart) && 
      firstPickupMinutes > timeToMinutes(params.earlyShiftEnd) &&
      nextTicket.train_name !== firstTicket.train_name) {  // 只有不同车次时才应用此规则
    console.log(`截止原因2: 白班接车时间规则。当前票退车时间: ${nextTicket.dropoff_time}, 白班接车时间: ${params.whiteShiftStart}, 第一张票接车时间: ${firstTicket.pickup_time}, 早班退车时间: ${params.earlyShiftEnd}`);
    return true;
  }
  
  // 3.5.1.3：当前交路票的退车站到站时间超过"夜班接车时间"参数并且当前交路票链的第一张交路票的接车站到站时间超过"白班退车时间"参数
  // (只有当相关参数都启用时才应用此规则)
  // 修改：放宽条件，允许同一车次的连续票串联
  if (params.nightShiftStartEnabled && params.whiteShiftEndEnabled && 
      timeToMinutes(nextTicket.dropoff_time) > timeToMinutes(params.nightShiftStart) && 
      firstPickupMinutes > timeToMinutes(params.whiteShiftEnd) &&
      nextTicket.train_name !== firstTicket.train_name) {  // 只有不同车次时才应用此规则
    console.log(`截止原因3: 夜班接车时间规则。当前票退车时间: ${nextTicket.dropoff_time}, 夜班接车时间: ${params.nightShiftStart}, 第一张票接车时间: ${firstTicket.pickup_time}, 白班退车时间: ${params.whiteShiftEnd}`);
    return true;
  }
  
  // 3.5.1.4：当前交路票的退车站到站时间超过"早班接车时间"参数并且当前交路票链的第一张交路票的接车站到站时间超过"夜班退车时间"参数
  // (只有当相关参数都启用时才应用此规则)
  // 修改：放宽条件，允许同一车次的连续票串联
  if (params.earlyShiftStartEnabled && params.nightShiftEndEnabled && 
      timeToMinutes(nextTicket.dropoff_time) > timeToMinutes(params.earlyShiftStart) && 
      firstPickupMinutes > timeToMinutes(params.nightShiftEnd) &&
      nextTicket.train_name !== firstTicket.train_name) {  // 只有不同车次时才应用此规则
    console.log(`截止原因4: 早班接车时间规则。当前票退车时间: ${nextTicket.dropoff_time}, 早班接车时间: ${params.earlyShiftStart}, 第一张票接车时间: ${firstTicket.pickup_time}, 夜班退车时间: ${params.nightShiftEnd}`);
    return true;
  }
  
  // 3.5.1.5：当前交路票的接车站等于"强制回程站点"参数
  // (只有当"强制回程站点"参数启用时才应用此规则)
  if (params.mandatoryReturnStationEnabled && params.mandatoryReturnStation && nextTicket.start_station === params.mandatoryReturnStation) {
    console.log(`截止原因5: 强制回程站点规则。当前票接车站: ${nextTicket.start_station}, 强制回程站点: ${params.mandatoryReturnStation}`);
    return true;
  }
  
  return false;
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

// 如果直接运行此脚本，则执行生成交路票夹的函数
if (import.meta.url === `file://${resolve(import.meta.url)}`) {
  generateDriveTicketCollect().then(() => {
    console.log('交路票夹生成完成');
  }).catch(err => {
    console.error('交路票夹生成失败:', err);
  });
}

// 导出生成交路票夹的函数
export { generateDriveTicketCollect };