/**
 * 交路票生成逻辑 (Cloudflare Workers & D1 版本)
 * 完全重现本地node.js版本的逻辑
 *
 * @param {object} DB - D1 数据库绑定
 * @returns {Promise<Array>} 生成的交路票数据
 */
export async function generateDriveTickets(DB) {
  try {
    // 1. 从D1数据库读取所有必要的数据
    const { results: trainSchedules } = await DB.prepare('SELECT * FROM cw_train_schedule').all();
    const { results: trainScheduleDetails } = await DB.prepare('SELECT * FROM cw_train_schedule_detail').all();
    const { results: logicStations } = await DB.prepare('SELECT * FROM cw_logic_station').all();
    const { results: stations } = await DB.prepare('SELECT * FROM cw_station').all();

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

      // 2.2.2步骤：按照到达时间升序遍历每个station_id
      // 如果该站点是该车次的第一个站点，则记录下该station_id对应的车站名称作为上车站点
      if (scheduleDetails.length > 0) {
        const firstDetail = scheduleDetails[0];
        const firstStation = stations.find(s => s.station_id === firstDetail.station_id);
        if (firstStation) {
          const currentStartStation = firstStation.station_name;

          // 然后继续遍历后续的station_id，查找退车站点
          // 退车站点包括：1. 逻辑车站表中定义的退车站点 2. 车次的最后一个站点（天然退车站点）
          for (let j = 1; j < scheduleDetails.length; j++) {
            const nextStationId = scheduleDetails[j].station_id;
            let isOffStation = false;

            // 检查是否是逻辑车站表中定义的退车站点
            isOffStation = logicStations.some(ls =>
              ls.station_id === nextStationId && ls.station_type === 2);

            // 检查是否是车次的最后一个站点（天然退车站点）
            if (!isOffStation && j === scheduleDetails.length - 1) {
              isOffStation = true;
            }

            if (isOffStation) {
              const endStation = stations.find(s => s.station_id === nextStationId);
              if (endStation) {
                // 把获得的车次名称，上车站点，下车站点，新增这一条记录作为一条交路票记录
                const ticketA = {
                  train_name: trainScheduleName,
                  start_station: currentStartStation,
                  end_station: endStation.station_name
                };

                driveTickets.push(ticketA);

                // 2.2.3步骤：把用2.2.2步骤新增的交路票记录称作A记录
                // 查询A记录里车次名称对应的车次明细表，如果A记录的下车站点是A记录里车次的最后一个站点，则不做处理
                if (j < scheduleDetails.length - 1) {
                  // 如果不是，则把这个下车站点作为步骤2.2.3.1的输入，进行后续处理
                  let inputStation = endStation.station_name;
                  let inputIndex = j;

                  // 2.2.3.1步骤：新增一条交路票记录
                  while (inputIndex < scheduleDetails.length - 1) {
                    let newEndStation = null;
                    let newEndIndex = -1;

                    // 继续遍历这个接车站点的后续的station_id，查找退车站点
                    for (let k = inputIndex + 1; k < scheduleDetails.length; k++) {
                      const nextStationId = scheduleDetails[k].station_id;
                      let isNextOffStation = false;

                      // 检查是否是逻辑车站表中定义的退车站点
                      isNextOffStation = logicStations.some(ls =>
                        ls.station_id === nextStationId && ls.station_type === 2);

                      // 检查是否是车次的最后一个站点（天然退车站点）
                      if (!isNextOffStation && k === scheduleDetails.length - 1) {
                        isNextOffStation = true;
                      }

                      if (isNextOffStation) {
                        const station = stations.find(s => s.station_id === nextStationId);
                        if (station) {
                          newEndStation = station.station_name;
                          newEndIndex = k;
                          break;
                        }
                      }
                    }

                    // 把获得的车次名称，上车站点，下车站点，保存这一条交路票记录
                    if (newEndStation && inputStation) {
                      const newTicket = {
                        train_name: trainScheduleName,
                        start_station: inputStation,
                        end_station: newEndStation
                      };

                      driveTickets.push(newTicket);

                      // 2.2.3.2步骤：如果2.2.3.1步骤生成的交路票里的下车站点不是该交路票车次的最后一个站点，则把这个下车站点作为步骤2.2.3.1的输入，再次进行处理
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

                // 找到一个退车站点后，跳出内层循环，继续处理下一个车次
                break;
              }
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

    return finalDriveTickets;
  } catch (error) {
    console.error('生成交路票时发生错误:', error);
    throw error;
  }
}