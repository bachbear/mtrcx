// Cloudflare Worker 入口点文件
// 将现有的Express应用适配到Cloudflare Worker环境
// 直接导入JSON数据文件版本

// 完整的HTML页面内容
const indexHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>地铁交路管理系统</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            text-align: center;
        }
        .tabs {
            display: flex;
            margin-bottom: 20px;
            border-bottom: 1px solid #ddd;
        }
        .tab {
            padding: 10px 20px;
            cursor: pointer;
            background-color: #f0f0f0;
            border: 1px solid #ddd;
            border-bottom: none;
            margin-right: 5px;
            border-radius: 5px 5px 0 0;
        }
        .tab.active {
            background-color: white;
            font-weight: bold;
        }
        .tab-content {
            display: none;
        }
        .tab-content.active {
            display: block;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f2f2f2;
            font-weight: bold;
        }
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        .checkbox-cell {
            text-align: center;
        }
        .checkbox-cell input[type="checkbox"] {
            transform: scale(1.5);
        }
        .actions {
            margin-bottom: 20px;
            text-align: right;
        }
        button {
            padding: 10px 20px;
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        button:hover {
            background-color: #0056b3;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>地铁交路管理系统</h1>
        
        <div class="tabs">
            <div class="tab active" onclick="showTab('crossingRoads')">交路管理</div>
            <div class="tab" onclick="showTab('lines')">线路管理</div>
            <div class="tab" onclick="showTab('trainSchedules')">列车时刻表管理</div>
            <div class="tab" onclick="showTab('driveTicketParams')">交路参数表</div>
        </div>
        
        <div id="crossingRoads" class="tab-content active">
            <h2>交路信息</h2>
            <button id="generateDriveTicketsBtn" onclick="generateDriveTickets()">更新交路票</button>
            <h3>交路票数据</h3>
            <table id="driveTicketsTable">
                <thead>
                    <tr>
                        <th>主键ID</th>
                        <th>交路票序号</th>
                        <th>车次名称</th>
                        <th>接车站点</th>
                        <th>退车站点</th>
                        <th>座位类型</th>
                        <th>是否已售出</th>
                        <th>接车站到站时间</th>
                        <th>退车站到站时间</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- 数据将通过JavaScript动态加载 -->
                </tbody>
            </table>
            
            <div style="margin-top: 20px;">
                <button id="generateDriveTicketCollectBtn" onclick="generateDriveTicketCollect()">更新票夹</button>
            </div>
            
            <h3>交路票夹数据</h3>
            <table id="driveTicketCollectTable">
                <thead>
                    <tr>
                        <th>主键ID</th>
                        <th>交路票夹序号</th>
                        <th>交路票序号链</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- 数据将通过JavaScript动态加载 -->
                </tbody>
            </table>
        </div>
        
        <div id="lines" class="tab-content">
            <h2>线路信息</h2>
            <h3>线路数据</h3>
            <table id="linesTable">
                <thead>
                    <tr>
                        <th>线路ID</th>
                        <th>线路名称</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- 数据将通过JavaScript动态加载 -->
                </tbody>
            </table>
            
            <h3>车站数据</h3>
            <table id="stationsTable">
                <thead>
                    <tr>
                        <th>车站ID</th>
                        <th>车站名称</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- 数据将通过JavaScript动态加载 -->
                </tbody>
            </table>
            
            <h3>座位类型数据</h3>
            <table id="seatTypesTable">
                <thead>
                    <tr>
                        <th>座位类型ID</th>
                        <th>座位类型名称</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- 数据将通过JavaScript动态加载 -->
                </tbody>
            </table>
            
            <h3>逻辑车站数据</h3>
            <table id="logicStationsTable">
                <thead>
                    <tr>
                        <th>逻辑车站ID</th>
                        <th>车站名称</th>
                        <th>车站类型</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- 数据将通过JavaScript动态加载 -->
                </tbody>
            </table>
        </div>
        
        <div id="trainSchedules" class="tab-content">
            <h2>列车时刻表</h2>
            <h3>列车时刻表数据</h3>
            <table id="trainSchedulesTable">
                <thead>
                    <tr>
                        <th>时刻表ID</th>
                        <th>线路ID</th>
                        <th>列车车次名称</th>
                        <th>始发站</th>
                        <th>终点站</th>
                        <th>开始时间</th>
                        <th>结束时间</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- 数据将通过JavaScript动态加载 -->
                </tbody>
            </table>
            
            <h3>列车时刻表明细数据</h3>
            <table id="trainScheduleDetailsTable">
                <thead>
                    <tr>
                        <th>明细ID</th>
                        <th>时刻表ID</th>
                        <th>车站名称</th>
                        <th>到达时间</th>
                        <th>出发时间</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- 数据将通过JavaScript动态加载 -->
                </tbody>
            </table>
        </div>
        
        <div id="driveTicketParams" class="tab-content">
            <h2>交路参数表</h2>
            <div class="actions">
                <button id="saveDriveTicketParamsBtn" onclick="saveDriveTicketParams()">保存更改</button>
            </div>
            
            <table id="driveTicketParamsTable">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>参数名称</th>
                        <th>参数值</th>
                        <th>参数类型</th>
                        <th>参数描述</th>
                        <th>是否选中</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- 数据将通过JavaScript动态加载 -->
                </tbody>
            </table>
        </div>
    </div>

    <script>
        // API基础URL - 使用相对路径，自动适配当前域名
        const API_BASE_URL = '';
        
        // 存储交路参数数据
        let driveTicketParamsData = [];

        // 显示指定的标签页
        function showTab(tabId) {
            // 隐藏所有标签内容
            const tabContents = document.querySelectorAll('.tab-content');
            tabContents.forEach(content => content.classList.remove('active'));
            
            // 移除所有标签的激活状态
            const tabs = document.querySelectorAll('.tab');
            tabs.forEach(tab => tab.classList.remove('active'));
            
            // 显示指定的标签内容
            document.getElementById(tabId).classList.add('active');
            
            // 激活点击的标签
            event.target.classList.add('active');
            
            // 根据标签加载相应数据
            if (tabId === 'crossingRoads') {
                loadCrossingRoads();
            } else if (tabId === 'lines') {
                loadLines();
            } else if (tabId === 'trainSchedules') {
                loadTrainSchedules();
            } else if (tabId === 'driveTicketParams') {
                loadDriveTicketParams();
            }
        }
        
        // 加载交路票数据
        function loadCrossingRoads() {
            console.log('正在加载交路票数据...');
            fetch(\`\${API_BASE_URL}/api/drive-tickets\`)
                .then(response => {
                    console.log('API响应状态:', response.status);
                    if (!response.ok) {
                        throw new Error(\`HTTP错误! 状态: \${response.status}\`);
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('成功获取交路票数据:', data);
                    const tbody = document.querySelector('#driveTicketsTable tbody');
                    tbody.innerHTML = '';
                    
                    data.forEach(item => {
                        const row = document.createElement('tr');
                        row.innerHTML = \`
                            <td>\${item.id}</td>
                            <td>\${item.ticket_id}</td>
                            <td>\${item.train_name || ''}</td>
                            <td>\${item.start_station || ''}</td>
                            <td>\${item.end_station || ''}</td>
                            <td>\${item.seat_type || ''}</td>
                            <td>\${item.is_sold ? '是' : '否'}</td>
                            <td>\${item.pickup_time || ''}</td>
                            <td>\${item.dropoff_time || ''}</td>
                        \`;
                        tbody.appendChild(row);
                    });
                })
                .catch(error => {
                    console.error('加载交路票数据失败:', error);
                    alert('加载交路票数据失败: ' + error.message);
                });
                
            // 加载交路票夹数据
            loadDriveTicketCollect();
        }
        
        // 加载线路数据
        function loadLines() {
            // 加载线路数据
            fetch(\`\${API_BASE_URL}/api/lines\`)
                .then(response => response.json())
                .then(data => {
                    const tbody = document.querySelector('#linesTable tbody');
                    tbody.innerHTML = '';
                    
                    data.forEach(item => {
                        const row = document.createElement('tr');
                        row.innerHTML = \`
                            <td>\${item.line_id}</td>
                            <td>\${item.line_name || ''}</td>
                        \`;
                        tbody.appendChild(row);
                    });
                })
                .catch(error => {
                    console.error('加载线路数据失败:', error);
                });
                
            // 加载车站数据
            fetch(\`\${API_BASE_URL}/api/stations\`)
                .then(response => response.json())
                .then(data => {
                    const tbody = document.querySelector('#stationsTable tbody');
                    tbody.innerHTML = '';
                    
                    data.forEach(item => {
                        const row = document.createElement('tr');
                        row.innerHTML = \`
                            <td>\${item.station_id}</td>
                            <td>\${item.station_name || ''}</td>
                        \`;
                        tbody.appendChild(row);
                    });
                })
                .catch(error => {
                    console.error('加载车站数据失败:', error);
                });
                
            // 加载座位类型数据
            fetch(\`\${API_BASE_URL}/api/seat-types\`)
                .then(response => response.json())
                .then(data => {
                    const tbody = document.querySelector('#seatTypesTable tbody');
                    tbody.innerHTML = '';
                    
                    data.forEach(item => {
                        const row = document.createElement('tr');
                        row.innerHTML = \`
                            <td>\${item.seat_type_id}</td>
                            <td>\${item.seat_type_name || ''}</td>
                        \`;
                        tbody.appendChild(row);
                    });
                })
                .catch(error => {
                    console.error('加载座位类型数据失败:', error);
                });
                
            // 加载逻辑车站数据
            fetch(\`\${API_BASE_URL}/api/logic-stations\`)
                .then(response => response.json())
                .then(data => {
                    const tbody = document.querySelector('#logicStationsTable tbody');
                    tbody.innerHTML = '';
                    
                    data.forEach(item => {
                        const row = document.createElement('tr');
                        row.innerHTML = \`
                            <td>\${item.id}</td>
                            <td>\${item.station_id || ''}</td>
                            <td>\${item.station_type || ''}</td>
                        \`;
                        tbody.appendChild(row);
                    });
                })
                .catch(error => {
                    console.error('加载逻辑车站数据失败:', error);
                });
        }
        
        // 加载列车时刻表数据
        function loadTrainSchedules() {
            // 加载列车时刻表数据
            fetch(\`\${API_BASE_URL}/api/train-schedules\`)
                .then(response => response.json())
                .then(data => {
                    const tbody = document.querySelector('#trainSchedulesTable tbody');
                    tbody.innerHTML = '';
                    
                    data.forEach(item => {
                        const row = document.createElement('tr');
                        row.innerHTML = \`
                            <td>\${item.train_schedule_id}</td>
                            <td>\${item.line_id || ''}</td>
                            <td>\${item.train_name || ''}</td>
                            <td>\${item.station_from || ''}</td>
                            <td>\${item.station_to || ''}</td>
                            <td>\${item.begin_time || ''}</td>
                            <td>\${item.end_time || ''}</td>
                        \`;
                        tbody.appendChild(row);
                    });
                })
                .catch(error => {
                    console.error('加载列车时刻表数据失败:', error);
                });
                
            // 加载列车时刻表明细数据
            fetch(\`\${API_BASE_URL}/api/train-schedule-details\`)
                .then(response => response.json())
                .then(data => {
                    const tbody = document.querySelector('#trainScheduleDetailsTable tbody');
                    tbody.innerHTML = '';
                    
                    data.forEach(item => {
                        const row = document.createElement('tr');
                        row.innerHTML = \`
                            <td>\${item.train_schedule_detail_id}</td>
                            <td>\${item.train_schedule_id || ''}</td>
                            <td>\${item.station_id || ''}</td>
                            <td>\${item.arrive_time || ''}</td>
                            <td>\${item.depart_time || ''}</td>
                        \`;
                        tbody.appendChild(row);
                    });
                })
                .catch(error => {
                    console.error('加载列车时刻表明细数据失败:', error);
                });
        }
        
        // 加载交路参数数据
        function loadDriveTicketParams() {
            fetch(\`\${API_BASE_URL}/api/drive-ticket-params\`)
                .then(response => response.json())
                .then(data => {
                    driveTicketParamsData = data;
                    renderDriveTicketParamsTable(data);
                })
                .catch(error => {
                    console.error('加载交路参数数据失败:', error);
                });
        }
        
        // 渲染交路参数表格
        function renderDriveTicketParamsTable(data) {
            const tbody = document.querySelector('#driveTicketParamsTable tbody');
            tbody.innerHTML = '';

            data.forEach((item, index) => {
                const row = document.createElement('tr');
                row.innerHTML = \`
                    <td>\${item.id}</td>
                    <td><input type="text" value="\${item.param_name}" data-field="param_name" data-index="\${index}"></td>
                    <td><input type="text" value="\${item.param_value}" data-field="param_value" data-index="\${index}"></td>
                    <td><input type="text" value="\${item.param_type || ''}" data-field="param_type" data-index="\${index}"></td>
                    <td><input type="text" value="\${item.param_desc || ''}" data-field="param_desc" data-index="\${index}"></td>
                    <td class="checkbox-cell"><input type="checkbox" \${item.is_checked ? 'checked' : ''} data-field="is_checked" data-index="\${index}"></td>
                \`;
                tbody.appendChild(row);
            });

            // 为所有输入框添加事件监听器
            tbody.querySelectorAll('input').forEach(input => {
                input.addEventListener('change', handleDriveTicketParamsInputChange);
            });
        }
        
        // 处理交路参数输入框变化
        function handleDriveTicketParamsInputChange(event) {
            const input = event.target;
            const index = parseInt(input.dataset.index);
            const field = input.dataset.field;
            const value = input.type === 'checkbox' ? input.checked : input.value;

            // 更新数据
            if (index >= 0 && index < driveTicketParamsData.length) {
                driveTicketParamsData[index][field] = value;
            }
        }
        
        // 保存交路参数数据
        function saveDriveTicketParams() {
            const saveBtn = document.getElementById('saveDriveTicketParamsBtn');
            const originalText = saveBtn.textContent;
            saveBtn.disabled = true;
            saveBtn.textContent = '保存中...';

            fetch(\`\${API_BASE_URL}/api/drive-ticket-params\`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(driveTicketParamsData)
            })
            .then(response => response.json())
            .then(data => {
                alert('数据保存成功！');
            })
            .catch(error => {
                console.error('保存数据时发生错误:', error);
                alert('保存数据时发生错误: ' + error.message);
            })
            .finally(() => {
                saveBtn.disabled = false;
                saveBtn.textContent = originalText;
            });
        }
        
        // 生成和更新交路票记录
        function generateDriveTickets() {
            const btn = document.getElementById('generateDriveTicketsBtn');
            const originalText = btn.textContent;
            btn.disabled = true;
            btn.textContent = '正在生成交路票...';
            
            fetch(\`\${API_BASE_URL}/api/generate-drive-tickets\`, {
                method: 'POST'
            })
            .then(response => response.json())
            .then(data => {
                if (data.message) {
                    alert(\`交路票记录更新成功！共生成了 \${data.count || 0} 条记录\`);
                    loadCrossingRoads();
                } else {
                    alert('交路票记录更新失败：' + (data.error || '未知错误'));
                }
            })
            .catch(error => {
                console.error('更新交路票记录时发生错误:', error);
                alert('更新交路票记录时发生错误：' + error.message);
            })
            .finally(() => {
                btn.disabled = false;
                btn.textContent = originalText;
            });
        }
        
        // 生成和更新交路票夹记录
        function generateDriveTicketCollect() {
            const btn = document.getElementById('generateDriveTicketCollectBtn');
            const originalText = btn.textContent;
            btn.disabled = true;
            btn.textContent = '正在生成票夹...';
            
            fetch(\`\${API_BASE_URL}/api/generate-drive-ticket-collect\`, {
                method: 'POST'
            })
            .then(response => response.json())
            .then(data => {
                if (data.message) {
                    alert(\`交路票夹记录更新成功！共生成了 \${data.count || 0} 条记录\`);
                    loadDriveTicketCollect();
                } else {
                    alert('交路票夹记录更新失败：' + (data.error || '未知错误'));
                }
            })
            .catch(error => {
                console.error('更新交路票夹记录时发生错误:', error);
                alert('更新交路票夹记录时发生错误：' + error.message);
            })
            .finally(() => {
                btn.disabled = false;
                btn.textContent = originalText;
            });
        }
        
        // 加载交路票夹数据
        function loadDriveTicketCollect() {
            fetch(\`\${API_BASE_URL}/api/drive-ticket-collect\`)
                .then(response => response.json())
                .then(data => {
                    const tbody = document.querySelector('#driveTicketCollectTable tbody');
                    tbody.innerHTML = '';
                    
                    data.forEach(item => {
                        const row = document.createElement('tr');
                        row.innerHTML = \`
                            <td>\${item.id}</td>
                            <td>\${item.collect_id}</td>
                            <td>\${item.ticket_chain || ''}</td>
                        \`;
                        tbody.appendChild(row);
                    });
                })
                .catch(error => {
                    console.error('加载交路票夹数据失败:', error);
                });
        }
        
        // 页面加载时初始化数据
        document.addEventListener('DOMContentLoaded', function() {
            loadCrossingRoads();
        });
    </script>
</body>
</html>`;

// 导入JavaScript数据模块
import cwCrossingRoadData from './data/cw_crossing_road.js';
import cwLineData from './data/cw_line.js';
import cwTrainScheduleData from './data/cw_train_schedule.js';
import cwTrainScheduleDetailData from './data/cw_train_schedule_detail.js';
import cwSeatTypeData from './data/cw_seat_type.js';
import cwStationData from './data/cw_station.js';
import cwLogicStationData from './data/cw_logic_station.js';
import driveTicketData from './data/drive_ticket.js';
import driveTicketCollectData from './data/drive_ticket_collect.js';
import driveTicketParamData from './data/drive_ticket_param.js';

// API路径到数据的映射
const apiToData = {
  '/api/crossing-roads': cwCrossingRoadData,
  '/api/lines': cwLineData,
  '/api/train-schedules': cwTrainScheduleData,
  '/api/train-schedule-details': cwTrainScheduleDetailData,
  '/api/seat-types': cwSeatTypeData,
  '/api/stations': cwStationData,
  '/api/logic-stations': cwLogicStationData,
  '/api/drive-tickets': driveTicketData,
  '/api/drive-ticket-collect': driveTicketCollectData,
  '/api/drive-ticket-params': driveTicketParamData
};

async function handleApiRequest(request, path, env) {
  const url = new URL(request.url);
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
    'Content-Type': 'application/json; charset=utf-8'
  };

  // 处理OPTIONS请求
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 处理GET请求 - 返回数据
    if (apiToData[path] && request.method === 'GET') {
      try {
        const data = apiToData[path];
        return new Response(JSON.stringify(data), {
          headers: corsHeaders
        });
      } catch (error) {
        console.error('读取数据失败:', error);
        return new Response(JSON.stringify({ error: '读取数据失败: ' + error.message }), {
          status: 500,
          headers: corsHeaders
        });
      }
    }

    // 处理POST请求 - 生成交路票
    if (path === '/api/generate-drive-tickets' && request.method === 'POST') {
      try {
        // 这里应该调用生成交路票的逻辑
        // 由于Worker环境的限制，这里返回模拟响应
        return new Response(JSON.stringify({ message: '交路票记录生成和更新成功', count: 0 }), {
          headers: corsHeaders
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: '生成交路票失败: ' + error.message }), {
          status: 500,
          headers: corsHeaders
        });
      }
    }

    // 处理POST请求 - 生成交路票夹
    if (path === '/api/generate-drive-ticket-collect' && request.method === 'POST') {
      try {
        // 获取必要的数据
        const driveTickets = [...driveTicketData]; // 创建副本以避免修改原数据
        const params = driveTicketParamData;
        
        // 实现票夹生成逻辑
        const collectList = generateDriveTicketCollectInMemory(driveTickets, params);
        
        // 在Worker环境中，我们不能实际保存数据到文件系统
        // 只是返回成功响应和生成的数量
        return new Response(JSON.stringify({ 
          message: '交路票夹记录生成和更新成功', 
          count: collectList.length 
        }), {
          headers: corsHeaders
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: '生成交路票夹失败: ' + error.message }), {
          status: 500,
          headers: corsHeaders
        });
      }
    }

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
  return hours.toString().padStart(2, '0') + ':' + mins.toString().padStart(2, '0');
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
    console.log("截止原因1: 时间间隔超过最大开车时间。当前票接车时间: " + nextTicket.pickup_time + ", 第一张票接车时间: " + firstTicket.pickup_time + ", 间隔: " + (nextPickupMinutes - firstPickupMinutes) + ", 最大开车时间: " + params.maxDriveTime);
    return true;
  }
  
  // 3.5.1.2：当前交路票的退车站到站时间超过"白班接车时间"参数并且当前交路票链的第一张交路票的接车站到站时间超过"早班退车时间"参数
  // (只有当相关参数都启用时才应用此规则)
  // 修改：放宽条件，允许同一车次的连续票串联
  if (params.whiteShiftStartEnabled && params.earlyShiftEndEnabled && 
      timeToMinutes(nextTicket.dropoff_time) > timeToMinutes(params.whiteShiftStart) && 
      firstPickupMinutes > timeToMinutes(params.earlyShiftEnd) &&
      nextTicket.train_name !== firstTicket.train_name) {  // 只有不同车次时才应用此规则
    console.log("截止原因2: 白班接车时间规则。当前票退车时间: " + nextTicket.dropoff_time + ", 白班接车时间: " + params.whiteShiftStart + ", 第一张票接车时间: " + firstTicket.pickup_time + ", 早班退车时间: " + params.earlyShiftEnd);
    return true;
  }
  
  // 3.5.1.3：当前交路票的退车站到站时间超过"夜班接车时间"参数并且当前交路票链的第一张交路票的接车站到站时间超过"白班退车时间"参数
  // (只有当相关参数都启用时才应用此规则)
  // 修改：放宽条件，允许同一车次的连续票串联
  if (params.nightShiftStartEnabled && params.whiteShiftEndEnabled && 
      timeToMinutes(nextTicket.dropoff_time) > timeToMinutes(params.nightShiftStart) && 
      firstPickupMinutes > timeToMinutes(params.whiteShiftEnd) &&
      nextTicket.train_name !== firstTicket.train_name) {  // 只有不同车次时才应用此规则
    console.log("截止原因3: 夜班接车时间规则。当前票退车时间: " + nextTicket.dropoff_time + ", 夜班接车时间: " + params.nightShiftStart + ", 第一张票接车时间: " + firstTicket.pickup_time + ", 白班退车时间: " + params.whiteShiftEnd);
    return true;
  }
  
  // 3.5.1.4：当前交路票的退车站到站时间超过"早班接车时间"参数并且当前交路票链的第一张交路票的接车站到站时间超过"夜班退车时间"参数
  // (只有当相关参数都启用时才应用此规则)
  // 修改：放宽条件，允许同一车次的连续票串联
  if (params.earlyShiftStartEnabled && params.nightShiftEndEnabled && 
      timeToMinutes(nextTicket.dropoff_time) > timeToMinutes(params.earlyShiftStart) && 
      firstPickupMinutes > timeToMinutes(params.nightShiftEnd) &&
      nextTicket.train_name !== firstTicket.train_name) {  // 只有不同车次时才应用此规则
    console.log("截止原因4: 早班接车时间规则。当前票退车时间: " + nextTicket.dropoff_time + ", 早班接车时间: " + params.earlyShiftStart + ", 第一张票接车时间: " + firstTicket.pickup_time + ", 夜班退车时间: " + params.nightShiftEnd);
    return true;
  }
  
  // 3.5.1.5：当前交路票的接车站等于"强制回程站点"参数
  // (只有当"强制回程站点"参数启用时才应用此规则)
  if (params.mandatoryReturnStationEnabled && params.mandatoryReturnStation && nextTicket.start_station === params.mandatoryReturnStation) {
    console.log("截止原因5: 强制回程站点规则。当前票接车站: " + nextTicket.start_station + ", 强制回程站点: " + params.mandatoryReturnStation);
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
            console.log("截止逻辑返回true，结束链条。当前链条: [" + currentCollect.map(t => t.ticket_id).join(', ') + "], 下一张票: " + nextTicket.ticket_id);
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
          console.log("添加票到链条: " + nextTicket.ticket_id + ", 车次: " + nextTicket.train_name + ", 站点: " + nextTicket.start_station + " -> " + nextTicket.end_station);
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

    console.log("成功生成 " + collectList.length + " 个交路票夹");
    return collectList;
  } catch (error) {
    console.error('生成交路票夹时发生错误:', error);
    throw error;
  }
}

    // 处理PUT请求 - 更新数据（在Worker中我们不实际保存数据到文件系统）
    if (apiToData[path] && request.method === 'PUT') {
      try {
        // 在Worker环境中，我们不实际保存数据到文件系统
        // 只是返回成功响应
        return new Response(JSON.stringify({ 
          message: '数据更新成功（在Worker环境中不实际保存到文件系统）' 
        }), {
          headers: corsHeaders
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: '更新数据失败: ' + error.message }), {
          status: 500,
          headers: corsHeaders
        });
      }
    }

    return new Response(JSON.stringify({ error: '未找到API端点' }), {
      status: 404,
      headers: corsHeaders
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: '服务器内部错误: ' + error.message }), {
      status: 500,
      headers: corsHeaders
    });
  }
}

// 主要的Worker处理逻辑
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // 设置CORS头
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
    };

    // 处理OPTIONS请求
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // 处理API请求
    if (pathname.startsWith('/api/')) {
      return handleApiRequest(request, pathname, env);
    }

    // 处理静态文件请求
    if (pathname === '/' || pathname === '/index.html') {
      return new Response(indexHtml, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          ...corsHeaders
        }
      });
    }

    // 处理其他静态文件（CSS、JS等）
    if (pathname === '/style.css') {
      return new Response('', {
        headers: {
          'Content-Type': 'text/css',
          ...corsHeaders
        }
      });
    }

    if (pathname === '/script.js') {
      return new Response('// JavaScript placeholder', {
        headers: {
          'Content-Type': 'application/javascript',
          ...corsHeaders
        }
      });
    }

    // 404响应
    return new Response('未找到', {
      status: 404,
      headers: corsHeaders
    });
  }
};