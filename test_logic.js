// 测试程序来理解算法逻辑
const fs = require('fs');
const path = require('path');

function testLogic() {
  const dataDir = './data';
  
  const trainSchedules = JSON.parse(fs.readFileSync(path.join(dataDir, 'cw_train_schedule.json'), 'utf8'));
  const trainScheduleDetails = JSON.parse(fs.readFileSync(path.join(dataDir, 'cw_train_schedule_detail.json'), 'utf8'));
  const logicStations = JSON.parse(fs.readFileSync(path.join(dataDir, 'cw_logic_station.json'), 'utf8'));
  const stations = JSON.parse(fs.readFileSync(path.join(dataDir, 'cw_station.json'), 'utf8'));
  
  // 创建station_id到station_name的映射
  const stationMap = {};
  for (const station of stations) {
    stationMap[station.station_id] = station.station_name;
  }
  
  console.log('=== 数据分析 ===');
  console.log('车站映射:', stationMap);
  console.log('逻辑车站:', logicStations);
  
  // 分析第一个车次
  const firstSchedule = trainSchedules[0];
  console.log('\n第一个车次:', firstSchedule.train_name);
  
  const scheduleDetails = trainScheduleDetails.filter(d => d.train_schedule_id === firstSchedule.train_schedule_id);
  console.log('站点明细:');
  scheduleDetails.forEach((detail, i) => {
    console.log(`  ${i}: ${stationMap[detail.station_id]} (${detail.station_id})`);
  });
  
  // 找出所有出勤站点（station_type === 1）
  console.log('\n=== 出勤站点分析 ===');
  const attendanceStations = [];
  for (let i = 0; i < scheduleDetails.length; i++) {
    const detail = scheduleDetails[i];
    const isAttendanceStation = logicStations.some(ls => 
      ls.station_id === detail.station_id && ls.station_type === 1);
    if (isAttendanceStation) {
      attendanceStations.push({
        index: i,
        stationId: detail.station_id,
        stationName: stationMap[detail.station_id],
        arriveTime: detail.arrive_time
      });
      console.log(`出勤站点: ${stationMap[detail.station_id]} (索引 ${i})`);
    }
  }
  
  if (attendanceStations.length > 0) {
    const firstAttendance = attendanceStations[0];
    console.log(`\n找到第一个出勤站点: ${firstAttendance.stationName} (索引 ${firstAttendance.index})`);
    
    // 查找下一个站点
    const nextIndex = firstAttendance.index + 1;
    if (nextIndex < scheduleDetails.length) {
      const nextDetail = scheduleDetails[nextIndex];
      console.log(`下一个站点: ${stationMap[nextDetail.station_id]} (索引 ${nextIndex})`);
      
      // 检查是否为接车站点
      const isPickupStation = logicStations.some(ls => 
        ls.station_id === nextDetail.station_id && ls.station_type === 3);
      const isLastStation = (nextIndex === scheduleDetails.length - 1);
      
      console.log(`是否为接车站点: ${isPickupStation}`);
      console.log(`是否为最后一个站点: ${isLastStation}`);
    } else {
      console.log('已是最后一个站点');
    }
  }
  
  // 查找退勤站点
  console.log('\n=== 退勤站点分析 ===');
  const offDutyStations = [];
  for (let i = 0; i < scheduleDetails.length; i++) {
    const detail = scheduleDetails[i];
    const isOffDutyStation = logicStations.some(ls => 
      ls.station_id === detail.station_id && ls.station_type === 2);
    if (isOffDutyStation) {
      offDutyStations.push({
        index: i,
        stationId: detail.station_id,
        stationName: stationMap[detail.station_id],
        arriveTime: detail.arrive_time
      });
      console.log(`退勤站点: ${stationMap[detail.station_id]} (索引 ${i})`);
    }
  }
  
  if (offDutyStations.length > 0) {
    const firstOffDuty = offDutyStations[0];
    console.log(`\n找到第一个退勤站点: ${firstOffDuty.stationName} (索引 ${firstOffDuty.index})`);
  }
}

testLogic();