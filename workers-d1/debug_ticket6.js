/**
 * 调试脚本：分析交路票夹序号6的退勤便乘票补全问题
 */

const API_BASE_URL = 'https://dt.xiaov.co';

async function debugTicketCollect6() {
  console.log('=== 调试交路票夹序号6 ===');

  // 1. 获取交路票17的信息
  console.log('\n1. 获取交路票17的信息...');
  const driveTicketsResponse = await fetch(`${API_BASE_URL}/api/drive-tickets`);
  const driveTickets = await driveTicketsResponse.json();
  const ticket17 = driveTickets.find(t => t.ticket_id === 17);

  if (ticket17) {
    console.log('交路票17信息:', {
      ticket_id: ticket17.ticket_id,
      train_name: ticket17.train_name,
      end_station: ticket17.end_station,
      dropoff_time: ticket17.dropoff_time
    });
  }

  // 2. 检查天安门西站是否是退勤站点
  console.log('\n2. 检查天安门西站是否是退勤站点...');
  const logicStationsResponse = await fetch(`${API_BASE_URL}/api/logic-stations`);
  const logicStations = await logicStationsResponse.json();
  const stationsResponse = await fetch(`${API_BASE_URL}/api/stations`);
  const stations = await stationsResponse.json();

  const tiananmenWestStation = stations.find(s => s.station_name === '天安门西站');
  console.log('天安门西站station_id:', tiananmenWestStation?.station_id);

  const isOffDutyStation = logicStations.some(ls =>
    ls.station_id === tiananmenWestStation?.station_id && ls.station_type === 2
  );
  console.log('是否是退勤站点:', isOffDutyStation);

  // 3. 查找符合条件的便乘票
  console.log('\n3. 查找从天安门西站出发，时间≥12:32:00的便乘票...');
  const rideTicketsResponse = await fetch(`${API_BASE_URL}/api/ride-tickets`);
  const rideTickets = await rideTicketsResponse.json();

  const targetTime = '12:32:00';
  const validRideTickets = rideTickets.filter(rt =>
    rt.start_station === '天安门西站' && rt.pickup_time >= targetTime
  );

  console.log('找到的便乘票数量:', validRideTickets.length);
  validRideTickets.forEach((ticket, index) => {
    console.log(`${index + 1}. 便乘票${ticket.ride_id}: ${ticket.pickup_time} -> ${ticket.end_station}`);
  });

  // 4. 手动验证算法逻辑
  console.log('\n4. 手动验证算法逻辑...');
  if (isOffDutyStation) {
    console.log('应该是: [本地退勤]');
  } else if (validRideTickets.length === 0) {
    console.log('应该是: [滞留当地]');
  } else {
    console.log('应该有退勤便乘票补全结果');
    if (validRideTickets.length === 1) {
      console.log(`格式: [退勤便]${validRideTickets[0].ride_id}`);
    } else {
      const result = validRideTickets.map((t, i) => `[退勤便${i + 1}]${t.ride_id}`).join(':');
      console.log(`格式: ${result}`);
    }
  }

  // 5. 检查当前实际结果
  console.log('\n5. 当前实际结果...');
  const collectResponse = await fetch(`${API_BASE_URL}/api/drive-ticket-collect`);
  const collects = await collectResponse.json();
  const collect6 = collects.find(c => c.collect_id === 6);
  console.log('交路票夹6实际结果:', collect6?.ticket_chain);

  // 6. 分析差异
  console.log('\n6. 分析问题...');
  if (!collect6?.ticket_chain.includes('=>')) {
    console.log('❌ 问题确认：没有执行退勤便乘票补全逻辑');
  } else {
    console.log('✅ 已执行退勤便乘票补全逻辑');
  }
}

debugTicketCollect6().catch(console.error);