import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 便乘票生成主函数 - 专门调试西直门到五道口案例
async function generateRideTickets() {
  try {
    console.log('=== 便乘票生成调试 - 西直门到五道口案例 ===');
    
    // 计算项目根目录路径
    const rootDir = __dirname;
    const dataDir = join(rootDir, 'data');
    
    // 读取所有必要的数据文件
    const trainSchedules = JSON.parse(await fs.readFile(join(dataDir, 'cw_train_schedule.json'), 'utf8'));
    const trainScheduleDetails = JSON.parse(await fs.readFile(join(dataDir, 'cw_train_schedule_detail.json'), 'utf8'));
    const logicStations = JSON.parse(await fs.readFile(join(dataDir, 'cw_logic_station.json'), 'utf8'));
    const stations = JSON.parse(await fs.readFile(join(dataDir, 'cw_station.json'), 'utf8'));
    
    console.log(`读取数据: ${trainSchedules.length} 个车次, ${logicStations.length} 个逻辑车站`);
    
    // 创建station_id到station_name的映射
    const stationMap = {};
    for (const station of stations) {
      stationMap[station.station_id] = station.station_name;
    }
    
    // 查找西直门站和五道口站的ID
    const xizhimenId = stations.find(s => s.station_name === '西直门站')?.station_id;
    const wudaokouId = stations.find(s => s.station_name === '五道口站')?.station_id;
    
    console.log(`西直门站ID: ${xizhimenId}, 五道口站ID: ${wudaokouId}`);
    
    // 检查它们在逻辑车站中的类型
    const xizhimenLogicTypes = logicStations.filter(ls => ls.station_id === xizhimenId);
    const wudaokouLogicTypes = logicStations.filter(ls => ls.station_id === wudaokouId);
    
    console.log('西直门站逻辑类型:', xizhimenLogicTypes);
    console.log('五道口站逻辑类型:', wudaokouLogicTypes);
    
    // 生成便乘票记录
    const rideTickets = [];
    
    // 4.1.1 对当天所有的车次按发车时间递增排序
    const sortedTrainSchedulesAsc = [...trainSchedules].sort((a, b) => 
      a.begin_time.localeCompare(b.begin_time)
    );
    
    console.log('\n=== 检查出勤便乘票生成 ===');
    
    // 专门检查第一个车次 G00101
    const firstTrain = sortedTrainSchedulesAsc[0];
    console.log(`检查车次: ${firstTrain.train_name}`);
    
    const trainScheduleId = firstTrain.train_schedule_id;
    
    // 获取该车次的所有站点明细并按到达时间升序排列
    const scheduleDetails = trainScheduleDetails
      .filter(detail => detail.train_schedule_id === trainScheduleId)
      .sort((a, b) => a.arrive_time.localeCompare(b.arrive_time));
    
    console.log(`车次 ${firstTrain.train_name} 有 ${scheduleDetails.length} 个站点`);
    
    // 打印所有站点及其逻辑类型
    console.log('所有站点详情:');
    for (let i = 0; i < scheduleDetails.length; i++) {
      const detail = scheduleDetails[i];
      const stationName = stationMap[detail.station_id];
      const logicTypes = logicStations.filter(ls => ls.station_id === detail.station_id);
      console.log(`  ${i}: ${stationName} (${detail.station_id}) - 到达时间: ${detail.arrive_time} - 逻辑类型: ${logicTypes.map(l => l.station_type).join(',')}`);
    }
    
    // 按算法逻辑：找出第一个出勤站点（station_type === 1）
    let firstAttendanceStation = null;
    let firstAttendanceIndex = -1;
    
    for (let i = 0; i < scheduleDetails.length; i++) {
      const detail = scheduleDetails[i];
      const isAttendanceStation = logicStations.some(ls => 
        ls.station_id === detail.station_id && ls.station_type === 1);
      if (isAttendanceStation) {
        firstAttendanceStation = detail;
        firstAttendanceIndex = i;
        console.log(`找到出勤站点: ${stationMap[detail.station_id]} (索引 ${i})`);
        break;
      }
    }
    
    // 如果找到出勤站点，生成出勤便乘票
    if (firstAttendanceStation) {
      const startStationName = stationMap[firstAttendanceStation.station_id];
      console.log(`起始站点: ${startStationName}`);
      
      // 检查起始站点是否是西直门站
      if (firstAttendanceStation.station_id === xizhimenId) {
        console.log('✓ 起始站点是西直门站');
      }
      
      // 找到下一个站点
      let nextIndex = firstAttendanceIndex + 1;
      
      if (nextIndex < scheduleDetails.length) {
        const nextDetail = scheduleDetails[nextIndex];
        const nextStationName = stationMap[nextDetail.station_id];
        console.log(`下一个站点: ${nextStationName} (${nextDetail.station_id})`);
        
        // 检查是否是五道口站
        if (nextDetail.station_id === wudaokouId) {
          console.log('✓ 下一个站点是五道口站');
          
          // 检查五道口站是否是接车站点
          const isPickupStation = logicStations.some(ls => 
            ls.station_id === nextDetail.station_id && ls.station_type === 3);
          console.log(`五道口站是接车站点: ${isPickupStation}`);
          
          if (isPickupStation) {
            console.log('✓ 满足生成条件，应该生成便乘票');
            const rideTicket = {
              train_name: firstTrain.train_name,
              start_station: startStationName,
              end_station: nextStationName
            };
            rideTickets.push(rideTicket);
            console.log(`生成便乘票: ${firstTrain.train_name} ${startStationName} -> ${nextStationName}`);
          } else {
            console.log('✗ 不满足接车站点条件');
          }
        } else {
          console.log(`✗ 下一个站点不是五道口站，而是 ${nextStationName}`);
        }
      } else {
        console.log('✗ 没有下一个站点');
      }
    } else {
      console.log('✗ 未找到出勤站点');
    }
    
    console.log(`\n最终生成的便乘票数量: ${rideTickets.length}`);
    
    // 保存结果到drive_ride_ticket.json文件
    await fs.writeFile(
      join(dataDir, 'drive_ride_ticket.json'),
      JSON.stringify(rideTickets, null, 2),
      'utf8'
    );
    
    console.log('结果已保存到data/drive_ride_ticket.json文件中');
    
    return rideTickets;
  } catch (error) {
    console.error('生成便乘票时发生错误:', error);
    throw error;
  }
}

// 如果直接运行此脚本，则执行生成便乘票的函数
if (import.meta.url === `file://${__filename}`) {
  generateRideTickets().then(() => {
    console.log('便乘票生成完成');
  }).catch(err => {
    console.error('便乘票生成失败:', err);
  });
}

// 导出生成便乘票的函数
export { generateRideTickets };