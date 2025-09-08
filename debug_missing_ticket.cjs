const fs = require('fs');

// 读取数据
const trainSchedules = JSON.parse(fs.readFileSync('./data/cw_train_schedule.json', 'utf8'));
const trainScheduleDetails = JSON.parse(fs.readFileSync('./data/cw_train_schedule_detail.json', 'utf8'));
const logicStations = JSON.parse(fs.readFileSync('./data/cw_logic_station.json', 'utf8'));
const stations = JSON.parse(fs.readFileSync('./data/cw_station.json', 'utf8'));

console.log('=== 分析缺失的西直门站到天安门西站便乘票 ===');

// 创建station_id到station_name的映射
const stationMap = {};
for (const station of stations) {
  stationMap[station.station_id] = station.station_name;
}

// 查找西直门站和天安门西站的ID
const xizhimenId = stations.find(s => s.station_name === '西直门站').station_id;
const tiananmenxiId = stations.find(s => s.station_name === '天安门西站').station_id;

console.log('西直门站ID:', xizhimenId);
console.log('天安门西站ID:', tiananmenxiId);

// 检查它们在逻辑车站中的类型
const xizhimenLogic = logicStations.filter(ls => ls.station_id === xizhimenId);
const tiananmenxiLogic = logicStations.filter(ls => ls.station_id === tiananmenxiId);

console.log('西直门站逻辑类型:', xizhimenLogic);
console.log('天安门西站逻辑类型:', tiananmenxiLogic);

// 检查所有车次，看是否有西直门站到天安门西站的路径
trainSchedules.forEach(schedule => {
  const trainScheduleId = schedule.train_schedule_id;
  
  // 获取该车次的所有站点明细并按到达时间升序排列
  const scheduleDetails = trainScheduleDetails
    .filter(detail => detail.train_schedule_id === trainScheduleId)
    .sort((a, b) => a.arrive_time.localeCompare(b.arrive_time));
  
  // 查找西直门站和天安门西站的位置
  let xizhimenIndex = -1;
  let tiananmenxiIndex = -1;
  
  for (let i = 0; i < scheduleDetails.length; i++) {
    const detail = scheduleDetails[i];
    if (detail.station_id === xizhimenId) {
      xizhimenIndex = i;
    }
    if (detail.station_id === tiananmenxiId) {
      tiananmenxiIndex = i;
    }
  }
  
  if (xizhimenIndex !== -1 && tiananmenxiIndex !== -1 && xizhimenIndex < tiananmenxiIndex) {
    console.log('车次', schedule.train_name, '包含西直门站到天安门西站的路径');
    console.log('  西直门站索引:', xizhimenIndex, '时间:', scheduleDetails[xizhimenIndex].arrive_time);
    console.log('  天安门西站索引:', tiananmenxiIndex, '时间:', scheduleDetails[tiananmenxiIndex].arrive_time);
    
    // 检查西直门站是否是出勤站点
    const isAttendanceStation = logicStations.some(ls => 
      ls.station_id === xizhimenId && ls.station_type === 1);
    console.log('  西直门站是出勤站点:', isAttendanceStation);
    
    // 检查天安门西站是否是接车站点或末站
    const isPickupStation = logicStations.some(ls => 
      ls.station_id === tiananmenxiId && ls.station_type === 3);
    const isLastStation = (tiananmenxiIndex === scheduleDetails.length - 1);
    console.log('  天安门西站是接车站点:', isPickupStation);
    console.log('  天安门西站是末站:', isLastStation);
    
    if (isAttendanceStation && (isPickupStation || isLastStation)) {
      console.log('  ✓ 应该生成便乘票:', schedule.train_name, '西直门站 -> 天安门西站');
    } else {
      console.log('  ✗ 不满足生成条件');
    }
  }
});