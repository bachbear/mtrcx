const fs = require('fs').promises;
const path = require('path');

// 交路票生成主函数
async function generateDriveTickets() {
  try {
    // 计算项目根目录路径
    const rootDir = path.resolve(__dirname);
    
    // 读取所有必要的数据文件
    const trainSchedules = JSON.parse(await fs.readFile(path.join(rootDir, 'data/cw_train_schedule.json'), 'utf8'));
    const trainScheduleDetails = JSON.parse(await fs.readFile(path.join(rootDir, 'data/cw_train_schedule_detail.json'), 'utf8'));
    const logicStations = JSON.parse(await fs.readFile(path.join(rootDir, 'data/cw_logic_station.json'), 'utf8'));
    const stations = JSON.parse(await fs.readFile(path.join(rootDir, 'data/cw_station.json'), 'utf8'));

    // 检查逻辑车站数据
    if (logicStations.length === 0) {
      console.warn('警告: 未找到逻辑车站数据，将无法生成交路票');
      return [];
    }


    // 按发车时间递增排序所有车次
    const sortedTrainSchedules = trainSchedules.sort((a, b) => 
      a.begin_time.localeCompare(b.begin_time)
    );

    // 生成交路票记录
    const driveTickets = [];

    // 遍历每个车次
    for (const schedule of sortedTrainSchedules) {
      const trainName = schedule.train_name;
      const trainScheduleId = schedule.train_schedule_id;

      // 获取该车次的所有站点明细并按到达时间升序排列
      const scheduleDetails = trainScheduleDetails
        .filter(detail => detail.train_schedule_id === trainScheduleId)
        .sort((a, b) => a.arrive_time.localeCompare(b.arrive_time));

      // 如果没有站点明细，跳过该车次
      if (scheduleDetails.length === 0) {
        continue;
      }

      // 获得列车车次名称作为交路票的车次
      const trainScheduleName = schedule.train_name;

      // 2.2.2步骤：遍历每个station_id，按照到达时间升序
      let startIndex = 0;
      let currentStartStation = null;
      let currentPickupTime = null;

      // 第一个站点作为接车站点
      const firstDetail = scheduleDetails[0];
      const firstStation = stations.find(s => s.station_id === firstDetail.station_id);
      if (firstStation) {
        currentStartStation = firstStation.station_name;
        currentPickupTime = firstDetail.arrive_time;
        startIndex = 1; // 从第二个站点开始查找退车站点
      }

      // 查找第一个司务站点作为退车站点
      let endStation = null;
      let dropoffTime = null;
      let endIndex = -1;

      for (let i = startIndex; i < scheduleDetails.length; i++) {
        const stationId = scheduleDetails[i].station_id;
        // 检查该站点是否是司务站点（在逻辑车站表中）
        const isLogicStation = logicStations.some(ls => 
          ls.station_id === stationId && ls.station_type === 1);

        if (isLogicStation) {
          const station = stations.find(s => s.station_id === stationId);
          if (station) {
            endStation = station.station_name;
            dropoffTime = scheduleDetails[i].arrive_time;
            endIndex = i;
            break;
          }
        }
      }

      // 如果找到了退车站点，生成交路票记录
      if (endStation && currentStartStation) {
        // 生成A记录（2.2.2步骤）- 不包含时间信息
        const ticketA = {
          train_name: trainScheduleName,
          start_station: currentStartStation,
          end_station: endStation
        };

        driveTickets.push(ticketA);

        // 2.2.3步骤：如果A记录的退车站点是A记录里车次的最后一个站点，则不做处理
        if (endIndex < scheduleDetails.length - 1) {
          // 如果不是最后一个站点，则把这个退车站点作为步骤2.2.3.1的输入
          let inputStation = endStation;
          let inputIndex = endIndex;

          // 2.2.3.1步骤：新增一条交路票记录
          while (inputIndex < scheduleDetails.length - 1) {
            let newEndStation = null;
            let newEndIndex = -1;

            // 继续遍历这个接车站点的后续的station_id，查询逻辑车站表
            for (let j = inputIndex + 1; j < scheduleDetails.length; j++) {
              const stationId = scheduleDetails[j].station_id;
              // 检查该站点是否是司务站点（在逻辑车站表中）
              const isLogicStation = logicStations.some(ls => 
                ls.station_id === stationId && ls.station_type === 1);

              if (isLogicStation) {
                const station = stations.find(s => s.station_id === stationId);
                if (station) {
                  newEndStation = station.station_name;
                  newEndIndex = j;
                  break;
                }
              }
            }

            // 如果没有找到司务站点，则把最后一个站点作为退车站点
            if (!newEndStation) {
              const lastDetail = scheduleDetails[scheduleDetails.length - 1];
              const lastStation = stations.find(s => s.station_id === lastDetail.station_id);
              if (lastStation) {
                newEndStation = lastStation.station_name;
                newEndIndex = scheduleDetails.length - 1;
              }
            }

            // 生成交路票记录 - 不包含时间信息
            if (newEndStation && inputStation) {
              const newTicket = {
                train_name: trainScheduleName,
                start_station: inputStation,
                end_station: newEndStation
              };

              driveTickets.push(newTicket);

              // 2.2.3.2步骤：如果2.2.3.1步骤生成的交路票里的退车站点不是该交路票车次的最后一个站点，则把这个退车站点作为步骤2.2.3.1的输入，再次进行处理
              if (newEndIndex < scheduleDetails.length - 1) {
                inputStation = newEndStation;
                inputIndex = newEndIndex;
                // 继续循环查找下一个退车站点
                continue;
              } else {
                // 如果是最后一个站点，退出循环
                break;
              }
            } else {
              // 如果无法生成退车站点，退出循环
              break;
            }
          }
        }
      }
    }

    // 2.2.5步骤：对所有的交路票记录，查询列车时刻表明细表，获得接车站到站时间，退车站到站时间，更新到交路票表中
    const driveTicketsWithTime = driveTickets.map(ticket => {
      // 查找该车次的时刻表明细
      const scheduleDetailsForTrain = trainScheduleDetails.filter(
        detail => {
          // 找到对应的车次时刻表
          const trainSchedule = trainSchedules.find(ts => ts.train_name === ticket.train_name);
          return trainSchedule && detail.train_schedule_id === trainSchedule.train_schedule_id;
        }
      ).sort((a, b) => a.arrive_time.localeCompare(b.arrive_time));

      // 查找接车站的到达时间
      let pickupTime = '';
      const startStationDetail = scheduleDetailsForTrain.find(
        detail => {
          const station = stations.find(s => s.station_id === detail.station_id);
          return station && station.station_name === ticket.start_station;
        }
      );
      if (startStationDetail) {
        pickupTime = startStationDetail.arrive_time;
      }

      // 查找退车站的到达时间
      let dropoffTime = '';
      const endStationDetail = scheduleDetailsForTrain.find(
        detail => {
          const station = stations.find(s => s.station_id === detail.station_id);
          return station && station.station_name === ticket.end_station;
        }
      );
      if (endStationDetail) {
        dropoffTime = endStationDetail.arrive_time;
      }

      return {
        ...ticket,
        pickup_time: pickupTime,
        dropoff_time: dropoffTime
      };
    });

    // 2.2.7步骤：对生成的所有交路票按接车站到站时间升序排列，如果接车站到站时间相同，则叠加按车次号升序条件排列
    const sortedDriveTickets = driveTicketsWithTime.sort((a, b) => {
      // 首先按接车站到站时间排序
      const timeComparison = a.pickup_time.localeCompare(b.pickup_time);
      if (timeComparison !== 0) {
        return timeComparison;
      }
      // 如果接车站到站时间相同，按车次号排序
      return a.train_name.localeCompare(b.train_name);
    });

    // 添加主键ID和交路票序号，并设置是否已售出为false（2.2.6步骤）
    const finalDriveTickets = sortedDriveTickets.map((ticket, index) => ({
      id: index + 1,
      ticket_id: index + 1,
      ...ticket,
      is_sold: false
    }));

    // 保存结果到drive_ticket.json文件
    await fs.writeFile(
      path.join(rootDir, 'data/drive_ticket.json'),
      JSON.stringify(finalDriveTickets, null, 2),
      'utf8'
    );

    console.log('交路票生成完成，共生成', finalDriveTickets.length, '条记录');
    console.log('结果已保存到data/drive_ticket.json文件中');
    
    // 返回生成的交路票数据
    return finalDriveTickets;
  } catch (error) {
    console.error('生成交路票时发生错误:', error);
    throw error;
  }
}

// 如果直接运行此脚本，则执行生成交路票的函数
if (require.main === module) {
  generateDriveTickets();
}

// 导出生成交路票的函数
module.exports = {
  generateDriveTickets
};