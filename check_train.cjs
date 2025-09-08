// 检查车次路径
const fs = require('fs').promises;

async function checkTrainPath() {
  try {
    const details = JSON.parse(await fs.readFile('./data/cw_train_schedule_detail.json', 'utf8'));
    const filtered = details.filter(d => d.train_schedule_id === 101);
    console.log('G00101车次路径:');
    filtered.forEach((d, i) => {
      console.log(`  ${i}: 站点${d.station_id} (${d.arrive_time})`);
    });
  } catch (error) {
    console.error('错误:', error);
  }
}

checkTrainPath();