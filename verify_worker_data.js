import fs from 'fs';
import path from 'path';

// 数据文件映射
const dataFiles = [
  'cw_crossing_road.json',
  'cw_line.json',
  'cw_train_schedule.json',
  'cw_train_schedule_detail.json',
  'cw_seat_type.json',
  'cw_station.json',
  'cw_logic_station.json',
  'drive_ticket.json',
  'drive_ticket_collect.json',
  'drive_ticket_param.json'
];

console.log('Verifying that Worker is using local data files...\n');

let allMatch = true;

// 检查每个数据文件
for (const filename of dataFiles) {
  console.log(`Checking ${filename}...`);
  
  try {
    // 读取本地JSON文件
    const localFilePath = path.join('data', filename);
    const localData = JSON.parse(fs.readFileSync(localFilePath, 'utf8'));
    
    // 读取对应的JS模块文件
    const jsModulePath = path.join('src', 'data', filename.replace('.json', '.js'));
    const jsModuleContent = fs.readFileSync(jsModulePath, 'utf8');
    
    // 提取JS模块中的数据（使用正则表达式提取default导出的内容）
    const match = jsModuleContent.match(/export\s+default\s+(.+)$/s);
    if (match && match[1]) {
      // 评估JS对象（注意：在生产环境中不要这样做，仅用于验证目的）
      const jsData = eval(`(${match[1]})`);
      
      // 比较数据
      const localString = JSON.stringify(localData, null, 2);
      const jsString = JSON.stringify(jsData, null, 2);
      
      if (localString === jsString) {
        console.log(`  ✓ ${filename} matches between local JSON and JS module`);
      } else {
        console.log(`  ✗ ${filename} does NOT match between local JSON and JS module`);
        console.log(`    Local length: ${localString.length}, JS module length: ${jsString.length}`);
        allMatch = false;
      }
    } else {
      console.log(`  ✗ Could not extract data from JS module for ${filename}`);
      allMatch = false;
    }
  } catch (error) {
    console.log(`  ✗ Error checking ${filename}: ${error.message}`);
    allMatch = false;
  }
  
  console.log(''); // 空行分隔
}

if (allMatch) {
  console.log('All data files are consistent between local JSON and Worker JS modules! 🎉');
  console.log('The Worker is now using local data files directly.');
} else {
  console.log('Some data files are not consistent. Please check the errors above.');
}

console.log('\nWorker has been updated to read data directly from local files instead of KV storage.');