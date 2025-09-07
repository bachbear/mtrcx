// 将时间字符串转换为分钟数（用于时间比较）
function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

// 添加分钟到时间字符串
function addMinutesToTime(timeStr, minutes) {
  const totalMinutes = timeToMinutes(timeStr) + minutes;
  const hours = Math.floor(totalMinutes / 60) % 24;
  const mins = totalMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

// 交路票串联逻辑：找到下一张合适的交路票
function findNextTicket(tickets, currentState, changeInterval) {
  // 3.4.2-3.4.3：优先寻找相同车次的后续交路票
  if (currentState.currentTrain) {
    const sameTrainTickets = tickets.filter(ticket =>
      ticket.train_name === currentState.currentTrain &&
      ticket.start_station === currentState.dropoffStation &&  // 确保站点连续
      timeToMinutes(ticket.pickup_time) >= timeToMinutes(currentState.dropoffTime) &&
      !ticket.is_sold  // 只考虑未售出的票
    );

    if (sameTrainTickets.length > 0) {
      // 按接车站到站时间排序取最早的一张
      sameTrainTickets.sort((a, b) => 
        timeToMinutes(a.pickup_time) - timeToMinutes(b.pickup_time)
      );
      return sameTrainTickets[0];
    }
  }

  // 3.4.5：寻找换乘的交路票（相同站点，考虑休息间隔）
  const minPickupTime = addMinutesToTime(currentState.dropoffTime, changeInterval);
  const changeTrainTickets = tickets.filter(ticket =>
    ticket.start_station === currentState.dropoffStation &&
    timeToMinutes(ticket.pickup_time) >= timeToMinutes(minPickupTime) &&
    !ticket.is_sold  // 只考虑未售出的票
  );

  if (changeTrainTickets.length > 0) {
    changeTrainTickets.sort((a, b) => 
      timeToMinutes(a.pickup_time) - timeToMinutes(b.pickup_time)
    );
    return changeTrainTickets[0];
  }

  return null;
}

// 交路截止逻辑：判断是否应该结束当前交路票夹
function shouldEndCollect(currentCollect, nextTicket, params) {
  const firstTicket = currentCollect[0];
  const nextPickupMinutes = timeToMinutes(nextTicket.pickup_time);
  const firstPickupMinutes = timeToMinutes(firstTicket.pickup_time);
  
  // 3.5.1.1：当前交路票的接车站到站时间与当前交路票链的第一张交路票的接车站到站时间间隔超过"最大开车时间"参数
  // (只有当"最大开车时间"参数启用时才应用此规则)
  if (params.maxDriveTimeEnabled && nextPickupMinutes - firstPickupMinutes > params.maxDriveTime) {
    console.log(`截止原因1: 时间间隔超过最大开车时间。当前票接车时间: ${nextTicket.pickup_time}, 第一张票接车时间: ${firstTicket.pickup_time}, 间隔: ${nextPickupMinutes - firstPickupMinutes}, 最大开车时间: ${params.maxDriveTime}`);
    return true;
  }
  
  // 3.5.1.2：当前交路票的退车站到站时间超过"白班接车时间"参数并且当前交路票链的第一张交路票的接车站到站时间超过"早班退车时间"参数
  // (只有当相关参数都启用时才应用此规则)
  // 修改：放宽条件，允许同一车次的连续票串联
  if (params.whiteShiftStartEnabled && params.earlyShiftEndEnabled && 
      timeToMinutes(nextTicket.dropoff_time) > timeToMinutes(params.whiteShiftStart) && 
      firstPickupMinutes > timeToMinutes(params.earlyShiftEnd) &&
      nextTicket.train_name !== firstTicket.train_name) {  // 只有不同车次时才应用此规则
    console.log(`截止原因2: 白班接车时间规则。当前票退车时间: ${nextTicket.dropoff_time}, 白班接车时间: ${params.whiteShiftStart}, 第一张票接车时间: ${firstTicket.pickup_time}, 早班退车时间: ${params.earlyShiftEnd}`);
    return true;
  }
  
  // 3.5.1.3：当前交路票的退车站到站时间超过"夜班接车时间"参数并且当前交路票链的第一张交路票的接车站到站时间超过"白班退车时间"参数
  // (只有当相关参数都启用时才应用此规则)
  // 修改：放宽条件，允许同一车次的连续票串联
  if (params.nightShiftStartEnabled && params.whiteShiftEndEnabled && 
      timeToMinutes(nextTicket.dropoff_time) > timeToMinutes(params.nightShiftStart) && 
      firstPickupMinutes > timeToMinutes(params.whiteShiftEnd) &&
      nextTicket.train_name !== firstTicket.train_name) {  // 只有不同车次时才应用此规则
    console.log(`截止原因3: 夜班接车时间规则。当前票退车时间: ${nextTicket.dropoff_time}, 夜班接车时间: ${params.nightShiftStart}, 第一张票接车时间: ${firstTicket.pickup_time}, 白班退车时间: ${params.whiteShiftEnd}`);
    return true;
  }
  
  // 3.5.1.4：当前交路票的退车站到站时间超过"早班接车时间"参数并且当前交路票链的第一张交路票的接车站到站时间超过"夜班退车时间"参数
  // (只有当相关参数都启用时才应用此规则)
  // 修改：放宽条件，允许同一车次的连续票串联
  if (params.earlyShiftStartEnabled && params.nightShiftEndEnabled && 
      timeToMinutes(nextTicket.dropoff_time) > timeToMinutes(params.earlyShiftStart) && 
      firstPickupMinutes > timeToMinutes(params.nightShiftEnd) &&
      nextTicket.train_name !== firstTicket.train_name) {  // 只有不同车次时才应用此规则
    console.log(`截止原因4: 早班接车时间规则。当前票退车时间: ${nextTicket.dropoff_time}, 早班接车时间: ${params.earlyShiftStart}, 第一张票接车时间: ${firstTicket.pickup_time}, 夜班退车时间: ${params.nightShiftEnd}`);
    return true;
  }
  
  // 3.5.1.5：当前交路票的接车站等于"强制回程站点"参数
  // (只有当"强制回程站点"参数启用时才应用此规则)
  if (params.mandatoryReturnStationEnabled && params.mandatoryReturnStation && nextTicket.start_station === params.mandatoryReturnStation) {
    console.log(`截止原因5: 强制回程站点规则。当前票接车站: ${nextTicket.start_station}, 强制回程站点: ${params.mandatoryReturnStation}`);
    return true;
  }
  
  return false;
}

// 在内存中生成交路票夹的函数（适用于Worker环境）
function generateDriveTicketCollectInMemory(driveTickets, paramsData) {
  try {
    // 将参数转换为易于使用的格式
    const paramMap = {};
    paramsData.forEach(param => {
      paramMap[param.param_name] = {
        value: param.param_value,
        type: param.param_type,
        enabled: param.is_checked
      };
    });

    // 获取业务参数值（带默认值）和启用状态
    const changeInterval = parseInt(paramMap['变更车次间隔时间']?.value.split(':')[1] || '30');
    const maxDriveTime = timeToMinutes(paramMap['最大开车时间']?.value || '24:00:00');
    const maxDriveTimeEnabled = paramMap['最大开车时间']?.enabled || false;
    const earlyShiftStart = paramMap['早班接车时间']?.value || '04:00:00';
    const earlyShiftStartEnabled = paramMap['早班接车时间']?.enabled || false;
    const earlyShiftEnd = paramMap['早班退车时间']?.value || '11:00:00';
    const earlyShiftEndEnabled = paramMap['早班退车时间']?.enabled || false;
    const whiteShiftStart = paramMap['白班接车时间']?.value || '11:00:00';
    const whiteShiftStartEnabled = paramMap['白班接车时间']?.enabled || false;
    const whiteShiftEnd = paramMap['白班退车时间']?.value || '16:00:00';
    const whiteShiftEndEnabled = paramMap['白班退车时间']?.enabled || false;
    const nightShiftStart = paramMap['夜班接车时间']?.value || '16:00:00';
    const nightShiftStartEnabled = paramMap['夜班接车时间']?.enabled || false;
    const nightShiftEnd = paramMap['夜班退车时间']?.value || '22:00:00';
    const nightShiftEndEnabled = paramMap['夜班退车时间']?.enabled || false;
    const mandatoryReturnStation = paramMap['强制回程站点']?.value || '';
    const mandatoryReturnStationEnabled = paramMap['强制回程站点']?.enabled || false;

    // 参数对象用于传递给shouldEndCollect函数
    const params = {
      maxDriveTime: maxDriveTime,
      maxDriveTimeEnabled: maxDriveTimeEnabled,
      earlyShiftStart,
      earlyShiftStartEnabled: earlyShiftStartEnabled,
      earlyShiftEnd,
      earlyShiftEndEnabled: earlyShiftEndEnabled,
      whiteShiftStart,
      whiteShiftStartEnabled: whiteShiftStartEnabled,
      whiteShiftEnd,
      whiteShiftEndEnabled: whiteShiftEndEnabled,
      nightShiftStart,
      nightShiftStartEnabled: nightShiftStartEnabled,
      nightShiftEnd,
      nightShiftEndEnabled: nightShiftEndEnabled,
      mandatoryReturnStation,
      mandatoryReturnStationEnabled: mandatoryReturnStationEnabled
    };

    // 3.2.1 把交路票数据表中的所有记录的is_sold字段设置为false
    let unsoldTickets = driveTickets.map(ticket => ({
      ...ticket,
      is_sold: false
    }));

    const collectList = [];
    let collectId = 1;

    // 3.2.2-3.2.4 主循环：遍历所有未售出的交路票
    while (unsoldTickets.some(ticket => !ticket.is_sold)) {
      // 找到第一张未售出的票
      const firstTicket = unsoldTickets.find(ticket => !ticket.is_sold);
      if (!firstTicket) break;

      // 创建新的交路票夹链条
      const currentCollect = [firstTicket];
      firstTicket.is_sold = true;
      
      // 更新unsoldTickets数组
      unsoldTickets = unsoldTickets.map(ticket => 
        ticket.ticket_id === firstTicket.ticket_id ? {...ticket, is_sold: true} : ticket
      );

      // 初始化状态以便寻找下一张票
      let currentState = {
        dropoffTime: firstTicket.dropoff_time,
        dropoffStation: firstTicket.end_station,
        currentTrain: firstTicket.train_name
      };

      // 3.4.1-3.4.5 循环寻找后续交路票
      let nextTicket;
      do {
        // 3.4.1 调用"交路票串联逻辑"，把当前交路票夹链条的最后一张交路票和变更车次间隔时间作为输入参数
        nextTicket = findNextTicket(unsoldTickets, currentState, changeInterval);
        
        if (nextTicket) {
          // 3.2.4 调用"交路截止逻辑"，把3.2.2产生的交路票序号链和3.2.3产生的交路票作为输入参数，判断是否需要继续挑选下一张交路票
          // 如果交路截止逻辑返回true，表示应该结束当前交路票夹，则退出循环
          const shouldEnd = shouldEndCollect(currentCollect, nextTicket, params);
          if (shouldEnd) {
            console.log(`截止逻辑返回true，结束链条。当前链条: [${currentCollect.map(t => t.ticket_id).join(', ')}], 下一张票: ${nextTicket.ticket_id}`);
            break;
          }

          // 如果交路截止逻辑返回false，表示不需要结束当前交路票夹，继续添加当前交路票到链条中
          currentCollect.push(nextTicket);
          // 标记为已售出
          nextTicket.is_sold = true;
          // 更新unsoldTickets数组
          unsoldTickets = unsoldTickets.map(ticket => 
            ticket.ticket_id === nextTicket.ticket_id ? {...ticket, is_sold: true} : ticket
          );
          console.log(`添加票到链条: ${nextTicket.ticket_id}, 车次: ${nextTicket.train_name}, 站点: ${nextTicket.start_station} -> ${nextTicket.end_station}`);
          // 更新状态以便继续寻找下一张票
          currentState = {
            dropoffTime: nextTicket.dropoff_time,
            dropoffStation: nextTicket.end_station,
            currentTrain: nextTicket.train_name
          };
        }
      } while (nextTicket);

      // 生成ticket_chain（用'->'连接交路票序号）
      const ticketChain = currentCollect.map(ticket => ticket.ticket_id).join('->');
      
      // 添加到交路票夹列表
      collectList.push({
        id: collectId,
        collect_id: collectId,
        ticket_chain: ticketChain
      });

      collectId++;
    }

    console.log(`成功生成 ${collectList.length} 个交路票夹`);
    return collectList;
  } catch (error) {
    console.error('生成交路票夹时发生错误:', error);
    throw error;
  }
}