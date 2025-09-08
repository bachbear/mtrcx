import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { promises as fs } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3337;

// 中间件
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// 添加CORS头
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// API路由 - 获取所有交路信息
app.get('/api/crossing-roads', async (req, res) => {
  try {
    const data = await fs.readFile(path.join(__dirname, '../data/cw_crossing_road.json'), 'utf8');
    const crossingRoads = JSON.parse(data);
    res.json(crossingRoads);
  } catch (error) {
    res.status(500).json({ error: '无法读取交路数据' });
  }
});

// API路由 - 更新所有交路信息
app.put('/api/crossing-roads', async (req, res) => {
  try {
    const updatedData = req.body;
    const filePath = path.join(__dirname, '../data/cw_crossing_road.json');
    
    // 将更新后的数据写入文件
    await fs.writeFile(filePath, JSON.stringify(updatedData, null, 2), 'utf8');
    
    res.json({ message: '交路数据更新成功' });
  } catch (error) {
    console.error('保存交路数据时发生错误:', error);
    res.status(500).json({ error: '无法保存交路数据', details: error.message });
  }
});

// API路由 - 获取所有线路信息
app.get('/api/lines', async (req, res) => {
  try {
    const data = await fs.readFile(path.join(__dirname, '../data/cw_line.json'), 'utf8');
    const lines = JSON.parse(data);
    res.json(lines);
  } catch (error) {
    res.status(500).json({ error: '无法读取线路数据' });
  }
});

// API路由 - 获取所有列车时刻表信息
app.get('/api/train-schedules', async (req, res) => {
  try {
    const data = await fs.readFile(path.join(__dirname, '../data/cw_train_schedule.json'), 'utf8');
    const trainSchedules = JSON.parse(data);
    res.json(trainSchedules);
  } catch (error) {
    res.status(500).json({ error: '无法读取列车时刻表数据' });
  }
});

// API路由 - 获取所有列车时刻表明细信息
app.get('/api/train-schedule-details', async (req, res) => {
  try {
    const data = await fs.readFile(path.join(__dirname, '../data/cw_train_schedule_detail.json'), 'utf8');
    const trainScheduleDetails = JSON.parse(data);
    res.json(trainScheduleDetails);
  } catch (error) {
    res.status(500).json({ error: '无法读取列车时刻表明细数据' });
  }
});

// API路由 - 获取所有座位类型信息
app.get('/api/seat-types', async (req, res) => {
  try {
    const data = await fs.readFile(path.join(__dirname, '../data/cw_seat_type.json'), 'utf8');
    const seatTypes = JSON.parse(data);
    res.json(seatTypes);
  } catch (error) {
    res.status(500).json({ error: '无法读取座位类型数据' });
  }
});

// API路由 - 获取所有车站信息
app.get('/api/stations', async (req, res) => {
  try {
    const data = await fs.readFile(path.join(__dirname, '../data/cw_station.json'), 'utf8');
    const stations = JSON.parse(data);
    res.json(stations);
  } catch (error) {
    res.status(500).json({ error: '无法读取车站数据' });
  }
});

// API路由 - 获取所有逻辑车站信息
app.get('/api/logic-stations', async (req, res) => {
  try {
    const data = await fs.readFile(path.join(__dirname, '../data/cw_logic_station.json'), 'utf8');
    const logicStations = JSON.parse(data);
    res.json(logicStations);
  } catch (error) {
    res.status(500).json({ error: '无法读取逻辑车站数据' });
  }
});

// API路由 - 获取所有交路票信息
app.get('/api/drive-tickets', async (req, res) => {
  try {
    const data = await fs.readFile(path.join(__dirname, '../data/drive_ticket.json'), 'utf8');
    const driveTickets = JSON.parse(data);
    res.json(driveTickets);
  } catch (error) {
    res.status(500).json({ error: '无法读取交路票数据' });
  }
});

// API路由 - 获取所有交路票夹信息
app.get('/api/drive-ticket-collect', async (req, res) => {
  try {
    const data = await fs.readFile(path.join(__dirname, '../data/drive_ticket_collect.json'), 'utf8');
    const driveTicketCollect = JSON.parse(data);
    res.json(driveTicketCollect);
  } catch (error) {
    res.status(500).json({ error: '无法读取交路票夹数据' });
  }
});

// API路由 - 获取所有交路参数信息
app.get('/api/drive-ticket-params', async (req, res) => {
  try {
    const data = await fs.readFile(path.join(__dirname, '../data/drive_ticket_param.json'), 'utf8');
    const driveTicketParams = JSON.parse(data);
    res.json(driveTicketParams);
  } catch (error) {
    res.status(500).json({ error: '无法读取交路参数数据' });
  }
});

// API路由 - 更新所有交路参数信息
app.put('/api/drive-ticket-params', async (req, res) => {
  try {
    const updatedData = req.body;
    const filePath = path.join(__dirname, '../data/drive_ticket_param.json');
    
    // 将更新后的数据写入文件，指定UTF-8编码
    await fs.writeFile(filePath, JSON.stringify(updatedData, null, 2), 'utf8');
    
    res.json({ message: '交路参数数据更新成功' });
  } catch (error) {
    console.error('保存交路参数数据时发生错误:', error);
    res.status(500).json({ error: '无法保存交路参数数据', details: error.message });
  }
});

// API路由 - 生成和更新交路票记录
app.post('/api/generate-drive-tickets', async (req, res) => {
  try {
    // 导入生成交路票的模块
    const { generateDriveTickets } = require('../generate_drive_tickets');
    
    console.log('开始生成交路票...');
    
    // 调用生成交路票的函数
    const result = await generateDriveTickets();
    
    console.log('交路票生成完成，结果:', result ? result.length : 0, '条记录');
    
    res.status(200).json({ message: '交路票记录生成和更新成功', count: result ? result.length : 0 });
  } catch (error) {
    console.error('生成交路票记录时发生错误:', error);
    res.status(500).json({ error: '生成交路票记录时发生错误', details: error.message });
  }
});

// API路由 - 生成和更新交路票夹记录
app.post('/api/generate-drive-ticket-collect', async (req, res) => {
  try {
    // 导入生成交路票夹的模块
    const { generateDriveTicketCollect } = require('../generate_drive_ticket_collect');
    
    console.log('开始生成交路票夹...');
    
    // 调用生成交路票夹的函数
    const result = await generateDriveTicketCollect();
    
    console.log('交路票夹生成完成，结果:', result ? result.length : 0, '条记录');
    
    res.status(200).json({ message: '交路票夹记录生成和更新成功', count: result ? result.length : 0 });
  } catch (error) {
    console.error('生成交路票夹记录时发生错误:', error);
    res.status(500).json({ error: '生成交路票夹记录时发生错误', details: error.message });
  }
});

// API路由 - 获取所有便乘票信息
app.get('/api/ride-tickets', async (req, res) => {
  try {
    const data = await fs.readFile(path.join(__dirname, '../data/drive_ride_ticket.json'), 'utf8');
    const rideTickets = JSON.parse(data);
    res.json(rideTickets);
  } catch (error) {
    res.status(500).json({ error: '无法读取便乘票数据' });
  }
});

// API路由 - 生成和更新便乘票记录
app.post('/api/generate-ride-tickets', async (req, res) => {
  try {
    // 导入生成便乘票的模块
    const { generateRideTickets } = require('../generate_ride_tickets');
    
    console.log('开始生成便乘票...');
    
    // 调用生成便乘票的函数
    const result = await generateRideTickets();
    
    console.log('便乘票生成完成，结果:', result ? result.length : 0, '条记录');
    
    res.status(200).json({ message: '便乘票记录生成和更新成功', count: result ? result.length : 0 });
  } catch (error) {
    console.error('生成便乘票记录时发生错误:', error);
    res.status(500).json({ error: '生成便乘票记录时发生错误', details: error.message });
  }
});

// 主页路由
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});