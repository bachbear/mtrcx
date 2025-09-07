import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

// Cloudflare API配置 - 直接使用提供的凭据
const CLOUDFLARE_ACCOUNT_ID = 'eaf576cf734a494c98e45cfa863ebed8';
const CLOUDFLARE_API_TOKEN = '5WemO59WtzlF7rzQfPgJ7zNN_DVB_5WXECLqwMhz';

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cloudflare API配置
const KV_NAMESPACE_ID = '01b950f1bbeb414c979fd12500f0ffda'; // 从wrangler.jsonc中获取

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

// 上传数据到Cloudflare KV
async function uploadDataToKV(key, data) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/storage/kv/namespaces/${KV_NAMESPACE_ID}/values/${key}`;
  
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to upload ${key}: ${response.status} ${errorText}`);
  }
  
  console.log(`Successfully uploaded ${key}`);
}

// 读取本地JSON文件并上传到KV
async function uploadAllData() {
  console.log('Starting data upload to Cloudflare Worker KV storage...');
  
  try {
    for (const [key, filename] of Object.entries(dataFiles)) {
      const filePath = path.join(__dirname, 'data', filename);
      
      // 检查文件是否存在
      if (!fs.existsSync(filePath)) {
        console.warn(`File not found: ${filePath}`);
        continue;
      }
      
      // 读取JSON文件
      const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      // 上传到KV
      await uploadDataToKV(key, jsonData);
    }
    
    console.log('All data uploaded successfully!');
  } catch (error) {
    console.error('Error uploading data:', error);
    process.exit(1);
  }
}

// 执行上传
uploadAllData();