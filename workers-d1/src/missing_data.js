// 修复缺失的列车时刻表明细数据
const missingDetails = [
  // G00201 (train_schedule_id: 105) - 20条明细
  { train_schedule_detail_id: 81, line_id: 1, train_schedule_id: 105, station_id: 1, arrive_time: "06:10:00", depart_time: "06:11:00", stop_time: 1, run_time: 5, stop_type: 1, direction: 1 },
  { train_schedule_detail_id: 82, line_id: 1, train_schedule_id: 105, station_id: 2, arrive_time: "06:16:00", depart_time: "06:17:00", stop_time: 1, run_time: 5, stop_type: 1, direction: 1 },
  { train_schedule_detail_id: 83, line_id: 1, train_schedule_id: 105, station_id: 3, arrive_time: "06:22:00", depart_time: "06:23:00", stop_time: 1, run_time: 5, stop_type: 1, direction: 1 },
  { train_schedule_detail_id: 84, line_id: 1, train_schedule_id: 105, station_id: 4, arrive_time: "06:28:00", depart_time: "06:29:00", stop_time: 1, run_time: 5, stop_type: 1, direction: 1 },
  { train_schedule_detail_id: 85, line_id: 1, train_schedule_id: 105, station_id: 5, arrive_time: "06:34:00", depart_time: "06:35:00", stop_time: 1, run_time: 5, stop_type: 1, direction: 1 },
  { train_schedule_detail_id: 86, line_id: 1, train_schedule_id: 105, station_id: 6, arrive_time: "06:40:00", depart_time: "06:41:00", stop_time: 1, run_time: 5, stop_type: 1, direction: 1 },
  { train_schedule_detail_id: 87, line_id: 1, train_schedule_id: 105, station_id: 7, arrive_time: "06:46:00", depart_time: "06:47:00", stop_time: 1, run_time: 5, stop_type: 1, direction: 1 },
  { train_schedule_detail_id: 88, line_id: 1, train_schedule_id: 105, station_id: 8, arrive_time: "06:52:00", depart_time: "06:53:00", stop_time: 1, run_time: 5, stop_type: 1, direction: 1 },
  { train_schedule_detail_id: 89, line_id: 1, train_schedule_id: 105, station_id: 9, arrive_time: "06:58:00", depart_time: "06:59:00", stop_time: 1, run_time: 5, stop_type: 1, direction: 1 },
  { train_schedule_detail_id: 90, line_id: 1, train_schedule_id: 105, station_id: 10, arrive_time: "07:04:00", depart_time: "07:05:00", stop_time: 1, run_time: 5, stop_type: 1, direction: 1 },
  { train_schedule_detail_id: 91, line_id: 1, train_schedule_id: 105, station_id: 11, arrive_time: "07:10:00", depart_time: "07:11:00", stop_time: 1, run_time: 5, stop_type: 1, direction: 1 },
  { train_schedule_detail_id: 92, line_id: 1, train_schedule_id: 105, station_id: 12, arrive_time: "07:16:00", depart_time: "07:17:00", stop_time: 1, run_time: 5, stop_type: 1, direction: 1 },
  { train_schedule_detail_id: 93, line_id: 1, train_schedule_id: 105, station_id: 13, arrive_time: "07:22:00", depart_time: "07:23:00", stop_time: 1, run_time: 5, stop_type: 1, direction: 1 },
  { train_schedule_detail_id: 94, line_id: 1, train_schedule_id: 105, station_id: 14, arrive_time: "07:28:00", depart_time: "07:29:00", stop_time: 1, run_time: 5, stop_type: 1, direction: 1 },
  { train_schedule_detail_id: 95, line_id: 1, train_schedule_id: 105, station_id: 15, arrive_time: "07:34:00", depart_time: "07:35:00", stop_time: 1, run_time: 5, stop_type: 1, direction: 1 },
  { train_schedule_detail_id: 96, line_id: 1, train_schedule_id: 105, station_id: 16, arrive_time: "07:40:00", depart_time: "07:41:00", stop_time: 1, run_time: 5, stop_type: 1, direction: 1 },
  { train_schedule_detail_id: 97, line_id: 1, train_schedule_id: 105, station_id: 17, arrive_time: "07:46:00", depart_time: "07:47:00", stop_time: 1, run_time: 5, stop_type: 1, direction: 1 },
  { train_schedule_detail_id: 98, line_id: 1, train_schedule_id: 105, station_id: 18, arrive_time: "07:52:00", depart_time: "07:53:00", stop_time: 1, run_time: 5, stop_type: 1, direction: 1 },
  { train_schedule_detail_id: 99, line_id: 1, train_schedule_id: 105, station_id: 19, arrive_time: "07:58:00", depart_time: "07:59:00", stop_time: 1, run_time: 5, stop_type: 1, direction: 1 },
  { train_schedule_detail_id: 100, line_id: 1, train_schedule_id: 105, station_id: 20, arrive_time: "08:04:00", depart_time: "08:05:00", stop_time: 1, run_time: 5, stop_type: 1, direction: 1 },

  // G00202 (train_schedule_id: 106) - 20条明细
  { train_schedule_detail_id: 101, line_id: 1, train_schedule_id: 106, station_id: 20, arrive_time: "08:11:00", depart_time: "08:12:00", stop_time: 1, run_time: 5, stop_type: 1, direction: 2 },
  { train_schedule_detail_id: 102, line_id: 1, train_schedule_id: 106, station_id: 19, arrive_time: "08:17:00", depart_time: "08:18:00", stop_time: 1, run_time: 5, stop_type: 1, direction: 2 },
  { train_schedule_detail_id: 103, line_id: 1, train_schedule_id: 106, station_id: 18, arrive_time: "08:23:00", depart_time: "08:24:00", stop_time: 1, run_time: 5, stop_type: 1, direction: 2 },
  { train_schedule_detail_id: 104, line_id: 1, train_schedule_id: 106, station_id: 17, arrive_time: "08:29:00", depart_time: "08:30:00", stop_time: 1, run_time: 5, stop_type: 1, direction: 2 },
  { train_schedule_detail_id: 105, line_id: 1, train_schedule_id: 106, station_id: 16, arrive_time: "08:35:00", depart_time: "08:36:00", stop_time: 1, run_time: 5, stop_type: 1, direction: 2 },
  { train_schedule_detail_id: 106, line_id: 1, train_schedule_id: 106, station_id: 15, arrive_time: "08:41:00", depart_time: "08:42:00", stop_time: 1, run_time: 5, stop_type: 1, direction: 2 },
  { train_schedule_detail_id: 107, line_id: 1, train_schedule_id: 106, station_id: 14, arrive_time: "08:47:00", depart_time: "08:48:00", stop_time: 1, run_time: 5, stop_type: 1, direction: 2 },
  { train_schedule_detail_id: 108, line_id: 1, train_schedule_id: 106, station_id: 13, arrive_time: "08:53:00", depart_time: "08:54:00", stop_time: 1, run_time: 5, stop_type: 1, direction: 2 },
  { train_schedule_detail_id: 109, line_id: 1, train_schedule_id: 106, station_id: 12, arrive_time: "08:59:00", depart_time: "09:00:00", stop_time: 1, run_time: 5, stop_type: 1, direction: 2 },
  { train_schedule_detail_id: 110, line_id: 1, train_schedule_id: 106, station_id: 11, arrive_time: "09:05:00", depart_time: "09:06:00", stop_time: 1, run_time: 5, stop_type: 1, direction: 2 },
  { train_schedule_detail_id: 111, line_id: 1, train_schedule_id: 106, station_id: 10, arrive_time: "09:11:00", depart_time: "09:12:00", stop_time: 1, run_time: 5, stop_type: 1, direction: 2 },
  { train_schedule_detail_id: 112, line_id: 1, train_schedule_id: 106, station_id: 9, arrive_time: "09:17:00", depart_time: "09:18:00", stop_time: 1, run_time: 5, stop_type: 1, direction: 2 },
  { train_schedule_detail_id: 113, line_id: 1, train_schedule_id: 106, station_id: 8, arrive_time: "09:23:00", depart_time: "09:24:00", stop_time: 1, run_time: 5, stop_type: 1, direction: 2 },
  { train_schedule_detail_id: 114, line_id: 1, train_schedule_id: 106, station_id: 7, arrive_time: "09:29:00", depart_time: "09:30:00", stop_time: 1, run_time: 5, stop_type: 1, direction: 2 },
  { train_schedule_detail_id: 115, line_id: 1, train_schedule_id: 106, station_id: 6, arrive_time: "09:35:00", depart_time: "09:36:00", stop_time: 1, run_time: 5, stop_type: 1, direction: 2 },
  { train_schedule_detail_id: 116, line_id: 1, train_schedule_id: 106, station_id: 5, arrive_time: "09:41:00", depart_time: "09:42:00", stop_time: 1, run_time: 5, stop_type: 1, direction: 2 },
  { train_schedule_detail_id: 117, line_id: 1, train_schedule_id: 106, station_id: 4, arrive_time: "09:47:00", depart_time: "09:48:00", stop_time: 1, run_time: 5, stop_type: 1, direction: 2 },
  { train_schedule_detail_id: 118, line_id: 1, train_schedule_id: 106, station_id: 3, arrive_time: "09:53:00", depart_time: "09:54:00", stop_time: 1, run_time: 5, stop_type: 1, direction: 2 },
  { train_schedule_detail_id: 119, line_id: 1, train_schedule_id: 106, station_id: 2, arrive_time: "09:59:00", depart_time: "10:00:00", stop_time: 1, run_time: 5, stop_type: 1, direction: 2 },
  { train_schedule_detail_id: 120, line_id: 1, train_schedule_id: 106, station_id: 1, arrive_time: "10:05:00", depart_time: "10:06:00", stop_time: 1, run_time: 5, stop_type: 1, direction: 2 }
];

export { missingDetails };