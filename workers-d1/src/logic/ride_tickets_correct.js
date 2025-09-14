/**
 * 便乘票生成逻辑 - 严格按照交路生成逻辑设计.md第4部分实现
 *
 * @param {object} DB - D1 数据库绑定
 * @returns {Promise<Array>} 生成的便乘票数据
 */
export async function generateRideTickets(DB) {
  try {
    // 1. 从D1数据库读取所有必要的数据
    const { results: trainSchedules } = await DB.prepare('SELECT * FROM cw_train_schedule').all();
    const { results: trainScheduleDetails } = await DB.prepare('SELECT * FROM cw_train_schedule_detail').all();
    const { results: logicStations } = await DB.prepare('SELECT * FROM cw_logic_station').all();
    const { results: stations } = await DB.prepare('SELECT * FROM cw_station').all();

    // 检查逻辑车站数据
    if (logicStations.length === 0) {
      console.warn('警告: 未找到逻辑车站数据，将无法生成便乘票');
      return [];
    }

    // 生成便乘票记录
    const rideTickets = [];

    // 创建station_id到station_name的映射
    const stationMap = {};
    for (const station of stations) {
      stationMap[station.station_id] = station.station_name;
    }

    // 4.1.1 对当天所有的车次按发车时间递增排序
    const sortedTrainSchedulesAsc = [...trainSchedules].sort((a, b) =>
      a.begin_time.localeCompare(b.begin_time)
    );

    // 4.1.2 生成出勤便乘票
    console.log('开始生成出勤便乘票...');
    for (const schedule of sortedTrainSchedulesAsc) {
      const trainName = schedule.train_name;
      const trainScheduleId = schedule.train_schedule_id;

      // 获取该车次的所有站点明细并按到达时间升序排列
      const scheduleDetails = trainScheduleDetails
        .filter(detail => detail.train_schedule_id === trainScheduleId)
        .sort((a, b) => a.arrive_time.localeCompare(b.arrive_time));

      console.log(`处理车次 ${trainName}，共 ${scheduleDetails.length} 个站点`);

      // 如果没有站点明细，跳过该车次
      if (scheduleDetails.length === 0) {
        continue;
      }

      // 按照到达时间升序遍历每个station_id
      for (let i = 0; i < scheduleDetails.length; i++) {
        const currentDetail = scheduleDetails[i];
        const currentStationId = currentDetail.station_id;
        const currentStationName = stationMap[currentStationId];

        // 在逻辑车站表中查询当前站点的站点类型
        const currentLogicStation = logicStations.find(ls =>
          ls.station_id === currentStationId && ls.station_type === 1 // 出勤站点
        );

        // 如果当前站点是出勤站点，则记录下该站点对应的车站名称作为上车站点
        if (currentLogicStation) {
          console.log(`  找到出勤站点: ${currentStationName} (索引 ${i})`);
          const startStationName = stationMap[currentStationId];

          // 查询车次的后续所有站点（从下一个站点开始，直至最后一个站点）
          if (i < scheduleDetails.length - 1) {
            let foundTicket = false;

            // 从下一个站点开始，遍历后续所有站点，为每个符合条件的站点生成便乘票
            for (let j = i + 1; j < scheduleDetails.length; j++) {
              const nextDetail = scheduleDetails[j];
              const nextStationId = nextDetail.station_id;
              const nextStationName = stationMap[nextStationId];

              // 查询逻辑车站表，如果该站点是接车站点，或者是该车次的最后一个站点
              const nextLogicStation = logicStations.find(ls =>
                ls.station_id === nextStationId && ls.station_type === 3 // 接车站点
              );
              const isLastStation = (j === scheduleDetails.length - 1);

              console.log(`    检查站点 ${j}: ${nextStationName}, 接车站点: ${!!nextLogicStation}, 最后站点: ${isLastStation}`);

              if (nextLogicStation || isLastStation) {
                // 找到符合条件的站点，记录下该站点对应的车站名称作为下车站点
                const endStationName = stationMap[nextStationId];

                console.log(`    生成出勤便乘票: ${trainName} ${startStationName} -> ${endStationName}`);

                const rideTicket = {
                  train_name: trainName,
                  start_station: startStationName,
                  end_station: endStationName
                };
                rideTickets.push(rideTicket);
                foundTicket = true;
                // 不再break，继续为后续符合条件的站点生成便乘票
              }
            }

            if (!foundTicket) {
              console.log(`    未找到符合条件的下车站点`);
            }
          }
        }
      }
    }

    // 4.1.3 对当天所有车次按结束时间递减排序
    const sortedTrainSchedulesDesc = [...trainSchedules].sort((a, b) =>
      b.end_time.localeCompare(a.end_time)
    );

    // 4.1.4 生成退勤便乘票
    console.log('开始生成退勤便乘票...');
    for (const schedule of sortedTrainSchedulesDesc) {
      const trainName = schedule.train_name;
      const trainScheduleId = schedule.train_schedule_id;

      // 获取该车次的所有站点明细并按到达时间降序排列
      const scheduleDetails = trainScheduleDetails
        .filter(detail => detail.train_schedule_id === trainScheduleId)
        .sort((a, b) => b.arrive_time.localeCompare(a.arrive_time));

      console.log(`处理车次 ${trainName}，共 ${scheduleDetails.length} 个站点（降序）`);

      // 如果没有站点明细，跳过该车次
      if (scheduleDetails.length === 0) {
        continue;
      }

      // 按照到达时间降序遍历每个station_id
      for (let i = 0; i < scheduleDetails.length; i++) {
        const currentDetail = scheduleDetails[i];
        const currentStationId = currentDetail.station_id;
        const currentStationName = stationMap[currentStationId];

        // 在逻辑车站表中查询当前站点的站点类型
        const currentLogicStation = logicStations.find(ls =>
          ls.station_id === currentStationId && ls.station_type === 2 // 退勤站点
        );

        // 如果当前站点是退勤站点，则记录下该站点对应的车站名称作为下车站点
        if (currentLogicStation) {
          console.log(`  找到退勤站点: ${currentStationName} (索引 ${i})`);
          const endStationName = stationMap[currentStationId];

          // 查询车次的后续所有站点（从下一个站点开始，直至第一个站点）
          if (i < scheduleDetails.length - 1) {
            let foundTicket = false;

            // 从下一个站点开始，遍历后续所有站点
            for (let j = i + 1; j < scheduleDetails.length; j++) {
              const nextDetail = scheduleDetails[j];
              const nextStationId = nextDetail.station_id;
              const nextStationName = stationMap[nextStationId];

              // 查询逻辑车站表，如果该站点是出勤站点，或者是该车次的第一个站点
              const nextLogicStation = logicStations.find(ls =>
                ls.station_id === nextStationId && ls.station_type === 1 // 出勤站点
              );
              const isFirstStation = (j === scheduleDetails.length - 1);

              console.log(`    检查站点 ${j}: ${nextStationName}, 出勤站点: ${!!nextLogicStation}, 第一站点: ${isFirstStation}`);

              if (nextLogicStation || isFirstStation) {
                // 找到符合条件的站点，作为上车站点
                const startStationName = stationMap[nextStationId];

                console.log(`    生成退勤便乘票: ${trainName} ${startStationName} -> ${endStationName}`);

                const rideTicket = {
                  train_name: trainName,
                  start_station: startStationName,
                  end_station: endStationName
                };
                rideTickets.push(rideTicket);
                foundTicket = true;
                // 不再break，继续为后续符合条件的站点生成便乘票
              }
            }

            if (!foundTicket) {
              console.log(`    未找到符合条件的上车站点`);
            }
          }
        }
      }
    }

    // 4.1.5 查询列车时刻表明细表，获得上车站到站时间，下车站到站时间
    const rideTicketsWithTime = rideTickets.map(rideTicket => {
      // 查找该车次的时刻表明细
      const scheduleDetailsForTrain = trainScheduleDetails.filter(
        detail => {
          // 找到对应的车次时刻表
          const trainSchedule = trainSchedules.find(ts => ts.train_name === rideTicket.train_name);
          return trainSchedule && detail.train_schedule_id === trainSchedule.train_schedule_id;
        }
      ).sort((a, b) => a.arrive_time.localeCompare(b.arrive_time));

      // 查找上车站的到达时间
      let pickupTime = '';
      const startStationDetail = scheduleDetailsForTrain.find(
        detail => {
          const station = stations.find(s => s.station_id === detail.station_id);
          return station && station.station_name === rideTicket.start_station;
        }
      );
      if (startStationDetail) {
        pickupTime = startStationDetail.arrive_time;
      }

      // 查找下车站的到达时间
      let dropoffTime = '';
      const endStationDetail = scheduleDetailsForTrain.find(
        detail => {
          const station = stations.find(s => s.station_id === detail.station_id);
          return station && station.station_name === rideTicket.end_station;
        }
      );
      if (endStationDetail) {
        dropoffTime = endStationDetail.arrive_time;
      }

      return {
        ...rideTicket,
        pickup_time: pickupTime,
        dropoff_time: dropoffTime
      };
    });

    // 对生成的所有便乘票按上车站到站时间升序排列，如果上车站到站时间相同，则叠加按车次号升序条件排列
    const sortedRideTickets = rideTicketsWithTime.sort((a, b) => {
      // 首先按上车站到站时间排序
      const timeComparison = a.pickup_time.localeCompare(b.pickup_time);
      if (timeComparison !== 0) {
        return timeComparison;
      }
      // 如果上车站到站时间相同，按车次号排序
      return a.train_name.localeCompare(b.train_name);
    });

    // 添加主键ID和便乘票序号
    const finalRideTickets = sortedRideTickets.map((ticket, index) => ({
      id: index + 1,
      ride_id: index + 1,
      ...ticket
    }));

    return finalRideTickets;
  } catch (error) {
    console.error('生成便乘票时发生错误:', error);
    throw error;
  }
}