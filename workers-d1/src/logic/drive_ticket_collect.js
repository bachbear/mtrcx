/**
 * 交路票夹生成逻辑 (Cloudflare Workers & D1 版本)
 * 
 * @param {object} DB - D1 数据库绑定
 * @returns {Promise<Array>} 生成的交路票夹数据
 */
export async function generateDriveTicketCollect(DB) {
  try {
    // 1. 从D1数据库读取所有必要的数据
    let { results: driveTickets } = await DB.prepare('SELECT * FROM drive_ticket').all();
    const { results: params } = await DB.prepare('SELECT * FROM drive_ticket_param').all();
    const { results: logicStations } = await DB.prepare('SELECT * FROM cw_logic_station').all();
    const { results: stations } = await DB.prepare('SELECT * FROM cw_station').all();
    const { results: trainSchedules } = await DB.prepare('SELECT * FROM cw_train_schedule').all();
    const { results: trainScheduleDetails } = await DB.prepare('SELECT * FROM cw_train_schedule_detail').all();
    let { results: rideTickets } = await DB.prepare('SELECT * FROM drive_ride_ticket').all();

    if (!driveTickets || !params || !logicStations || !stations || !trainSchedules || !trainScheduleDetails) {
      throw new Error("无法从数据库加载必要的数据。");
    }
    if (!rideTickets) rideTickets = []; // 如果没有便乘票数据，则设置为空数组

    // 3.2.1 把交路票数据表中的所有记录的is_sold字段设置为false
    driveTickets = driveTickets.map(ticket => ({
      ...ticket,
      is_sold: 0
    }));

    const paramMap = {};
    params.forEach(param => {
      paramMap[param.param_name] = {
        value: param.param_value,
        type: param.param_type,
        enabled: param.is_checked === 1
      };
    });

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

    const sortedTickets = [...driveTickets].sort((a, b) => 
      timeToMinutes(a.pickup_time) - timeToMinutes(b.pickup_time)
    );

    let unsoldTickets = [...sortedTickets];
    const collectList = [];
    let collectId = 1;

    while (unsoldTickets.some(ticket => ticket.is_sold === 0)) {
      const availableTickets = unsoldTickets.filter(ticket => ticket.is_sold === 0);
      if (availableTickets.length === 0) break;
      
      availableTickets.sort((a, b) => a.ticket_id - b.ticket_id);
      const firstTicket = availableTickets[0];
      
      firstTicket.is_sold = 1;
      unsoldTickets = unsoldTickets.map(ticket => 
        ticket.ticket_id === firstTicket.ticket_id ? {...ticket, is_sold: 1} : ticket
      );
      
      const currentCollect = [firstTicket];
      let currentState = {
        dropoffTime: firstTicket.dropoff_time,
        dropoffStation: firstTicket.end_station,
        currentTrain: firstTicket.train_name
      };

      let nextTicket;
      do {
        const availableUnsoldTickets = unsoldTickets.filter(ticket => ticket.is_sold === 0);
        nextTicket = findNextTicket(availableUnsoldTickets, currentState, changeInterval);
        
        if (nextTicket) {
          const shouldEnd = shouldEndCollect(currentCollect, nextTicket, {
            maxDriveTime, maxDriveTimeEnabled, earlyShiftStart, earlyShiftStartEnabled,
            earlyShiftEnd, earlyShiftEndEnabled, whiteShiftStart, whiteShiftStartEnabled,
            whiteShiftEnd, whiteShiftEndEnabled, nightShiftStart, nightShiftStartEnabled,
            nightShiftEnd, nightShiftEndEnabled, mandatoryReturnStation, mandatoryReturnStationEnabled
          });
          if (shouldEnd) break;

          currentCollect.push(nextTicket);
          nextTicket.is_sold = 1;
          unsoldTickets = unsoldTickets.map(ticket => 
            ticket.ticket_id === nextTicket.ticket_id ? {...ticket, is_sold: 1} : ticket
          );
          currentState = {
            dropoffTime: nextTicket.dropoff_time,
            dropoffStation: nextTicket.end_station,
            currentTrain: nextTicket.train_name
          };
        }
      } while (nextTicket);

      const ticketChain = currentCollect.map(ticket => ticket.ticket_id).join('->');
      
      collectList.push({
        id: collectId,
        collect_id: collectId,
        ticket_chain: ticketChain
      });

      collectId++;
    }

    const updatedDriveTickets = driveTickets.map(ticket => {
      const isSold = collectList.some(collect => 
        collect.ticket_chain.split('->').map(id => parseInt(id)).includes(ticket.ticket_id)
      );
      return { ...ticket, is_sold: isSold ? 1 : 0 };
    });

    for (let i = 0; i < collectList.length; i++) {
      const collect = collectList[i];
      collectList[i].ticket_chain = completeAttendanceRideTickets(collect.ticket_chain, driveTickets, rideTickets, logicStations, stations, trainSchedules, trainScheduleDetails);
    }

    for (let i = 0; i < collectList.length; i++) {
      const collect = collectList[i];
      collectList[i].ticket_chain = completeOffDutyRideTickets(collect.ticket_chain, driveTickets, rideTickets, logicStations, stations, trainSchedules, trainScheduleDetails);
    }

    return { collectList, updatedDriveTickets };
  } catch (error) {
    console.error('生成交路票夹时发生错误:', error);
    throw error;
  }
}

function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

function addMinutesToTime(timeStr, minutes) {
  const totalMinutes = timeToMinutes(timeStr) + minutes;
  const hours = Math.floor(totalMinutes / 60) % 24;
  const mins = totalMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

function findNextTicket(tickets, currentState, changeInterval) {
  if (currentState.currentTrain) {
    const sameTrainTickets = tickets.filter(ticket =>
      ticket.train_name === currentState.currentTrain &&
      ticket.start_station === currentState.dropoffStation &&
      timeToMinutes(ticket.pickup_time) >= timeToMinutes(currentState.dropoffTime) &&
      ticket.is_sold === 0
    );
    if (sameTrainTickets.length > 0) {
      sameTrainTickets.sort((a, b) => timeToMinutes(a.pickup_time) - timeToMinutes(b.pickup_time));
      return sameTrainTickets[0];
    }
  }

  const minPickupTime = addMinutesToTime(currentState.dropoffTime, changeInterval);
  const changeTrainTickets = tickets.filter(ticket =>
    ticket.start_station === currentState.dropoffStation &&
    timeToMinutes(ticket.pickup_time) >= timeToMinutes(minPickupTime) &&
    ticket.is_sold === 0
  );
  if (changeTrainTickets.length > 0) {
    changeTrainTickets.sort((a, b) => timeToMinutes(a.pickup_time) - timeToMinutes(b.pickup_time));
    return changeTrainTickets[0];
  }
  return null;
}

function shouldEndCollect(currentCollect, nextTicket, params) {
  const firstTicket = currentCollect[0];
  const nextPickupMinutes = timeToMinutes(nextTicket.pickup_time);
  const firstPickupMinutes = timeToMinutes(firstTicket.pickup_time);
  
  if (params.maxDriveTimeEnabled && nextPickupMinutes - firstPickupMinutes > params.maxDriveTime) return true;
  
  if (params.whiteShiftStartEnabled && params.earlyShiftEndEnabled && 
      timeToMinutes(nextTicket.dropoff_time) > timeToMinutes(params.whiteShiftStart) && 
      firstPickupMinutes > timeToMinutes(params.earlyShiftEnd) &&
      nextTicket.train_name !== firstTicket.train_name) return true;
  
  if (params.nightShiftStartEnabled && params.whiteShiftEndEnabled && 
      timeToMinutes(nextTicket.dropoff_time) > timeToMinutes(params.nightShiftStart) && 
      firstPickupMinutes > timeToMinutes(params.whiteShiftEnd) &&
      nextTicket.train_name !== firstTicket.train_name) return true;
  
  if (params.earlyShiftStartEnabled && params.nightShiftEndEnabled && 
      timeToMinutes(nextTicket.dropoff_time) > timeToMinutes(params.earlyShiftStart) && 
      firstPickupMinutes > timeToMinutes(params.nightShiftEnd) &&
      nextTicket.train_name !== firstTicket.train_name) return true;
  
  if (params.mandatoryReturnStationEnabled && params.mandatoryReturnStation && nextTicket.start_station === params.mandatoryReturnStation) return true;
  
  return false;
}

function completeAttendanceRideTickets(ticketChain, driveTickets, rideTickets, logicStations, stations, trainSchedules, trainScheduleDetails) {
  // 3.7.1 输入的参数字符串用"->"作为分隔符，把字符串分割成多个子字符串，每个子字符串表示一个交路票序号
  // 但如果字符串包含"=>"，说明已经有便乘票补全结果，我们需要只解析最后一部分
  let effectiveChain = ticketChain;
  if (ticketChain.includes('=>')) {
    // 取出最后一部分作为实际的交路票序号链
    effectiveChain = ticketChain.split('=>').pop();
  }

  const ticketIds = effectiveChain.split('->').map(id => parseInt(id));

  // 3.7.2 取出第一个子字符串，作为当前交路票序号
  const firstTicketId = ticketIds[0];
  const firstTicket = driveTickets.find(ticket => ticket.ticket_id === firstTicketId);
  if (!firstTicket) return ticketChain;

  // 3.7.3 从交路票数据表中，根据当前交路票序号，取出当前交路票的车次名称和上车站点名称
  const trainName = firstTicket.train_name;
  const startStation = firstTicket.start_station;
  const station = stations.find(s => s.station_name === startStation);
  if (!station) return ticketChain;

  // 查询逻辑车站表，如果上车站点是出勤站点，则构建结果字符串为"[本地出勤]"
  const isAttendanceStation = logicStations.some(ls => ls.station_id === station.station_id && ls.station_type === 1);
  if (isAttendanceStation) {
    return `[本地出勤]=>${ticketChain}`;
  }

  // 如果上车站点不是出勤站点，则根据车次名称和下车站点名称，查询列车时刻表明细表，获得到达时间
  const trainSchedule = trainSchedules.find(ts => ts.train_name === trainName);
  if (!trainSchedule) return ticketChain;

  const scheduleDetails = trainScheduleDetails
    .filter(detail => detail.train_schedule_id === trainSchedule.train_schedule_id)
    .sort((a, b) => (a.arrive_time || '').localeCompare(b.arrive_time || ''));

  const startStationDetail = scheduleDetails.find(detail => {
    const s = stations.find(st => st.station_id === detail.station_id);
    return s && s.station_name === startStation;
  });
  if (!startStationDetail) return ticketChain;

  const arriveTime = startStationDetail.arrive_time;

  // 查询便乘票表，获得下车站点为该下车站点，下车站到站时间早于该到达时间，但是差距最小的记录
  const validRideTickets = rideTickets.filter(rt => rt.end_station === startStation && rt.dropoff_time <= arriveTime);

  if (validRideTickets.length === 0) {
    // 如果查询结果为0条记录，则构建结果字符串为"[自行前往]"
    return `[自行前往]=>${ticketChain}`;
  }

  // 计算每个便乘票的时间差距（到达时间 - 便乘票到达时间）
  const rideTicketsWithGap = validRideTickets.map(ticket => ({
    ...ticket,
    timeGap: timeToMinutes(arriveTime) - timeToMinutes(ticket.dropoff_time)
  }));

  // 找到最小时间差距
  const minTimeGap = Math.min(...rideTicketsWithGap.map(t => t.timeGap));

  // 只筛选时间差距最小的便乘票
  const minimalGapTickets = rideTicketsWithGap.filter(t => t.timeGap === minTimeGap);

  let resultString = "";
  if (minimalGapTickets.length === 1) {
    // 构建结果字符串，格式为："[出勤便]"串上便乘票序号
    resultString = `[出勤便]${minimalGapTickets[0].ride_id}`;
  } else {
    // 如果有多条时间差距最小的记录，则构建结果字符串格式为："[出勤便1]"串上第一条便乘票序号串上":"串上"[出勤便n]"串上第n条便乘票序号
    resultString = minimalGapTickets.map((t, i) => `[出勤便${i + 1}]${t.ride_id}`).join(':');
  }

  // 3.7.4 返回字符串，字符串的值为：结果字符串串上"=>"再串上输入的字符串
  return `${resultString}=>${ticketChain}`;
}

function completeOffDutyRideTickets(ticketChain, driveTickets, rideTickets, logicStations, stations, trainSchedules, trainScheduleDetails) {
  // 3.8.1 输入的参数字符串用"->"作为分隔符，把字符串分割成多个子字符串，每个子字符串表示一个交路票序号
  // 但如果字符串包含"=>"，说明已经有便乘票补全结果，我们需要只解析最后一部分
  let effectiveChain = ticketChain;
  if (ticketChain.includes('=>')) {
    // 取出最后一部分作为实际的交路票序号链
    effectiveChain = ticketChain.split('=>').pop();
  }

  const ticketIds = effectiveChain.split('->').map(id => parseInt(id));

  // 3.8.2 取出最后一个子字符串，作为当前交路票序号
  const lastTicketId = ticketIds[ticketIds.length - 1];
  const lastTicket = driveTickets.find(ticket => ticket.ticket_id === lastTicketId);
  if (!lastTicket) return ticketChain;

  // 3.8.3 从交路票数据表中，根据当前交路票序号，取出当前交路票的车次名称和下车站点名称
  const trainName = lastTicket.train_name;
  const endStation = lastTicket.end_station;
  const station = stations.find(s => s.station_name === endStation);
  if (!station) return ticketChain;

  // 查询逻辑车站表，如果下车站点是退勤站点，则构建结果字符串为"[本地退勤]"
  const isOffDutyStation = logicStations.some(ls => ls.station_id === station.station_id && ls.station_type === 2);
  if (isOffDutyStation) {
    return `${ticketChain}=>[本地退勤]`;
  }

  // 如果下车站点不是退勤站点，则根据车次名称和下车站点名称，查询列车时刻表明细表，获得到达时间
  const trainSchedule = trainSchedules.find(ts => ts.train_name === trainName);
  if (!trainSchedule) return ticketChain;

  const scheduleDetails = trainScheduleDetails
    .filter(detail => detail.train_schedule_id === trainSchedule.train_schedule_id)
    .sort((a, b) => (a.arrive_time || '').localeCompare(b.arrive_time || ''));

  const endStationDetail = scheduleDetails.find(detail => {
    const s = stations.find(st => st.station_id === detail.station_id);
    return s && s.station_name === endStation;
  });
  if (!endStationDetail) return ticketChain;

  const arriveTime = endStationDetail.arrive_time;

  // 查询便乘票表，获得上车站点为该下车站点，上车站到站时间晚于该到达时间，但是差距最小的记录
  const validRideTickets = rideTickets.filter(rt => rt.start_station === endStation && rt.pickup_time >= arriveTime);

  if (validRideTickets.length === 0) {
    // 如果查询结果为0条记录，则构建结果字符串为"[滞留当地]"
    return `${ticketChain}=>[滞留当地]`;
  }

  // 计算每个便乘票的时间差距
  const rideTicketsWithGap = validRideTickets.map(ticket => ({
    ...ticket,
    timeGap: timeToMinutes(ticket.pickup_time) - timeToMinutes(arriveTime)
  }));

  // 找到最小时间差距
  const minTimeGap = Math.min(...rideTicketsWithGap.map(t => t.timeGap));

  // 只筛选时间差距最小的便乘票
  const minimalGapTickets = rideTicketsWithGap.filter(t => t.timeGap === minTimeGap);

  let resultString = "";
  if (minimalGapTickets.length === 1) {
    // 构建结果字符串，格式为："[退勤便]"串上便乘票序号
    resultString = `[退勤便]${minimalGapTickets[0].ride_id}`;
  } else {
    // 如果有多条时间差距最小的记录，则构建结果字符串格式为："[退勤便1]"串上第一条便乘票序号串上":"串上"[退勤便n]"串上第n条便乘票序号
    resultString = minimalGapTickets.map((t, i) => `[退勤便${i + 1}]${t.ride_id}`).join(':');
  }

  // 3.8.4 返回字符串，字符串的值为：输入的字符串串上"=>"再串上结果字符串
  // 如果输入字符串已经包含"=>"，我们需要在最后追加
  if (ticketChain.includes('=>')) {
    return `${ticketChain}=>${resultString}`;
  } else {
    return `${ticketChain}=>${resultString}`;
  }
}