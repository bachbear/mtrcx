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
  const ticketIds = ticketChain.split('->').map(id => parseInt(id));
  const firstTicketId = ticketIds[0];
  const firstTicket = driveTickets.find(ticket => ticket.ticket_id === firstTicketId);
  if (!firstTicket) return ticketChain;

  const trainName = firstTicket.train_name;
  const startStation = firstTicket.start_station;
  const station = stations.find(s => s.station_name === startStation);
  if (!station) return ticketChain;

  const isAttendanceStation = logicStations.some(ls => ls.station_id === station.station_id && ls.station_type === 1);
  if (isAttendanceStation) return ticketChain;

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
  const validRideTickets = rideTickets.filter(rt => rt.end_station === startStation && rt.dropoff_time <= arriveTime);
  if (validRideTickets.length === 0) return ticketChain;

  validRideTickets.sort((a, b) => (timeToMinutes(arriveTime) - timeToMinutes(a.dropoff_time)) - (timeToMinutes(arriveTime) - timeToMinutes(b.dropoff_time)));

  let resultString = "";
  if (validRideTickets.length === 1) {
    resultString = `[出勤便]${validRideTickets[0].ride_id}`;
  } else {
    resultString = validRideTickets.map((t, i) => `[出勤便${i + 1}]${t.ride_id}`).join(':');
  }
  return `${resultString}=>${ticketChain}`;
}

function completeOffDutyRideTickets(ticketChain, driveTickets, rideTickets, logicStations, stations, trainSchedules, trainScheduleDetails) {
  const ticketIds = ticketChain.split('->').map(id => parseInt(id));
  const lastTicketId = ticketIds[ticketIds.length - 1];
  const lastTicket = driveTickets.find(ticket => ticket.ticket_id === lastTicketId);
  if (!lastTicket) return ticketChain;

  const trainName = lastTicket.train_name;
  const endStation = lastTicket.end_station;
  const station = stations.find(s => s.station_name === endStation);
  if (!station) return ticketChain;

  const isOffDutyStation = logicStations.some(ls => ls.station_id === station.station_id && ls.station_type === 2);
  if (isOffDutyStation) return ticketChain;

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
  const validRideTickets = rideTickets.filter(rt => rt.start_station === endStation && rt.pickup_time >= arriveTime);
  if (validRideTickets.length === 0) return ticketChain;

  validRideTickets.sort((a, b) => (timeToMinutes(a.pickup_time) - timeToMinutes(arriveTime)) - (timeToMinutes(b.pickup_time) - timeToMinutes(arriveTime)));

  let resultString = "";
  if (validRideTickets.length === 1) {
    resultString = `[退勤便]${validRideTickets[0].ride_id}`;
  } else {
    resultString = validRideTickets.map((t, i) => `[退勤便${i + 1}]${t.ride_id}`).join(':');
  }
  return `${ticketChain}=>${resultString}`;
}