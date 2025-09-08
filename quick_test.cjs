// 最简便乘票生成脚本 - 用于调试
const fs = require('fs').promises;
const { join } = require('path');

async function quickTest() {
  try {
    console.log('=== 开始快速测试 ===');
    
    const dataDir = join(__dirname, 'data');
    
    // 读取所有必要的数据文件
    const trainSchedules = JSON.parse(await fs.readFile(join(dataDir, 'cw_train_schedule.json'), 'utf8'));
    const trainScheduleDetails = JSON.parse(await fs.readFile(join(dataDir, 'cw_train_schedule_detail.json'), 'utf8'));
    const logicStations = JSON.parse(await fs.readFile(join(dataDir, 'cw_logic_station.json'), 'utf8'));
    const stations = JSON.parse(await fs.readFile(join(dataDir, 'cw_station.json'), 'utf8'));
    
    console.log('数据读取完成');
    console.log('列车时刻表数量:', trainSchedules.length);
    console.log('逻辑车站数量:', logicStations.length);
    
    // 创建station_id到station_name的映射
    const stationMap = {};
    for (const station of stations) {
      stationMap[station.station_id] = station.station_name;
    }
    
    console.log('=== 检查逻辑车站 ===');
    logicStations.forEach(ls => {
      console.log(`  ${ls.station_id} -> ${stationMap[ls.station_id]} (类型: ${ls.station_type})`);
    });
    
    // 简单测试：查看前几个车次的路径
    console.log('\n=== 检查前两个车次路径 ===');
    const firstTwoSchedules = trainSchedules.slice(0, 2);
    for (const schedule of firstTwoSchedules) {
      const scheduleDetails = trainScheduleDetails
        .filter(detail => detail.train_schedule_id === schedule.train_schedule_id)
        .sort((a, b) => a.arrive_time.localeCompare(b.arrive_time));
      
      console.log(`${schedule.train_name}:`);
      scheduleDetails.forEach((detail, idx) => {
        console.log(`  ${idx}: ${stationMap[detail.station_id]} (${detail.station_id})`);
      });
    }
    
    console.log('\n=== 测试结束 ===');
    
  } catch (error) {
    console.error('错误:', error.message);
    console.error(error.stack);
  }
}

quickTest();