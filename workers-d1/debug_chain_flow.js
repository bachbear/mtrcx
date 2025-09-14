/**
 * 调试ticket_chain在两个补全函数之间的传递
 */

const API_BASE_URL = 'https://dt.xiaov.co';

async function debugChainFlow() {
  console.log('=== 调试ticket_chain传递流程 ===');

  // 获取所有必要数据
  const [driveTicketsResponse, rideTicketsResponse, logicStationsResponse, stationsResponse, trainSchedulesResponse, trainScheduleDetailsResponse, collectResponse] = await Promise.all([
    fetch(`${API_BASE_URL}/api/drive-tickets`),
    fetch(`${API_BASE_URL}/api/ride-tickets`),
    fetch(`${API_BASE_URL}/api/logic-stations`),
    fetch(`${API_BASE_URL}/api/stations`),
    fetch(`${API_BASE_URL}/api/train-schedules`),
    fetch(`${API_BASE_URL}/api/train-schedule-details`),
    fetch(`${API_BASE_URL}/api/drive-ticket-collect`)
  ]);

  const driveTickets = await driveTicketsResponse.json();
  const rideTickets = await rideTicketsResponse.json();
  const logicStations = await logicStationsResponse.json();
  const stations = await stationsResponse.json();
  const trainSchedules = await trainSchedulesResponse.json();
  const trainScheduleDetails = await trainScheduleDetailsResponse.json();
  const collects = await collectResponse.json();

  // 查找交路票夹序号6
  const collect6 = collects.find(c => c.collect_id === 6);
  console.log('1. 交路票夹6的最终结果:', collect6?.ticket_chain);

  // 模拟初始状态
  const initialChain = "17";
  console.log('2. 初始ticket_chain:', initialChain);

  // 模拟出勤便乘票补全
  console.log('3. 执行出勤便乘票补全...');

  // 模拟completeAttendanceRideTickets函数
  const ticketIds = initialChain.split('->').map(id => parseInt(id));
  const firstTicketId = ticketIds[0];
  const firstTicket = driveTickets.find(ticket => ticket.ticket_id === firstTicketId);

  if (firstTicket) {
    const startStation = firstTicket.start_station;
    const station = stations.find(s => s.station_name === startStation);

    if (station) {
      const isAttendanceStation = logicStations.some(ls => ls.station_id === station.station_id && ls.station_type === 1);

      if (isAttendanceStation) {
        console.log('出勤站点检测结果: [本地出勤]');
        const afterAttendanceChain = `[本地出勤]=>${initialChain}`;
        console.log('4. 出勤补全后的ticket_chain:', afterAttendanceChain);

        // 模拟退勤便乘票补全
        console.log('5. 执行退勤便乘票补全...');

        // 这里是问题所在！我们需要解析已经包含"=>"的字符串
        const modifiedTicketIds = afterAttendanceChain.split('->').map(id => parseInt(id));
        console.log('尝试解析:', modifiedTicketIds);

        // 这会产生问题，因为"[本地出勤]"无法被parseInt转换！

        // 正确的做法应该是：只解析最后一部分
        const lastPart = afterAttendanceChain.split('=>').pop();
        console.log('应该解析最后一部分:', lastPart);

        const correctTicketIds = lastPart.split('->').map(id => parseInt(id));
        console.log('正确的解析结果:', correctTicketIds);
      }
    }
  }
}

debugChainFlow().catch(console.error);