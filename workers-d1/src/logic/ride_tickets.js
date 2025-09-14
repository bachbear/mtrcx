/**
 * 便乘票生成逻辑 (Cloudflare Workers & D1 版本)
 * 完全重现本地node.js版本的逻辑
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

    // 4.1.2 生成出勤便乘票 - 增加首站末站处理
    for (const schedule of sortedTrainSchedulesAsc) {
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
          break;
        }
      }

      // 如果找到出勤站点，查找后续的接车站点或末站
      if (firstAttendanceStation) {
        const startStationName = stationMap[firstAttendanceStation.station_id];

        // 查找后续的接车站点或末站
        let foundTicket = false;
        for (let j = firstAttendanceIndex + 1; j < scheduleDetails.length; j++) {
          const nextDetail = scheduleDetails[j];
          const isPickupStation = logicStations.some(ls =>
            ls.station_id === nextDetail.station_id && ls.station_type === 3);
          const isLastStation = (j === scheduleDetails.length - 1);

          // 如果是接车站点或末站
          if (isPickupStation || isLastStation) {
            const endStationName = stationMap[nextDetail.station_id];

            const rideTicket = {
              train_name: trainName,
              start_station: startStationName,
              end_station: endStationName
            };
            rideTickets.push(rideTicket);
            foundTicket = true;
            break;
          }
        }
      }
    }

    // 4.1.3 对当天所有车次按结束时间递减排序
    const sortedTrainSchedulesDesc = [...trainSchedules].sort((a, b) =>
      b.end_time.localeCompare(a.end_time)
    );

    // 4.1.4 生成退勤便乘票 - 增加首站末站处理
    for (const schedule of sortedTrainSchedulesDesc) {
      const trainName = schedule.train_name;
      const trainScheduleId = schedule.train_schedule_id;

      // 获取该车次的所有站点明细并按到达时间降序排列
      const scheduleDetails = trainScheduleDetails
        .filter(detail => detail.train_schedule_id === trainScheduleId)
        .sort((a, b) => b.arrive_time.localeCompare(a.arrive_time));

      // 如果没有站点明细，跳过该车次
      if (scheduleDetails.length === 0) {
        continue;
      }

      // 按算法逻辑：找出第一个退勤站点（station_type === 2）
      let firstOffDutyStation = null;
      let firstOffDutyIndex = -1;

      for (let i = 0; i < scheduleDetails.length; i++) {
        const detail = scheduleDetails[i];
        const isOffDutyStation = logicStations.some(ls =>
          ls.station_id === detail.station_id && ls.station_type === 2);
        if (isOffDutyStation) {
          firstOffDutyStation = detail;
          firstOffDutyIndex = i;
          break;
        }
      }

      // 如果找到退勤站点，查找后续的退车站点或首站
      if (firstOffDutyStation) {
        const endStationName = stationMap[firstOffDutyStation.station_id];

        // 查找后续的退车站点或首站
        let foundTicket = false;
        for (let j = firstOffDutyIndex + 1; j < scheduleDetails.length; j++) {
          const nextDetail = scheduleDetails[j];
          const isDropoffStation = logicStations.some(ls =>
            ls.station_id === nextDetail.station_id && ls.station_type === 4);
          const isFirstStation = (j === scheduleDetails.length - 1);

          // 如果是退车站点或首站
          if (isDropoffStation || isFirstStation) {
            const startStationName = stationMap[nextDetail.station_id];

            const rideTicket = {
              train_name: trainName,
              start_station: startStationName,
              end_station: endStationName
            };
            rideTickets.push(rideTicket);
            foundTicket = true;
            break;
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