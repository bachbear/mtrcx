/**
 * 数据迁移脚本：从本地JSON文件迁移数据到Cloudflare D1数据库
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 数据文件路径
const DATA_DIR = path.join(__dirname, '../../data');

// 读取JSON文件
async function readJsonFile(filename) {
  try {
    const filePath = path.join(DATA_DIR, filename);
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`读取文件 ${filename} 失败:`, error);
    return [];
  }
}

// 生成SQL插入语句
function generateInsertSQL() {
  const sqlStatements = [];

  // 这个脚本生成SQL语句，可以手动执行或通过wrangler d1 execute执行
  sqlStatements.push('-- 数据迁移SQL语句');
  sqlStatements.push('-- 从本地JSON文件生成');
  sqlStatements.push('');

  return sqlStatements;
}

// 生成交路票数据的SQL
async function generateDriveTicketSQL() {
  const driveTickets = await readJsonFile('drive_ticket.json');
  const sqlStatements = [];

  sqlStatements.push('-- 清空并插入交路票数据');
  sqlStatements.push('DELETE FROM drive_ticket;');
  sqlStatements.push('');

  for (const ticket of driveTickets) {
    const sql = `INSERT INTO drive_ticket (ticket_id, train_name, start_station, end_station, pickup_time, dropoff_time, is_sold) VALUES (${ticket.ticket_id}, '${ticket.train_name}', '${ticket.start_station}', '${ticket.end_station}', '${ticket.pickup_time}', '${ticket.dropoff_time}', ${ticket.is_sold ? 1 : 0});`;
    sqlStatements.push(sql);
  }

  return sqlStatements;
}

// 生成交路票夹数据的SQL
async function generateDriveTicketCollectSQL() {
  const driveTicketCollect = await readJsonFile('drive_ticket_collect.json');
  const sqlStatements = [];

  sqlStatements.push('-- 清空并插入交路票夹数据');
  sqlStatements.push('DELETE FROM drive_ticket_collect;');
  sqlStatements.push('');

  for (const collect of driveTicketCollect) {
    const sql = `INSERT INTO drive_ticket_collect (collect_id, ticket_chain) VALUES (${collect.collect_id}, '${collect.ticket_chain}');`;
    sqlStatements.push(sql);
  }

  return sqlStatements;
}

// 生成便乘票数据的SQL
async function generateRideTicketSQL() {
  const rideTickets = await readJsonFile('drive_ride_ticket.json');
  const sqlStatements = [];

  sqlStatements.push('-- 清空并插入便乘票数据');
  sqlStatements.push('DELETE FROM drive_ride_ticket;');
  sqlStatements.push('');

  for (const ticket of rideTickets) {
    const sql = `INSERT INTO drive_ride_ticket (ride_id, train_name, start_station, end_station, pickup_time, dropoff_time) VALUES (${ticket.ride_id}, '${ticket.train_name}', '${ticket.start_station}', '${ticket.end_station}', '${ticket.pickup_time}', '${ticket.dropoff_time}');`;
    sqlStatements.push(sql);
  }

  return sqlStatements;
}

// 生成列车时刻表明细数据的SQL
async function generateTrainScheduleDetailSQL() {
  const scheduleDetails = await readJsonFile('cw_train_schedule_detail.json');
  const sqlStatements = [];

  sqlStatements.push('-- 清空并插入列车时刻表明细数据');
  sqlStatements.push('DELETE FROM cw_train_schedule_detail;');
  sqlStatements.push('');

  for (const detail of scheduleDetails) {
    const sql = `INSERT INTO cw_train_schedule_detail (train_schedule_id, station_id, arrival_time, departure_time, stop_time, distance, sequence_order) VALUES (${detail.train_schedule_id}, ${detail.station_id}, '${detail.arrival_time || ''}', '${detail.departure_time || ''}', ${detail.stop_time || 0}, ${detail.distance || 0}, ${detail.sequence_order});`;
    sqlStatements.push(sql);
  }

  return sqlStatements;
}

// 主函数
async function main() {
  console.log('开始生成数据迁移SQL...');

  const allSQL = [];

  // 生成各种数据的SQL
  const driveTicketSQL = await generateDriveTicketSQL();
  const driveTicketCollectSQL = await generateDriveTicketCollectSQL();
  const rideTicketSQL = await generateRideTicketSQL();
  const scheduleDetailSQL = await generateTrainScheduleDetailSQL();

  allSQL.push(...driveTicketSQL);
  allSQL.push('');
  allSQL.push(...driveTicketCollectSQL);
  allSQL.push('');
  allSQL.push(...rideTicketSQL);
  allSQL.push('');
  allSQL.push(...scheduleDetailSQL);

  // 写入SQL文件
  const outputPath = path.join(__dirname, '../migrations/0003_migrate_data.sql');
  await fs.writeFile(outputPath, allSQL.join('\n'), 'utf8');

  console.log(`数据迁移SQL已生成: ${outputPath}`);
  console.log('请使用以下命令执行迁移:');
  console.log('wrangler d1 migrations apply subway-management-db --local');
  console.log('wrangler d1 migrations apply subway-management-db --remote');
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { main as generateMigrationSQL };