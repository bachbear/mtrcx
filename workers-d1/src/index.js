import { generateDriveTickets } from './logic/drive_tickets.js';
import { generateDriveTicketCollect } from './logic/drive_ticket_collect.js';
import { generateRideTickets } from './logic/ride_tickets_correct.js';
import { missingDetails } from './missing_data.js';

/**
 * Cloudflare Workers API for 地铁交路管理系统
 * 从本地Node.js + JSON文件迁移到Cloudflare Workers + D1
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle preflight requests
    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // API路由处理
      if (path.startsWith('/api/')) {
        const response = await handleApiRequest(request, env, path, method);
        // 添加CORS头到所有API响应
        Object.entries(corsHeaders).forEach(([key, value]) => {
          response.headers.set(key, value);
        });
        return response;
      }

      // 对于根路径，返回我们的完整前端页面
      if (path === '/' || path === '/index.html') {
        return new Response(`<!DOCTYPE html>
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
        button:disabled {
            background-color: #6c757d;
            cursor: not-allowed;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>地铁交路管理系统</h1>
        
        <div class="tabs">
            <div class="tab active" onclick="showTab('crossingRoads', event)">交路管理</div>
            <div class="tab" onclick="showTab('lines', event)">线路管理</div>
            <div class="tab" onclick="showTab('trainSchedules', event)">列车时刻表管理</div>
            <div class="tab" onclick="showTab('driveTicketParams', event)">交路参数表</div>
        </div>
        
        <div id="crossingRoads" class="tab-content active">
            <h2>交路信息</h2>
            
            <!-- 交路票数据表 -->
            <h3>交路票数据</h3>
            <table id="driveTicketsTable">
                <thead>
                    <tr>
                        <th>主键ID</th>
                        <th>交路票序号</th>
                        <th>车次名称</th>
                        <th>接车站点</th>
                        <th>退车站点</th>
                        <th>是否已售出</th>
                        <th>接车站到站时间</th>
                        <th>退车站到站时间</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- 数据将通过JavaScript动态加载 -->
                </tbody>
            </table>
            
            <!-- 便乘票数据表 -->
            <h3>便乘票数据</h3>
            <table id="rideTicketsTable">
                <thead>
                    <tr>
                        <th>主键ID</th>
                        <th>便乘票序号</th>
                        <th>车次名称</th>
                        <th>上车站点</th>
                        <th>下车站点</th>
                        <th>上车站到站时间</th>
                        <th>下车站到站时间</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- 数据将通过JavaScript动态加载 -->
                </tbody>
            </table>
            
            <!-- 交路票夹数据表 -->
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
            
            <!-- 底部按钮组框 -->
            <div style="margin-top: 30px; padding: 20px; border: 2px solid #ccc; border-radius: 8px; background-color: #f9f9f9;">
                <h4 style="margin-top: 0; margin-bottom: 15px; text-align: center;">操作按钮</h4>
                <div style="display: flex; justify-content: center; gap: 20px;">
                    <button id="generateDriveTicketsBtn" onclick="generateDriveTickets()" 
                            style="padding: 10px 20px; font-size: 14px; cursor: pointer;">更新交路票</button>
                    <button id="generateRideTicketsBtn" onclick="generateRideTickets()" 
                            style="padding: 10px 20px; font-size: 14px; cursor: pointer;">更新便乘票</button>
                    <button id="generateDriveTicketCollectBtn" onclick="generateDriveTicketCollect()" 
                            style="padding: 10px 20px; font-size: 14px; cursor: pointer;">更新交路票夹</button>
                </div>
            </div>
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
                        <th>车站ID</th>
                        <th>线路ID</th>
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
                        <th>服务号</th>
                        <th>方向</th>
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
                        <th>车站ID</th>
                        <th>到达时间</th>
                        <th>出发时间</th>
                        <th>停站时间</th>
                        <th>运行时间</th>
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
        // API基础URL - 使用相对路径适配Cloudflare Workers
        const API_BASE_URL = '';
        
        // 存储交路参数数据
        let crossingRoadsParamsData = [];
        let driveTicketParamsData = [];

        // 显示指定的标签页
        function showTab(tabId, event) {
            // 隐藏所有标签内容
            const tabContents = document.querySelectorAll('.tab-content');
            tabContents.forEach(content => content.classList.remove('active'));
            
            // 移除所有标签的激活状态
            const tabs = document.querySelectorAll('.tab');
            tabs.forEach(tab => tab.classList.remove('active'));
            
            // 显示指定的标签内容
            document.getElementById(tabId).classList.add('active');
            
            // 激活点击的标签
            if (event && event.target) {
                event.target.classList.add('active');
            }
            
            // 根据标签加载相应数据
            if (tabId === 'crossingRoads') {
                loadDriveTickets();
            } else if (tabId === 'lines') {
                loadLines();
            } else if (tabId === 'trainSchedules') {
                loadTrainSchedules();
            } else if (tabId === 'driveTicketParams') {
                loadDriveTicketParams();
            }
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
                            <td>\${item.line_id || ''}</td>
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
                            <td>\${item.service_num || ''}</td>
                            <td>\${item.direction || ''}</td>
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
                            <td>\${item.stop_time || ''}</td>
                            <td>\${item.run_time || ''}</td>
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
                    alert('加载交路参数数据失败: ' + error.message);
                });
        }
        
        // 渲染交路参数表格
        function renderDriveTicketParamsTable(data) {
            const tbody = document.querySelector('#driveTicketParamsTable tbody');
            tbody.innerHTML = '';

            data.forEach((item, index) => {
                // 如果is_checked字段不存在，则默认为false
                const isChecked = item.is_checked ? 'checked' : '';
                
                const row = document.createElement('tr');
                row.innerHTML = \`
                    <td>\${item.id}</td>
                    <td><input type="text" value="\${item.param_name}" data-field="param_name" data-index="\${index}"></td>
                    <td><input type="text" value="\${item.param_value}" data-field="param_value" data-index="\${index}"></td>
                    <td><input type="number" value="\${item.param_type}" data-field="param_type" data-index="\${index}"></td>
                    <td><input type="text" value="\${item.param_desc || ''}" data-field="param_desc" data-index="\${index}"></td>
                    <td class="checkbox-cell"><input type="checkbox" \${isChecked} data-field="is_checked" data-index="\${index}"></td>
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
            // 禁用保存按钮防止重复点击
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
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('保存失败');
                }
            })
            .then(data => {
                alert('数据保存成功！');
            })
            .catch(error => {
                console.error('保存数据时发生错误:', error);
                alert('保存数据时发生错误: ' + error.message);
            })
            .finally(() => {
                // 恢复保存按钮状态
                saveBtn.disabled = false;
                saveBtn.textContent = originalText;
            });
        }
        
        // 加载交路票数据
        function loadDriveTickets() {
            console.log('开始加载交路票数据...');
            fetch(\`\${API_BASE_URL}/api/drive-tickets\`)
                .then(response => {
                    console.log('交路票数据响应状态:', response.status);
                    if (!response.ok) {
                        throw new Error(\`HTTP error! status: \${response.status}\`);
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('交路票数据加载成功，数据条数:', data.length);
                    const tbody = document.querySelector('#driveTicketsTable tbody');
                    tbody.innerHTML = '';
                    
                    data.forEach(item => {
                        const row = document.createElement('tr');
                        row.innerHTML = \`
                            <td>\${item.id}</td>
                            <td>\${item.ticket_id || ''}</td>
                            <td>\${item.train_name || ''}</td>
                            <td>\${item.start_station || ''}</td>
                            <td>\${item.end_station || ''}</td>
                            <td>\${item.is_sold ? '是' : '否'}</td>
                            <td>\${item.pickup_time || ''}</td>
                            <td>\${item.dropoff_time || ''}</td>
                        \`;
                        tbody.appendChild(row);
                    });
                })
                .catch(error => {
                    console.error('加载交路票数据失败:', error);
                    // 显示错误信息到表格中
                    const tbody = document.querySelector('#driveTicketsTable tbody');
                    tbody.innerHTML = \`<tr><td colspan="8">加载数据失败: \${error.message}</td></tr>\`;
                });
        }

        // 生成和更新交路票记录
        function generateDriveTickets() {
            // 禁用按钮防止重复点击
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
                    // 重新加载交路票数据
                    loadDriveTickets();
                } else {
                    alert('交路票记录更新失败：' + (data.error || '未知错误'));
                }
            })
            .catch(error => {
                console.error('更新交路票记录时发生错误:', error);
                alert('更新交路票记录时发生错误：' + error.message);
            })
            .finally(() => {
                // 恢复按钮状态
                btn.disabled = false;
                btn.textContent = originalText;
            });
        }
        
        // 生成和更新交路票夹记录
        function generateDriveTicketCollect() {
            // 禁用按钮防止重复点击
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
                    // 重新加载交路票夹数据
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
                // 恢复按钮状态
                btn.disabled = false;
                btn.textContent = originalText;
            });
        }
        
        // 生成和更新便乘票记录
        function generateRideTickets() {
            // 禁用按钮防止重复点击
            const btn = document.getElementById('generateRideTicketsBtn');
            const originalText = btn.textContent;
            btn.disabled = true;
            btn.textContent = '正在生成便乘票...';
            
            fetch(\`\${API_BASE_URL}/api/generate-ride-tickets\`, {
                method: 'POST'
            })
            .then(response => response.json())
            .then(data => {
                if (data.message) {
                    alert(\`便乘票记录更新成功！共生成了 \${data.count || 0} 条记录\`);
                    // 重新加载便乘票数据
                    loadRideTickets();
                } else {
                    alert('便乘票记录更新失败：' + (data.error || '未知错误'));
                }
            })
            .catch(error => {
                console.error('更新便乘票记录时发生错误:', error);
                alert('更新便乘票记录时发生错误：' + error.message);
            })
            .finally(() => {
                // 恢复按钮状态
                btn.disabled = false;
                btn.textContent = originalText;
            });
        }
        
        // 加载交路票夹数据
        function loadDriveTicketCollect() {
            fetch(\`\${API_BASE_URL}/api/drive-ticket-collect\`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(\`HTTP error! status: \${response.status}\`);
                    }
                    return response.json();
                })
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
                    // 显示错误信息到表格中
                    const tbody = document.querySelector('#driveTicketCollectTable tbody');
                    tbody.innerHTML = \`<tr><td colspan="3">加载数据失败: \${error.message}</td></tr>\`;
                });
        }
        
        // 加载便乘票数据
        function loadRideTickets() {
            fetch(\`\${API_BASE_URL}/api/ride-tickets\`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(\`HTTP error! status: \${response.status}\`);
                    }
                    return response.json();
                })
                .then(data => {
                    const tbody = document.querySelector('#rideTicketsTable tbody');
                    tbody.innerHTML = '';
                    
                    data.forEach(item => {
                        const row = document.createElement('tr');
                        row.innerHTML = \`
                            <td>\${item.id}</td>
                            <td>\${item.ride_id || ''}</td>
                            <td>\${item.train_name || ''}</td>
                            <td>\${item.start_station || ''}</td>
                            <td>\${item.end_station || ''}</td>
                            <td>\${item.pickup_time || ''}</td>
                            <td>\${item.dropoff_time || ''}</td>
                        \`;
                        tbody.appendChild(row);
                    });
                })
                .catch(error => {
                    console.error('加载便乘票数据失败:', error);
                    // 显示错误信息到表格中
                    const tbody = document.querySelector('#rideTicketsTable tbody');
                    tbody.innerHTML = \`<tr><td colspan="7">加载数据失败: \${error.message}</td></tr>\`;
                });
        }

        // 页面加载时初始化数据
        document.addEventListener('DOMContentLoaded', function() {
            console.log('页面加载完成，开始初始化数据...');
            console.log('API_BASE_URL:', API_BASE_URL);
            
            // 延迟一点加载数据，确保页面完全渲染
            setTimeout(() => {
                loadDriveTickets();
                loadDriveTicketCollect();
                loadRideTickets();
            }, 100);
        });
    </script>
</body>
</html>`, {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' }
        });
      }

      // 对于其他非API路径，返回404
      return new Response('Not found', {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'text/plain; charset=utf-8' }
      });

    } catch (error) {
      console.error('API Error:', error);
      return new Response(JSON.stringify({ 
        error: '服务器内部错误', 
        details: error.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};

async function handleApiRequest(request, env, path, method) {
  const { DB } = env;

  switch (path) {
    // 线路管理
    case '/api/lines':
      if (method === 'GET') {
        const result = await DB.prepare('SELECT * FROM cw_line ORDER BY line_id').all();
        return jsonResponse(result.results);
      }
      break;

    // 车站管理
    case '/api/stations':
      if (method === 'GET') {
        const result = await DB.prepare('SELECT * FROM cw_station ORDER BY station_id').all();
        return jsonResponse(result.results);
      }
      break;

    // 座位类型管理
    case '/api/seat-types':
      if (method === 'GET') {
        const result = await DB.prepare('SELECT * FROM cw_seat_type ORDER BY seat_type_id').all();
        return jsonResponse(result.results);
      }
      break;

    // 逻辑车站管理
    case '/api/logic-stations':
      if (method === 'GET') {
        const result = await DB.prepare('SELECT * FROM cw_logic_station ORDER BY id').all();
        return jsonResponse(result.results);
      }
      break;

    // 交路管理
    case '/api/crossing-roads':
      if (method === 'GET') {
        const result = await DB.prepare('SELECT * FROM cw_crossing_road ORDER BY crossing_road_id').all();
        return jsonResponse(result.results);
      } else if (method === 'PUT') {
        const data = await request.json();
        return await updateCrossingRoads(DB, data);
      }
      break;

    // 列车时刻表管理
    case '/api/train-schedules':
      if (method === 'GET') {
        const result = await DB.prepare('SELECT * FROM cw_train_schedule ORDER BY train_schedule_id').all();
        return jsonResponse(result.results);
      }
      break;

    // 列车时刻表明细管理
    case '/api/train-schedule-details':
      if (method === 'GET') {
        const result = await DB.prepare('SELECT * FROM cw_train_schedule_detail ORDER BY train_schedule_detail_id').all();
        return jsonResponse(result.results);
      }
      break;

    // 交路票管理
    case '/api/drive-tickets':
      if (method === 'GET') {
        const result = await DB.prepare('SELECT * FROM drive_ticket ORDER BY id').all();
        return jsonResponse(result.results);
      }
      break;

    // 交路票夹管理
    case '/api/drive-ticket-collect':
      if (method === 'GET') {
        const result = await DB.prepare('SELECT * FROM drive_ticket_collect ORDER BY id').all();
        return jsonResponse(result.results);
      }
      break;

    // 交路参数管理
    case '/api/drive-ticket-params':
      if (method === 'GET') {
        const result = await DB.prepare('SELECT * FROM drive_ticket_param ORDER BY id').all();
        return jsonResponse(result.results);
      } else if (method === 'PUT') {
        const data = await request.json();
        return await updateDriveTicketParams(DB, data);
      }
      break;

    // 便乘票管理
    case '/api/ride-tickets':
      if (method === 'GET') {
        const result = await DB.prepare('SELECT * FROM drive_ride_ticket ORDER BY id').all();
        return jsonResponse(result.results);
      }
      break;

    // 生成交路票
    case '/api/generate-drive-tickets':
      if (method === 'POST') {
        return await handleGenerateDriveTickets(DB);
      }
      break;

    // 生成交路票夹
    case '/api/generate-drive-ticket-collect':
      if (method === 'POST') {
        return await handleGenerateDriveTicketCollect(DB);
      }
      break;

    // 生成便乘票
    case '/api/generate-ride-tickets':
      if (method === 'POST') {
        return await handleGenerateRideTickets(DB);
      }
      break;
    // 调试便乘票生成
    case '/api/debug-ride-tickets':
      if (method === 'POST') {
        return await handleDebugRideTickets(DB);
      }
      break;
    // 修复缺失数据
    case '/api/fix-missing-data':
      if (method === 'POST') {
        return await handleFixMissingData(DB);
      }
      break;

    default:
      return new Response(JSON.stringify({ error: '未找到API端点' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
  }

  return new Response(JSON.stringify({ error: '不支持的请求方法' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' }
  });
}

// 辅助函数
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

// 更新交路数据
async function updateCrossingRoads(DB, data) {
  try {
    // 清空现有数据
    await DB.prepare('DELETE FROM cw_crossing_road').run();
    
    // 插入新数据
    for (const road of data) {
      await DB.prepare(`
        INSERT INTO cw_crossing_road 
        (crossing_road_id, crossing_road_name, line_id, direction, begin_station_id, end_station_id, begin_time, end_time, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        road.crossing_road_id,
        road.crossing_road_name,
        road.line_id,
        road.direction,
        road.begin_station_id,
        road.end_station_id,
        road.begin_time,
        road.end_time,
        road.status || 1
      ).run();
    }
    
    return jsonResponse({ message: '交路数据更新成功' });
  } catch (error) {
    console.error('更新交路数据失败:', error);
    return jsonResponse({ error: '更新交路数据失败', details: error.message }, 500);
  }
}

// 更新交路参数数据
async function updateDriveTicketParams(DB, data) {
  try {
    // 清空现有数据
    await DB.prepare('DELETE FROM drive_ticket_param').run();
    
    // 插入新数据
    for (const param of data) {
      await DB.prepare(`
        INSERT INTO drive_ticket_param 
        (param_name, param_value, param_type, param_desc, is_checked)
        VALUES (?, ?, ?, ?, ?)
      `).bind(
        param.param_name,
        param.param_value,
        param.param_type,
        param.param_desc || null,
        param.is_checked || false
      ).run();
    }
    
    return jsonResponse({ message: '交路参数数据更新成功' });
  } catch (error) {
    console.error('更新交路参数数据失败:', error);
    return jsonResponse({ error: '更新交路参数数据失败', details: error.message }, 500);
  }
}

// 处理生成交路票的请求
async function handleGenerateDriveTickets(DB) {
  try {
    const tickets = await generateDriveTickets(DB);
    
    // 清空旧数据并插入新数据
    await DB.batch([
      DB.prepare('DELETE FROM drive_ticket'),
      ...tickets.map(t => 
        DB.prepare('INSERT INTO drive_ticket (id, ticket_id, train_name, start_station, end_station, is_sold, pickup_time, dropoff_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
          .bind(t.id, t.ticket_id, t.train_name, t.start_station, t.end_station, t.is_sold, t.pickup_time, t.dropoff_time)
      )
    ]);

    return jsonResponse({ message: '交路票记录生成成功', count: tickets.length });
  } catch (error) {
    console.error('生成交路票失败:', error);
    return jsonResponse({ error: '生成交路票失败', details: error.message }, 500);
  }
}

// 处理生成交路票夹的请求
async function handleGenerateDriveTicketCollect(DB) {
  try {
    const { collectList, updatedDriveTickets } = await generateDriveTicketCollect(DB);

    // 更新 drive_ticket 表
    const ticketUpdates = updatedDriveTickets.map(t => 
        DB.prepare('UPDATE drive_ticket SET is_sold = ? WHERE ticket_id = ?').bind(t.is_sold, t.ticket_id)
    );

    // 更新 drive_ticket_collect 表
    const collectUpdates = [
        DB.prepare('DELETE FROM drive_ticket_collect'),
        ...collectList.map(c => 
            DB.prepare('INSERT INTO drive_ticket_collect (id, collect_id, ticket_chain) VALUES (?, ?, ?)')
              .bind(c.id, c.collect_id, c.ticket_chain)
        )
    ];

    await DB.batch([...ticketUpdates, ...collectUpdates]);

    return jsonResponse({ message: '交路票夹记录生成成功', count: collectList.length });
  } catch (error) {
    console.error('生成交路票夹失败:', error);
    return jsonResponse({ error: '生成交路票夹失败', details: error.message }, 500);
  }
}

// 处理生成便乘票的请求
async function handleGenerateRideTickets(DB) {
  try {
    const tickets = await generateRideTickets(DB);

    // 清空旧数据并插入新数据
    await DB.batch([
      DB.prepare('DELETE FROM drive_ride_ticket'),
      ...tickets.map(t => 
        DB.prepare('INSERT INTO drive_ride_ticket (id, ride_id, train_name, start_station, end_station, pickup_time, dropoff_time) VALUES (?, ?, ?, ?, ?, ?, ?)')
          .bind(t.id, t.ride_id, t.train_name, t.start_station, t.end_station, t.pickup_time, t.dropoff_time)
      )
    ]);

    return jsonResponse({ message: '便乘票记录生成成功', count: tickets.length });
  } catch (error) {
    console.error('生成便乘票失败:', error);
    return jsonResponse({ error: '生成便乘票失败', details: error.message }, 500);
  }
}

// 处理修复缺失数据的请求
async function handleFixMissingData(DB) {
  try {
    let insertedCount = 0;

    for (const detail of missingDetails) {
      // 检查是否已存在
      const existing = await DB.prepare('SELECT * FROM cw_train_schedule_detail WHERE train_schedule_detail_id = ?').bind(detail.train_schedule_detail_id).first();

      if (!existing) {
        await DB.prepare(`
          INSERT INTO cw_train_schedule_detail
          (train_schedule_detail_id, line_id, train_schedule_id, station_id, arrive_time, depart_time, stop_time, run_time, stop_type, direction)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          detail.train_schedule_detail_id,
          detail.line_id,
          detail.train_schedule_id,
          detail.station_id,
          detail.arrive_time,
          detail.depart_time,
          detail.stop_time,
          detail.run_time,
          detail.stop_type,
          detail.direction
        ).run();
        insertedCount++;
      }
    }

    return jsonResponse({
      message: '缺失数据修复成功',
      count: insertedCount,
      details: `插入了 ${insertedCount} 条缺失的列车时刻表明细数据`
    });
  } catch (error) {
    console.error('修复缺失数据失败:', error);
    return jsonResponse({ error: '修复缺失数据失败', details: error.message }, 500);
  }
}

// 处理调试便乘票生成的请求
async function handleDebugRideTickets(DB) {
  try {
    const tickets = await generateRideTickets(DB);
    return jsonResponse({
      message: '调试便乘票生成完成',
      count: tickets.length,
      tickets: tickets
    });
  } catch (error) {
    console.error('调试便乘票生成失败:', error);
    return jsonResponse({ error: '调试便乘票生成失败', details: error.message }, 500);
  }
}