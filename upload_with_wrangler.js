import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// KV命名空间ID（从wrangler.jsonc中获取）
const KV_NAMESPACE_ID = '01b950f1bbeb414c979fd12500f0ffda';

// API端点映射
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

// 使用wrangler上传数据到KV
function uploadDataWithWrangler(key, filePath) {
  try {
    const command = `npx wrangler kv:key put ${key} --namespace-id=${KV_NAMESPACE_ID} --path=${filePath}`;
    console.log(`Executing: ${command}`);
    const output = execSync(command, { cwd: __dirname, stdio: 'inherit' });
    console.log(`Successfully uploaded ${key}`);
  } catch (error) {
    console.error(`Failed to upload ${key}:`, error.message);
    throw error;
  }
}

// 上传所有数据
async function uploadAllData() {
  console.log('Starting data upload to Cloudflare Worker KV storage using wrangler...');
  
  try {
    for (const [key, filename] of Object.entries(dataFiles)) {
      const filePath = path.join(__dirname, 'data', filename);
      
      // 检查文件是否存在
      if (!fs.existsSync(filePath)) {
        console.warn(`File not found: ${filePath}`);
        continue;
      }
      
      // 使用wrangler上传到KV
      uploadDataWithWrangler(key, filePath);
    }
    
    console.log('All data uploaded successfully!');
  } catch (error) {
    console.error('Error uploading data:', error);
    process.exit(1);
  }
}

// 执行上传
uploadAllData();