/**
 * 详细调试脚本：模拟completeOffDutyRideTickets函数的执行
 */

const API_BASE_URL = 'https://dt.xiaov.co';

function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

async function debugCompleteOffDutyFunction() {
  console.log('=== 详细调试completeOffDutyRideTickets函数 ===');

  // 获取所有必要数据
  const [driveTicketsResponse, rideTicketsResponse, logicStationsResponse, stationsResponse, trainSchedulesResponse, trainScheduleDetailsResponse] = await Promise.all([
    fetch(`${API_BASE_URL}/api/drive-tickets`),
    fetch(`${API_BASE_URL}/api/ride-tickets`),
    fetch(`${API_BASE_URL}/api/logic-stations`),
    fetch(`${API_BASE_URL}/api/stations`),
    fetch(`${API_BASE_URL}/api/train-schedules`),
    fetch(`${API_BASE_URL}/api/train-schedule-details`)
  ]);

  const driveTickets = await driveTicketsResponse.json();
  const rideTickets = await rideTicketsResponse.json();
  const logicStations = await logicStationsResponse.json();
  const stations = await stationsResponse.json();
  const trainSchedules = await trainSchedulesResponse.json();
  const trainScheduleDetails = await trainScheduleDetailsResponse.json();

  // 模拟输入：交路票夹序号6的ticketChain = "17"
  const ticketChain = "17";
  console.log(`输入ticketChain: "${ticketChain}"`);

  // 3.8.1 分割字符串
  const ticketIds = ticketChain.split('->').map(id => parseInt(id));
  console.log('分割后的ticketIds:', ticketIds);

  // 3.8.2 取最后一个交路票序号
  const lastTicketId = ticketIds[ticketIds.length - 1];
  console.log('lastTicketId:', lastTicketId);

  const lastTicket = driveTickets.find(ticket => ticket.ticket_id === lastTicketId);
  if (!lastTicket) {
    console.log('❌ 未找到交路票，返回原字符串');
    return;
  }
  console.log('✅ 找到交路票:', lastTicket);

  // 3.8.3 获取车次和下车站点
  const trainName = lastTicket.train_name;
  const endStation = lastTicket.end_station;
  console.log(`车次: ${trainName}, 下车站点: ${endStation}`);

  const station = stations.find(s => s.station_name === endStation);
  if (!station) {
    console.log('❌ 未找到车站信息，返回原字符串');
    return;
  }
  console.log('✅ 找到车站信息:', station);

  // 检查是否是退勤站点
  const isOffDutyStation = logicStations.some(ls => ls.station_id === station.station_id && ls.station_type === 2);
  console.log(`是否是退勤站点: ${isOffDutyStation}`);

  if (isOffDutyStation) {
    console.log('✅ 应该返回: [本地退勤]');
    return;
  }

  // 查询列车时刻表
  const trainSchedule = trainSchedules.find(ts => ts.train_name === trainName);
  if (!trainSchedule) {
    console.log('❌ 未找到列车时刻表，返回原字符串');
    return;
  }
  console.log('✅ 找到列车时刻表:', trainSchedule);

  // 查询列车时刻表明细
  const scheduleDetails = trainScheduleDetails
    .filter(detail => detail.train_schedule_id === trainSchedule.train_schedule_id)
    .sort((a, b) => (a.arrive_time || '').localeCompare(b.arrive_time || ''));

  console.log(`列车时刻表明细数量: ${scheduleDetails.length}`);

  const endStationDetail = scheduleDetails.find(detail => {
    const s = stations.find(st => st.station_id === detail.station_id);
    return s && s.station_name === endStation;
  });

  if (!endStationDetail) {
    console.log('❌ 未找到车站明细，返回原字符串');
    return;
  }
  console.log('✅ 找到车站明细:', endStationDetail);

  const arriveTime = endStationDetail.arrive_time;
  console.log(`到达时间: ${arriveTime}`);

  // 查询便乘票
  const validRideTickets = rideTickets.filter(rt =>
    rt.start_station === endStation && rt.pickup_time >= arriveTime
  );

  console.log(`符合条件的便乘票数量: ${validRideTickets.length}`);
  validRideTickets.forEach((ticket, index) => {
    console.log(`${index + 1}. 便乘票${ticket.ride_id}: ${ticket.pickup_time} -> ${ticket.end_station}`);
  });

  if (validRideTickets.length === 0) {
    console.log('✅ 应该返回: [滞留当地]');
    return;
  }

  // 按时间差距排序
  validRideTickets.sort((a, b) =>
    (timeToMinutes(a.pickup_time) - timeToMinutes(arriveTime)) -
    (timeToMinutes(b.pickup_time) - timeToMinutes(arriveTime))
  );

  console.log('按时间差距排序后的结果:');
  validRideTickets.forEach((ticket, index) => {
    const timeGap = timeToMinutes(ticket.pickup_time) - timeToMinutes(arriveTime);
    console.log(`${index + 1}. 便乘票${ticket.ride_id}: 时间差距${timeGap}分钟`);
  });

  let resultString = "";
  if (validRideTickets.length === 1) {
    resultString = `[退勤便]${validRideTickets[0].ride_id}`;
  } else {
    resultString = validRideTickets.map((t, i) => `[退勤便${i + 1}]${t.ride_id}`).join(':');
  }

  console.log(`✅ 最终结果: ${ticketChain}=>${resultString}`);
}

debugCompleteOffDutyFunction().catch(console.error);