import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 数据文件映射
const dataFiles = {
  'cw_crossing_road': 'cw_crossing_road.json',
  'cw_line': 'cw_line.json',
  'cw_train_schedule': 'cw_train_schedule.json',
  'cw_train_schedule_detail': 'cw_train_schedule_detail.json',
  'cw_seat_type': 'cw_seat_type.json',
  'cw_station': 'cw_station.json',
  'cw_logic_station': 'cw_logic_station.json',
  'drive_ticket': 'drive_ticket.json',
  'drive_ticket_collect': 'drive_ticket_collect.json',
  'drive_ticket_param': 'drive_ticket_param.json'
};

// 验证数据一致性
async function verifyDataConsistency() {
  console.log('Verifying data consistency between local files and KV storage...\n');
  
  let allConsistent = true;
  
  for (const [key, filename] of Object.entries(dataFiles)) {
    console.log(`Checking ${key}...`);
    
    try {
      // 读取本地文件
      const localFilePath = path.join(__dirname, 'data', filename);
      const localData = JSON.parse(fs.readFileSync(localFilePath, 'utf8'));
      
      // 从KV存储获取数据
      const command = `npx wrangler kv key get ${key} --namespace-id 01b950f1bbeb414c979fd12500f0ffda`;
      const kvDataString = execSync(command, { cwd: __dirname, encoding: 'utf8' });
      
      // 解析KV数据（去除可能的换行符）
      const kvData = JSON.parse(kvDataString.trim());
      
      // 比较数据
      const localString = JSON.stringify(localData);
      const kvString = JSON.stringify(kvData);
      
      if (localString === kvString) {
        console.log(`  ✓ ${key} is consistent`);
      } else {
        console.log(`  ✗ ${key} is NOT consistent`);
        allConsistent = false;
      }
    } catch (error) {
      console.log(`  ✗ Error checking ${key}: ${error.message}`);
      allConsistent = false;
    }
    
    console.log(''); // 空行分隔
  }
  
  if (allConsistent) {
    console.log('All data is consistent between local files and KV storage! 🎉');
  } else {
    console.log('Some data is not consistent. Please check the errors above.');
  }
  
  return allConsistent;
}

// 执行验证
verifyDataConsistency();