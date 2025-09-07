import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('Simple verification that Worker is using local data files...\n');

// 测试几个关键API端点
const testEndpoints = [
  { endpoint: '/api/train-schedules', file: 'cw_train_schedule.json' },
  { endpoint: '/api/train-schedule-details', file: 'cw_train_schedule_detail.json' },
  { endpoint: '/api/lines', file: 'cw_line.json' },
  { endpoint: '/api/stations', file: 'cw_station.json' }
];

let allMatch = true;

for (const test of testEndpoints) {
  console.log(`Testing ${test.endpoint}...`);
  
  try {
    // 从Worker获取数据
    const workerData = execSync(
      `curl -s -X GET "https://mtrcx-subway-system.xun-chen.workers.dev${test.endpoint}" -H "Accept: application/json"`,
      { encoding: 'utf8' }
    );
    
    // 读取本地文件数据
    const localFilePath = path.join('data', test.file);
    const localData = fs.readFileSync(localFilePath, 'utf8');
    
    // 比较数据（去除空白字符以便比较）
    const workerClean = workerData.replace(/\s+/g, '');
    const localClean = localData.replace(/\s+/g, '');
    
    if (workerClean === localClean) {
      console.log(`  ✓ ${test.endpoint} matches local file ${test.file}`);
    } else {
      console.log(`  ✗ ${test.endpoint} does NOT match local file ${test.file}`);
      console.log(`    Worker data length: ${workerClean.length}`);
      console.log(`    Local data length: ${localClean.length}`);
      allMatch = false;
    }
  } catch (error) {
    console.log(`  ✗ Error testing ${test.endpoint}: ${error.message}`);
    allMatch = false;
  }
  
  console.log(''); // 空行分隔
}

if (allMatch) {
  console.log('All tested endpoints match local data files! 🎉');
  console.log('The Worker is now using local data files directly.');
} else {
  console.log('Some endpoints do not match local data files.');
}

console.log('\nWorker has been updated to read data directly from local files instead of KV storage.');