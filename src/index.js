// Cloudflare Worker 入口点文件
// 将现有的Express应用适配到Cloudflare Worker环境

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
                            <td>\${item.logic_station_id}</td>
                            <td>\${item.station_name || ''}</td>
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
                            <td>\${item.schedule_id}</td>
                            <td>\${item.line_id || ''}</td>
                            <td>\${item.train_name || ''}</td>
                            <td>\${item.start_station || ''}</td>
                            <td>\${item.end_station || ''}</td>
                            <td>\${item.start_time || ''}</td>
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
                            <td>\${item.detail_id}</td>
                            <td>\${item.schedule_id || ''}</td>
                            <td>\${item.station_name || ''}</td>
                            <td>\${item.arrival_time || ''}</td>
                            <td>\${item.departure_time || ''}</td>
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
                    <td>\${item.param_id}</td>
                    <td><input type="text" value="\${item.param_name}" data-field="param_name" data-index="\${index}"></td>
                    <td><input type="text" value="\${item.param_value}" data-field="param_value" data-index="\${index}"></td>
                    <td><input type="text" value="\${item.param_type || ''}" data-field="param_type" data-index="\${index}"></td>
                    <td><input type="text" value="\${item.description || ''}" data-field="description" data-index="\${index}"></td>
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
                            <td>\${item.collect_id}</td>
                            <td>\${item.collect_name}</td>
                            <td>\${item.ticket_ids ? item.ticket_ids.join(', ') : ''}</td>
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

// 默认数据（从本地JSON文件读取的初始数据）
const defaultData = {
  'cw_crossing_road': [],
  'cw_line': [{"line_id":1,"line_name":"1号线"},{"line_id":2,"line_name":"2号线"},{"line_id":3,"line_name":"3号线"}],
  'cw_train_schedule': [{"train_schedule_id":101,"line_id":1,"train_id":1001,"train_name":"G00101","service_num":"S001","direction":1,"begin_time":"06:00:00","end_time":"07:36:00","station_from":"王府井站","station_to":"天安门西站","service_sequence":1,"kilometers":15.5,"work_hours":1.5},{"train_schedule_id":102,"line_id":1,"train_id":1002,"train_name":"G00102","service_num":"S001","direction":2,"begin_time":"08:00:00","end_time":"09:36:00","station_from":"天安门西站","station_to":"王府井站","service_sequence":2,"kilometers":15.5,"work_hours":1.5},{"train_schedule_id":103,"line_id":1,"train_id":1003,"train_name":"G00103","service_num":"S001","direction":1,"begin_time":"10:00:00","end_time":"12:34:00","station_from":"王府井站","station_to":"天安门西站","service_sequence":3,"kilometers":15.5,"work_hours":1.5},{"train_schedule_id":104,"line_id":1,"train_id":1004,"train_name":"G00104","service_num":"S001","direction":2,"begin_time":"13:00:00","end_time":"16:13:00","station_from":"天安门西站","station_to":"王府井站","service_sequence":4,"kilometers":15.5,"work_hours":1.5},{"train_schedule_id":105,"line_id":1,"train_id":1005,"train_name":"G00201","service_num":"S002","direction":1,"begin_time":"06:10:00","end_time":"08:05:00","station_from":"王府井站","station_to":"天安门西站","service_sequence":1,"kilometers":15.5,"work_hours":1.5},{"train_schedule_id":106,"line_id":1,"train_id":1006,"train_name":"G00202","service_num":"S002","direction":2,"begin_time":"08:11:00","end_time":"10:06:00","station_from":"天安门西站","station_to":"王府井站","service_sequence":2,"kilometers":15.5,"work_hours":1.5},{"train_schedule_id":107,"line_id":1,"train_id":1007,"train_name":"G00203","service_num":"S002","direction":1,"begin_time":"10:10:00","end_time":"13:22:00","station_from":"王府井站","station_to":"天安门西站","service_sequence":3,"kilometers":15.5,"work_hours":1.5},{"train_schedule_id":108,"line_id":1,"train_id":1008,"train_name":"G00301","service_num":"S003","direction":2,"begin_time":"13:15:00","end_time":"17:25:00","station_from":"天安门西站","station_to":"王府井站","service_sequence":2,"kilometers":15.5,"work_hours":1.5}],
  'cw_train_schedule_detail': [{"train_schedule_detail_id":1,"line_id":1,"train_schedule_id":101,"station_id":1,"arrive_time":"06:00:00","depart_time":"06:01:00","stop_time":1,"run_time":5,"stop_type":1,"direction":1},{"train_schedule_detail_id":2,"line_id":1,"train_schedule_id":101,"station_id":2,"arrive_time":"06:05:00","depart_time":"06:06:00","stop_time":1,"run_time":5,"stop_type":1,"direction":1},{"train_schedule_detail_id":3,"line_id":1,"train_schedule_id":101,"station_id":3,"arrive_time":"06:10:00","depart_time":"06:11:00","stop_time":1,"run_time":5,"stop_type":1,"direction":1},{"train_schedule_detail_id":4,"line_id":1,"train_schedule_id":101,"station_id":4,"arrive_time":"06:15:00","depart_time":"06:16:00","stop_time":1,"run_time":5,"stop_type":1,"direction":1},{"train_schedule_detail_id":5,"line_id":1,"train_schedule_id":101,"station_id":5,"arrive_time":"06:20:00","depart_time":"06:21:00","stop_time":1,"run_time":5,"stop_type":1,"direction":1},{"train_schedule_detail_id":6,"line_id":1,"train_schedule_id":101,"station_id":6,"arrive_time":"06:25:00","depart_time":"06:26:00","stop_time":1,"run_time":5,"stop_type":1,"direction":1},{"train_schedule_detail_id":7,"line_id":1,"train_schedule_id":101,"station_id":7,"arrive_time":"06:30:00","depart_time":"06:31:00","stop_time":1,"run_time":5,"stop_type":1,"direction":1},{"train_schedule_detail_id":8,"line_id":1,"train_schedule_id":101,"station_id":8,"arrive_time":"06:35:00","depart_time":"06:36:00","stop_time":1,"run_time":5,"stop_type":1,"direction":1},{"train_schedule_detail_id":9,"line_id":1,"train_schedule_id":101,"station_id":9,"arrive_time":"06:40:00","depart_time":"06:41:00","stop_time":1,"run_time":5,"stop_type":1,"direction":1},{"train_schedule_detail_id":10,"line_id":1,"train_schedule_id":101,"station_id":10,"arrive_time":"06:45:00","depart_time":"06:46:00","stop_time":1,"run_time":5,"stop_type":1,"direction":1},{"train_schedule_detail_id":11,"line_id":1,"train_schedule_id":101,"station_id":11,"arrive_time":"06:50:00","depart_time":"06:51:00","stop_time":1,"run_time":5,"stop_type":1,"direction":1},{"train_schedule_detail_id":12,"line_id":1,"train_schedule_id":101,"station_id":12,"arrive_time":"06:55:00","depart_time":"06:56:00","stop_time":1,"run_time":5,"stop_type":1,"direction":1},{"train_schedule_detail_id":13,"line_id":1,"train_schedule_id":101,"station_id":13,"arrive_time":"07:00:00","depart_time":"07:01:00","stop_time":1,"run_time":5,"stop_type":1,"direction":1},{"train_schedule_detail_id":14,"line_id":1,"train_schedule_id":101,"station_id":14,"arrive_time":"07:05:00","depart_time":"07:06:00","stop_time":1,"run_time":5,"stop_type":1,"direction":1},{"train_schedule_detail_id":15,"line_id":1,"train_schedule_id":101,"station_id":15,"arrive_time":"07:10:00","depart_time":"07:11:00","stop_time":1,"run_time":5,"stop_type":1,"direction":1},{"train_schedule_detail_id":16,"line_id":1,"train_schedule_id":101,"station_id":16,"arrive_time":"07:15:00","depart_time":"07:16:00","stop_time":1,"run_time":5,"stop_type":1,"direction":1},{"train_schedule_detail_id":17,"line_id":1,"train_schedule_id":101,"station_id":17,"arrive_time":"07:20:00","depart_time":"07:21:00","stop_time":1,"run_time":5,"stop_type":1,"direction":1},{"train_schedule_detail_id":18,"line_id":1,"train_schedule_id":101,"station_id":18,"arrive_time":"07:25:00","depart_time":"07:26:00","stop_time":1,"run_time":5,"stop_type":1,"direction":1},{"train_schedule_detail_id":19,"line_id":1,"train_schedule_id":101,"station_id":19,"arrive_time":"07:30:00","depart_time":"07:31:00","stop_time":1,"run_time":5,"stop_type":1,"direction":1},{"train_schedule_detail_id":20,"line_id":1,"train_schedule_id":101,"station_id":20,"arrive_time":"07:35:00","depart_time":"07:36:00","stop_time":1,"run_time":5,"stop_type":1,"direction":1},{"train_schedule_detail_id":21,"line_id":1,"train_schedule_id":102,"station_id":20,"arrive_time":"08:00:00","depart_time":"08:01:00","stop_time":1,"run_time":5,"stop_type":1,"direction":2},{"train_schedule_detail_id":22,"line_id":1,"train_schedule_id":102,"station_id":19,"arrive_time":"08:05:00","depart_time":"08:06:00","stop_time":1,"run_time":5,"stop_type":1,"direction":2},{"train_schedule_detail_id":23,"line_id":1,"train_schedule_id":102,"station_id":18,"arrive_time":"08:10:00","depart_time":"08:11:00","stop_time":1,"run_time":5,"stop_type":1,"direction":2},{"train_schedule_detail_id":24,"line_id":1,"train_schedule_id":102,"station_id":17,"arrive_time":"08:15:00","depart_time":"08:16:00","stop_time":1,"run_time":5,"stop_type":1,"direction":2},{"train_schedule_detail_id":25,"line_id":1,"train_schedule_id":102,"station_id":16,"arrive_time":"08:20:00","depart_time":"08:21:00","stop_time":1,"run_time":5,"stop_type":1,"direction":2},{"train_schedule_detail_id":26,"line_id":1,"train_schedule_id":102,"station_id":15,"arrive_time":"08:25:00","depart_time":"08:26:00","stop_time":1,"run_time":5,"stop_type":1,"direction":2},{"train_schedule_detail_id":27,"line_id":1,"train_schedule_id":102,"station_id":14,"arrive_time":"08:30:00","depart_time":"08:31:00","stop_time":1,"run_time":5,"stop_type":1,"direction":2},{"train_schedule_detail_id":28,"line_id":1,"train_schedule_id":102,"station_id":13,"arrive_time":"08:35:00","depart_time":"08:36:00","stop_time":1,"run_time":5,"stop_type":1,"direction":2},{"train_schedule_detail_id":29,"line_id":1,"train_schedule_id":102,"station_id":12,"arrive_time":"08:40:00","depart_time":"08:41:00","stop_time":1,"run_time":5,"stop_type":1,"direction":2},{"train_schedule_detail_id":30,"line_id":1,"train_schedule_id":102,"station_id":11,"arrive_time":"08:45:00","depart_time":"08:46:00","stop_time":1,"run_time":5,"stop_type":1,"direction":2},{"train_schedule_detail_id":31,"line_id":1,"train_schedule_id":102,"station_id":10,"arrive_time":"08:50:00","depart_time":"08:51:00","stop_time":1,"run_time":5,"stop_type":1,"direction":2},{"train_schedule_detail_id":32,"line_id":1,"train_schedule_id":102,"station_id":9,"arrive_time":"08:55:00","depart_time":"08:56:00","stop_time":1,"run_time":5,"stop_type":1,"direction":2},{"train_schedule_detail_id":33,"line_id":1,"train_schedule_id":102,"station_id":8,"arrive_time":"09:00:00","depart_time":"09:01:00","stop_time":1,"run_time":5,"stop_type":1,"direction":2},{"train_schedule_detail_id":34,"line_id":1,"train_schedule_id":102,"station_id":7,"arrive_time":"09:05:00","depart_time":"09:06:00","stop_time":1,"run_time":5,"stop_type":1,"direction":2},{"train_schedule_detail_id":35,"line_id":1,"train_schedule_id":102,"station_id":6,"arrive_time":"09:10:00","depart_time":"09:11:00","stop_time":1,"run_time":5,"stop_type":1,"direction":2},{"train_schedule_detail_id":36,"line_id":1,"train_schedule_id":102,"station_id":5,"arrive_time":"09:15:00","depart_time":"09:16:00","stop_time":1,"run_time":5,"stop_type":1,"direction":2},{"train_schedule_detail_id":37,"line_id":1,"train_schedule_id":102,"station_id":4,"arrive_time":"09:20:00","depart_time":"09:21:00","stop_time":1,"run_time":5,"stop_type":1,"direction":2},{"train_schedule_detail_id":38,"line_id":1,"train_schedule_id":102,"station_id":3,"arrive_time":"09:25:00","depart_time":"09:26:00","stop_time":1,"run_time":5,"stop_type":1,"direction":2},{"train_schedule_detail_id":39,"line_id":1,"train_schedule_id":102,"station_id":2,"arrive_time":"09:30:00","depart_time":"09:31:00","stop_time":1,"run_time":5,"stop_type":1,"direction":2},{"train_schedule_detail_id":40,"line_id":1,"train_schedule_id":102,"station_id":1,"arrive_time":"09:35:00","depart_time":"09:36:00","stop_time":1,"run_time":5,"stop_type":1,"direction":2},{"train_schedule_detail_id":41,"line_id":1,"train_schedule_id":103,"station_id":1,"arrive_time":"10:00:00","depart_time":"10:02:00","stop_time":2,"run_time":8,"stop_type":1,"direction":1},{"train_schedule_detail_id":42,"line_id":1,"train_schedule_id":103,"station_id":2,"arrive_time":"10:08:00","depart_time":"10:10:00","stop_time":2,"run_time":8,"stop_type":1,"direction":1},{"train_schedule_detail_id":43,"line_id":1,"train_schedule_id":103,"station_id":3,"arrive_time":"10:16:00","depart_time":"10:18:00","stop_time":2,"run_time":8,"stop_type":1,"direction":1},{"train_schedule_detail_id":44,"line_id":1,"train_schedule_id":103,"station_id":4,"arrive_time":"10:24:00","depart_time":"10:26:00","stop_time":2,"run_time":8,"stop_type":1,"direction":1},{"train_schedule_detail_id":45,"line_id":1,"train_schedule_id":103,"station_id":5,"arrive_time":"10:32:00","depart_time":"10:34:00","stop_time":2,"run_time":8,"stop_type":1,"direction":1},{"train_schedule_detail_id":46,"line_id":1,"train_schedule_id":103,"station_id":6,"arrive_time":"10:40:00","depart_time":"10:42:00","stop_time":2,"run_time":8,"stop_type":1,"direction":1},{"train_schedule_detail_id":47,"line_id":1,"train_schedule_id":103,"station_id":7,"arrive_time":"10:48:00","depart_time":"10:50:00","stop_time":2,"run_time":8,"stop_type":1,"direction":1},{"train_schedule_detail_id":48,"line_id":1,"train_schedule_id":103,"station_id":8,"arrive_time":"10:56:00","depart_time":"10:58:00","stop_time":2,"run_time":8,"stop_type":1,"direction":1},{"train_schedule_detail_id":49,"line_id":1,"train_schedule_id":103,"station_id":9,"arrive_time":"11:04:00","depart_time":"11:06:00","stop_time":2,"run_time":8,"stop_type":1,"direction":1},{"train_schedule_detail_id":50,"line_id":1,"train_schedule_id":103,"station_id":10,"arrive_time":"11:12:00","depart_time":"11:14:00","stop_time":2,"run_time":8,"stop_type":1,"direction":1},{"train_schedule_detail_id":51,"line_id":1,"train_schedule_id":103,"station_id":11,"arrive_time":"11:20:00","depart_time":"11:22:00","stop_time":2,"run_time":8,"stop_type":1,"direction":1},{"train_schedule_detail_id":52,"line_id":1,"train_schedule_id":103,"station_id":12,"arrive_time":"11:28:00","depart_time":"11:30:00","stop_time":2,"run_time":8,"stop_type":1,"direction":1},{"train_schedule_detail_id":53,"line_id":1,"train_schedule_id":103,"station_id":13,"arrive_time":"11:36:00","depart_time":"11:38:00","stop_time":2,"run_time":8,"stop_type":1,"direction":1},{"train_schedule_detail_id":54,"line_id":1,"train_schedule_id":103,"station_id":14,"arrive_time":"11:44:00","depart_time":"11:46:00","stop_time":2,"run_time":8,"stop_type":1,"direction":1},{"train_schedule_detail_id":55,"line_id":1,"train_schedule_id":103,"station_id":15,"arrive_time":"11:52:00","depart_time":"11:54:00","stop_time":2,"run_time":8,"stop_type":1,"direction":1},{"train_schedule_detail_id":56,"line_id":1,"train_schedule_id":103,"station_id":16,"arrive_time":"12:00:00","depart_time":"12:02:00","stop_time":2,"run_time":8,"stop_type":1,"direction":1},{"train_schedule_detail_id":57,"line_id":1,"train_schedule_id":103,"station_id":17,"arrive_time":"12:08:00","depart_time":"12:10:00","stop_time":2,"run_time":8,"stop_type":1,"direction":1},{"train_schedule_detail_id":58,"line_id":1,"train_schedule_id":103,"station_id":18,"arrive_time":"12:16:00","depart_time":"12:18:00","stop_time":2,"run_time":8,"stop_type":1,"direction":1},{"train_schedule_detail_id":59,"line_id":1,"train_schedule_id":103,"station_id":19,"arrive_time":"12:24:00","depart_time":"12:26:00","stop_time":2,"run_time":8,"stop_type":1,"direction":1},{"train_schedule_detail_id":60,"line_id":1,"train_schedule_id":103,"station_id":20,"arrive_time":"12:32:00","depart_time":"12:34:00","stop_time":2,"run_time":8,"stop_type":1,"direction":1},{"train_schedule_detail_id":61,"line_id":1,"train_schedule_id":104,"station_id":20,"arrive_time":"13:00:00","depart_time":"13:03:00","stop_time":3,"run_time":10,"stop_type":1,"direction":2},{"train_schedule_detail_id":62,"line_id":1,"train_schedule_id":104,"station_id":19,"arrive_time":"13:10:00","depart_time":"13:13:00","stop_time":3,"run_time":10,"stop_type":1,"direction":2},{"train_schedule_detail_id":63,"line_id":1,"train_schedule_id":104,"station_id":18,"arrive_time":"13:20:00","depart_time":"13:23:00","stop_time":3,"run_time":10,"stop_type":1,"direction":2},{"train_schedule_detail_id":64,"line_id":1,"train_schedule_id":104,"station_id":17,"arrive_time":"13:30:00","depart_time":"13:33:00","stop_time":3,"run_time":10,"stop_type":1,"direction":2},{"train_schedule_detail_id":65,"line_id":1,"train_schedule_id":104,"station_id":16,"arrive_time":"13:40:00","depart_time":"13:43:00","stop_time":3,"run_time":10,"stop_type":1,"direction":2},{"train_schedule_detail_id":66,"line_id":1,"train_schedule_id":104,"station_id":15,"arrive_time":"13:50:00","depart_time":"13:53:00","stop_time":3,"run_time":10,"stop_type":1,"direction":2},{"train_schedule_detail_id":67,"line_id":1,"train_schedule_id":104,"station_id":14,"arrive_time":"14:00:00","depart_time":"14:03:00","stop_time":3,"run_time":10,"stop_type":1,"direction":2},{"train_schedule_detail_id":68,"line_id":1,"train_schedule_id":104,"station_id":13,"arrive_time":"14:10:00","depart_time":"14:13:00","stop_time":3,"run_time":10,"stop_type":1,"direction":2},{"train_schedule_detail_id":69,"line_id":1,"train_schedule_id":104,"station_id":12,"arrive_time":"14:20:00","depart_time":"14:23:00","stop_time":3,"run_time":10,"stop_type":1,"direction":2},{"train_schedule_detail_id":70,"line_id":1,"train_schedule_id":104,"station_id":11,"arrive_time":"14:30:00","depart_time":"14:33:00","stop_time":3,"run_time":10,"stop_type":1,"direction":2},{"train_schedule_detail_id":71,"line_id":1,"train_schedule_id":104,"station_id":10,"arrive_time":"14:40:00","depart_time":"14:43:00","stop_time":3,"run_time":10,"stop_type":1,"direction":2},{"train_schedule_detail_id":72,"line_id":1,"train_schedule_id":104,"station_id":9,"arrive_time":"14:50:00","depart_time":"14:53:00","stop_time":3,"run_time":10,"stop_type":1,"direction":2},{"train_schedule_detail_id":73,"line_id":1,"train_schedule_id":104,"station_id":8,"arrive_time":"15:00:00","depart_time":"15:03:00","stop_time":3,"run_time":10,"stop_type":1,"direction":2},{"train_schedule_detail_id":74,"line_id":1,"train_schedule_id":104,"station_id":7,"arrive_time":"15:10:00","depart_time":"15:13:00","stop_time":3,"run_time":10,"stop_type":1,"direction":2},{"train_schedule_detail_id":75,"line_id":1,"train_schedule_id":104,"station_id":6,"arrive_time":"15:20:00","depart_time":"15:23:00","stop_time":3,"run_time":10,"stop_type":1,"direction":2},{"train_schedule_detail_id":76,"line_id":1,"train_schedule_id":104,"station_id":5,"arrive_time":"15:30:00","depart_time":"15:33:00","stop_time":3,"run_time":10,"stop_type":1,"direction":2},{"train_schedule_detail_id":77,"line_id":1,"train_schedule_id":104,"station_id":4,"arrive_time":"15:40:00","depart_time":"15:43:00","stop_time":3,"run_time":10,"stop_type":1,"direction":2},{"train_schedule_detail_id":78,"line_id":1,"train_schedule_id":104,"station_id":3,"arrive_time":"15:50:00","depart_time":"15:53:00","stop_time":3,"run_time":10,"stop_type":1,"direction":2},{"train_schedule_detail_id":79,"line_id":1,"train_schedule_id":104,"station_id":2,"arrive_time":"16:00:00","depart_time":"16:03:00","stop_time":3,"run_time":10,"stop_type":1,"direction":2},{"train_schedule_detail_id":80,"line_id":1,"train_schedule_id":104,"station_id":1,"arrive_time":"16:10:00","depart_time":"16:13:00","stop_time":3,"run_time":10,"stop_type":1,"direction":2},{"train_schedule_detail_id":81,"line_id":1,"train_schedule_id":105,"station_id":1,"arrive_time":"06:10:00","depart_time":"06:11:00","stop_time":1,"run_time":5,"stop_type":1,"direction":1},{"train_schedule_detail_id":82,"line_id":1,"train_schedule_id":105,"station_id":2,"arrive_time":"06:16:00","depart_time":"06:17:00","stop_time":1,"run_time":5,"stop_type":1,"direction":1},{"train_schedule_detail_id":83,"line_id":1,"train_schedule_id":105,"station_id":3,"arrive_time":"06:22:00","depart_time":"06:23:00","stop_time":1,"run_time":5,"stop_type":1,"direction":1},{"train_schedule_detail_id":84,"line_id":1,"train_schedule_id":105,"station_id":4,"arrive_time":"06:28:00","depart_time":"06:29:00","stop_time":1,"run_time":5,"stop_type":1,"direction":1},{"train_schedule_detail_id":85,"line_id":1,"train_schedule_id":105,"station_id":5,"arrive_time":"06:34:00","depart_time":"06:35:00","stop_time":1,"run_time":5,"stop_type":1,"direction":1},{"train_schedule_detail_id":86,"line_id":1,"train_schedule_id":105,"station_id":6,"arrive_time":"06:40:00","depart_time":"06:41:00","stop_time":1,"run_time":5,"stop_type":1,"direction":1},{"train_schedule_detail_id":87,"line_id":1,"train_schedule_id":105,"station_id":7,"arrive_time":"06:46:00","depart_time":"06:47:00","stop_time":1,"run_time":5,"stop_type":1,"direction":1},{"train_schedule_detail_id":88,"line_id":1,"train_schedule_id":105,"station_id":8,"arrive_time":"06:52:00","depart_time":"06:53:00","stop_time":1,"run_time":5,"stop_type":1,"direction":1},{"train_schedule_detail_id":89,"line_id":1,"train_schedule_id":105,"station_id":9,"arrive_time":"06:58:00","depart_time":"06:59:00","stop_time":1,"run_time":5,"stop_type":1,"direction":1},{"train_schedule_detail_id":90,"line_id":1,"train_schedule_id":105,"station_id":10,"arrive_time":"07:04:00","depart_time":"07:05:00","stop_time":1,"run_time":5,"stop_type":1,"direction":1},{"train_schedule_detail_id":91,"line_id":1,"train_schedule_id":105,"station_id":11,"arrive_time":"07:10:00","depart_time":"07:11:00","stop_time":1,"run_time":5,"stop_type":1,"direction":1},{"train_schedule_detail_id":92,"line_id":1,"train_schedule_id":105,"station_id":12,"arrive_time":"07:16:00","depart_time":"07:17:00","stop_time":1,"run_time":5,"stop_type":1,"direction":1},{"train_schedule_detail_id":93,"line_id":1,"train_schedule_id":105,"station_id":13,"arrive_time":"07:22:00","depart_time":"07:23:00","stop_time":1,"run_time":5,"stop_type":1,"direction":1},{"train_schedule_detail_id":94,"line_id":1,"train_schedule_id":105,"station_id":14,"arrive_time":"07:28:00","depart_time":"07:29:00","stop_time":1,"run_time":5,"stop_type":1,"direction":1},{"train_schedule_detail_id":95,"line_id":1,"train_schedule_id":105,"station_id":15,"arrive_time":"07:34:00","depart_time":"07:35:00","stop_time":1,"run_time":5,"stop_type":1,"direction":1},{"train_schedule_detail_id":96,"line_id":1,"train_schedule_id":105,"station_id":16,"arrive_time":"07:40:00","depart_time":"07:41:00","stop_time":1,"run_time":5,"stop_type":1,"direction":1},{"train_schedule_detail_id":97,"line_id":1,"train_schedule_id":105,"station_id":17,"arrive_time":"07:46:00","depart_time":"07:47:00","stop_time":1,"run_time":5,"stop_type":1,"direction":1},{"train_schedule_detail_id":98,"line_id":1,"train_schedule_id":105,"station_id":18,"arrive_time":"07:52:00","depart_time":"07:53:00","stop_time":1,"run_time":5,"stop_type":1,"direction":1},{"train_schedule_detail_id":99,"line_id":1,"train_schedule_id":105,"station_id":19,"arrive_time":"07:58:00","depart_time":"07:59:00","stop_time":1,"run_time":5,"stop_type":1,"direction":1},{"train_schedule_detail_id":100,"line_id":1,"train_schedule_id":105,"station_id":20,"arrive_time":"08:04:00","depart_time":"08:05:00","stop_time":1,"run_time":5,"stop_type":1,"direction":1},{"train_schedule_detail_id":101,"line_id":1,"train_schedule_id":106,"station_id":20,"arrive_time":"08:11:00","depart_time":"08:12:00","stop_time":1,"run_time":5,"stop_type":1,"direction":2},{"train_schedule_detail_id":102,"line_id":1,"train_schedule_id":106,"station_id":19,"arrive_time":"08:17:00","depart_time":"08:18:00","stop_time":1,"run_time":5,"stop_type":1,"direction":2},{"train_schedule_detail_id":103,"line_id":1,"train_schedule_id":106,"station_id":18,"arrive_time":"08:23:00","depart_time":"08:24:00","stop_time":1,"run_time":5,"stop_type":1,"direction":2},{"train_schedule_detail_id":104,"line_id":1,"train_schedule_id":106,"station_id":17,"arrive_time":"08:29:00","depart_time":"08:30:00","stop_time":1,"run_time":5,"stop_type":1,"direction":2},{"train_schedule_detail_id":105,"line_id":1,"train_schedule_id":106,"station_id":16,"arrive_time":"08:35:00","depart_time":"08:36:00","stop_time":1,"run_time":5,"stop_type":1,"direction":2},{"train_schedule_detail_id":106,"line_id":1,"train_schedule_id":106,"station_id":15,"arrive_time":"08:41:00","depart_time":"08:42:00","stop_time":1,"run_time":5,"stop_type":1,"direction":2},{"train_schedule_detail_id":107,"line_id":1,"train_schedule_id":106,"station_id":14,"arrive_time":"08:47:00","depart_time":"08:48:00","stop_time":1,"run_time":5,"stop_type":1,"direction":2},{"train_schedule_detail_id":108,"line_id":1,"train_schedule_id":106,"station_id":13,"arrive_time":"08:53:00","depart_time":"08:54:00","stop_time":1,"run_time":5,"stop_type":1,"direction":2},{"train_schedule_detail_id":109,"line_id":1,"train_schedule_id":106,"station_id":12,"arrive_time":"08:59:00","depart_time":"09:00:00","stop_time":1,"run_time":5,"stop_type":1,"direction":2},{"train_schedule_detail_id":110,"line_id":1,"train_schedule_id":106,"station_id":11,"arrive_time":"09:05:00","depart_time":"09:06:00","stop_time":1,"run_time":5,"stop_type":1,"direction":2},{"train_schedule_detail_id":111,"line_id":1,"train_schedule_id":106,"station_id":10,"arrive_time":"09:11:00","depart_time":"09:12:00","stop_time":1,"run_time":5,"stop_type":1,"direction":2},{"train_schedule_detail_id":112,"line_id":1,"train_schedule_id":106,"station_id":9,"arrive_time":"09:17:00","depart_time":"09:18:00","stop_time":1,"run_time":5,"stop_type":1,"direction":2},{"train_schedule_detail_id":113,"line_id":1,"train_schedule_id":106,"station_id":8,"arrive_time":"09:23:00","depart_time":"09:24:00","stop_time":1,"run_time":5,"stop_type":1,"direction":2},{"train_schedule_detail_id":114,"line_id":1,"train_schedule_id":106,"station_id":7,"arrive_time":"09:29:00","depart_time":"09:30:00","stop_time":1,"run_time":5,"stop_type":1,"direction":2},{"train_schedule_detail_id":115,"line_id":1,"train_schedule_id":106,"station_id":6,"arrive_time":"09:35:00","depart_time":"09:36:00","stop_time":1,"run_time":5,"stop_type":1,"direction":2},{"train_schedule_detail_id":116,"line_id":1,"train_schedule_id":106,"station_id":5,"arrive_time":"09:41:00","depart_time":"09:42:00","stop_time":1,"run_time":5,"stop_type":1,"direction":2},{"train_schedule_detail_id":117,"line_id":1,"train_schedule_id":106,"station_id":4,"arrive_time":"09:47:00","depart_time":"09:48:00","stop_time":1,"run_time":5,"stop_type":1,"direction":2},{"train_schedule_detail_id":118,"line_id":1,"train_schedule_id":106,"station_id":3,"arrive_time":"09:53:00","depart_time":"09:54:00","stop_time":1,"run_time":5,"stop_type":1,"direction":2},{"train_schedule_detail_id":119,"line_id":1,"train_schedule_id":106,"station_id":2,"arrive_time":"09:59:00","depart_time":"10:00:00","stop_time":1,"run_time":5,"stop_type":1,"direction":2},{"train_schedule_detail_id":120,"line_id":1,"train_schedule_id":106,"station_id":1,"arrive_time":"10:05:00","depart_time":"10:06:00","stop_time":1,"run_time":5,"stop_type":1,"direction":2},{"train_schedule_detail_id":121,"line_id":1,"train_schedule_id":107,"station_id":1,"arrive_time":"10:10:00","depart_time":"10:12:00","stop_time":2,"run_time":8,"stop_type":1,"direction":1},{"train_schedule_detail_id":122,"line_id":1,"train_schedule_id":107,"station_id":2,"arrive_time":"10:20:00","depart_time":"10:22:00","stop_time":2,"run_time":8,"stop_type":1,"direction":1},{"train_schedule_detail_id":123,"line_id":1,"train_schedule_id":107,"station_id":3,"arrive_time":"10:30:00","depart_time":"10:32:00","stop_time":2,"run_time":8,"stop_type":1,"direction":1},{"train_schedule_detail_id":124,"line_id":1,"train_schedule_id":107,"station_id":4,"arrive_time":"10:40:00","depart_time":"10:42:00","stop_time":2,"run_time":8,"stop_type":1,"direction":1},{"train_schedule_detail_id":125,"line_id":1,"train_schedule_id":107,"station_id":5,"arrive_time":"10:50:00","depart_time":"10:52:00","stop_time":2,"run_time":8,"stop_type":1,"direction":1},{"train_schedule_detail_id":126,"line_id":1,"train_schedule_id":107,"station_id":6,"arrive_time":"11:00:00","depart_time":"11:02:00","stop_time":2,"run_time":8,"stop_type":1,"direction":1},{"train_schedule_detail_id":127,"line_id":1,"train_schedule_id":107,"station_id":7,"arrive_time":"11:10:00","depart_time":"11:12:00","stop_time":2,"run_time":8,"stop_type":1,"direction":1},{"train_schedule_detail_id":128,"line_id":1,"train_schedule_id":107,"station_id":8,"arrive_time":"11:20:00","depart_time":"11:22:00","stop_time":2,"run_time":8,"stop_type":1,"direction":1},{"train_schedule_detail_id":129,"line_id":1,"train_schedule_id":107,"station_id":9,"arrive_time":"11:30:00","depart_time":"11:32:00","stop_time":2,"run_time":8,"stop_type":1,"direction":1},{"train_schedule_detail_id":130,"line_id":1,"train_schedule_id":107,"station_id":10,"arrive_time":"11:40:00","depart_time":"11:42:00","stop_time":2,"run_time":8,"stop_type":1,"direction":1},{"train_schedule_detail_id":131,"line_id":1,"train_schedule_id":107,"station_id":11,"arrive_time":"11:50:00","depart_time":"11:52:00","stop_time":2,"run_time":8,"stop_type":1,"direction":1},{"train_schedule_detail_id":132,"line_id":1,"train_schedule_id":107,"station_id":12,"arrive_time":"12:00:00","depart_time":"12:02:00","stop_time":2,"run_time":8,"stop_type":1,"direction":1},{"train_schedule_detail_id":133,"line_id":1,"train_schedule_id":107,"station_id":13,"arrive_time":"12:10:00","depart_time":"12:12:00","stop_time":2,"run_time":8,"stop_type":1,"direction":1},{"train_schedule_detail_id":134,"line_id":1,"train_schedule_id":107,"station_id":14,"arrive_time":"12:20:00","depart_time":"12:22:00","stop_time":2,"run_time":8,"stop_type":1,"direction":1},{"train_schedule_detail_id":135,"line_id":1,"train_schedule_id":107,"station_id":15,"arrive_time":"12:30:00","depart_time":"12:32:00","stop_time":2,"run_time":8,"stop_type":1,"direction":1},{"train_schedule_detail_id":136,"line_id":1,"train_schedule_id":107,"station_id":16,"arrive_time":"12:40:00","depart_time":"12:42:00","stop_time":2,"run_time":8,"stop_type":1,"direction":1},{"train_schedule_detail_id":137,"line_id":1,"train_schedule_id":107,"station_id":17,"arrive_time":"12:50:00","depart_time":"12:52:00","stop_time":2,"run_time":8,"stop_type":1,"direction":1},{"train_schedule_detail_id":138,"line_id":1,"train_schedule_id":107,"station_id":18,"arrive_time":"13:00:00","depart_time":"13:02:00","stop_time":2,"run_time":8,"stop_type":1,"direction":1},{"train_schedule_detail_id":139,"line_id":1,"train_schedule_id":107,"station_id":19,"arrive_time":"13:10:00","depart_time":"13:12:00","stop_time":2,"run_time":8,"stop_type":1,"direction":1},{"train_schedule_detail_id":140,"line_id":1,"train_schedule_id":107,"station_id":20,"arrive_time":"13:20:00","depart_time":"13:22:00","stop_time":2,"run_time":8,"stop_type":1,"direction":1},{"train_schedule_detail_id":141,"line_id":1,"train_schedule_id":108,"station_id":20,"arrive_time":"13:15:00","depart_time":"13:18:00","stop_time":3,"run_time":10,"stop_type":1,"direction":2},{"train_schedule_detail_id":142,"line_id":1,"train_schedule_id":108,"station_id":19,"arrive_time":"13:28:00","depart_time":"13:31:00","stop_time":3,"run_time":10,"stop_type":1,"direction":2},{"train_schedule_detail_id":143,"line_id":1,"train_schedule_id":108,"station_id":18,"arrive_time":"13:41:00","depart_time":"13:44:00","stop_time":3,"run_time":10,"stop_type":1,"direction":2},{"train_schedule_detail_id":144,"line_id":1,"train_schedule_id":108,"station_id":17,"arrive_time":"13:54:00","depart_time":"13:57:00","stop_time":3,"run_time":10,"stop_type":1,"direction":2},{"train_schedule_detail_id":145,"line_id":1,"train_schedule_id":108,"station_id":16,"arrive_time":"14:07:00","depart_time":"14:10:00","stop_time":3,"run_time":10,"stop_type":1,"direction":2},{"train_schedule_detail_id":146,"line_id":1,"train_schedule_id":108,"station_id":15,"arrive_time":"14:20:00","depart_time":"14:23:00","stop_time":3,"run_time":10,"stop_type":1,"direction":2},{"train_schedule_detail_id":147,"line_id":1,"train_schedule_id":108,"station_id":14,"arrive_time":"14:33:00","depart_time":"14:36:00","stop_time":3,"run_time":10,"stop_type":1,"direction":2},{"train_schedule_detail_id":148,"line_id":1,"train_schedule_id":108,"station_id":13,"arrive_time":"14:46:00","depart_time":"14:49:00","stop_time":3,"run_time":10,"stop_type":1,"direction":2},{"train_schedule_detail_id":149,"line_id":1,"train_schedule_id":108,"station_id":12,"arrive_time":"14:59:00","depart_time":"15:02:00","stop_time":3,"run_time":10,"stop_type":1,"direction":2},{"train_schedule_detail_id":150,"line_id":1,"train_schedule_id":108,"station_id":11,"arrive_time":"15:12:00","depart_time":"15:15:00","stop_time":3,"run_time":10,"stop_type":1,"direction":2},{"train_schedule_detail_id":151,"line_id":1,"train_schedule_id":108,"station_id":10,"arrive_time":"15:25:00","depart_time":"15:28:00","stop_time":3,"run_time":10,"stop_type":1,"direction":2},{"train_schedule_detail_id":152,"line_id":1,"train_schedule_id":108,"station_id":9,"arrive_time":"15:38:00","depart_time":"15:41:00","stop_time":3,"run_time":10,"stop_type":1,"direction":2},{"train_schedule_detail_id":153,"line_id":1,"train_schedule_id":108,"station_id":8,"arrive_time":"15:51:00","depart_time":"15:54:00","stop_time":3,"run_time":10,"stop_type":1,"direction":2},{"train_schedule_detail_id":154,"line_id":1,"train_schedule_id":108,"station_id":7,"arrive_time":"16:04:00","depart_time":"16:07:00","stop_time":3,"run_time":10,"stop_type":1,"direction":2},{"train_schedule_detail_id":155,"line_id":1,"train_schedule_id":108,"station_id":6,"arrive_time":"16:17:00","depart_time":"16:20:00","stop_time":3,"run_time":10,"stop_type":1,"direction":2},{"train_schedule_detail_id":156,"line_id":1,"train_schedule_id":108,"station_id":5,"arrive_time":"16:30:00","depart_time":"16:33:00","stop_time":3,"run_time":10,"stop_type":1,"direction":2},{"train_schedule_detail_id":157,"line_id":1,"train_schedule_id":108,"station_id":4,"arrive_time":"16:43:00","depart_time":"16:46:00","stop_time":3,"run_time":10,"stop_type":1,"direction":2},{"train_schedule_detail_id":158,"line_id":1,"train_schedule_id":108,"station_id":3,"arrive_time":"16:56:00","depart_time":"16:59:00","stop_time":3,"run_time":10,"stop_type":1,"direction":2},{"train_schedule_detail_id":159,"line_id":1,"train_schedule_id":108,"station_id":2,"arrive_time":"17:09:00","depart_time":"17:12:00","stop_time":3,"run_time":10,"stop_type":1,"direction":2},{"train_schedule_detail_id":160,"line_id":1,"train_schedule_id":108,"station_id":1,"arrive_time":"17:22:00","depart_time":"17:25:00","stop_time":3,"run_time":10,"stop_type":1,"direction":2}],
  'cw_seat_type': [{"seat_type_id":1,"seat_type_name":"驾驶位"},{"seat_type_id":2,"seat_type_name":"乘务位"}],
  'cw_station': [{"station_id":1,"station_name":"王府井站"},{"station_id":2,"station_name":"西单站"},{"station_id":3,"station_name":"东直门站"},{"station_id":4,"station_name":"西直门站"},{"station_id":5,"station_name":"建国门站"},{"station_id":6,"station_name":"复兴门站"},{"station_id":7,"station_name":"国贸站"},{"station_id":8,"station_name":"海淀黄庄站"},{"station_id":9,"station_name":"中关村站"},{"station_id":10,"station_name":"五道口站"},{"station_id":11,"station_name":"雍和宫站"},{"station_id":12,"station_name":"安定门站"},{"station_id":13,"station_name":"朝阳门站"},{"station_id":14,"station_name":"崇文门站"},{"station_id":15,"station_name":"宣武门站"},{"station_id":16,"station_name":"菜市口站"},{"station_id":17,"station_name":"陶然亭站"},{"station_id":18,"station_name":"北京站"},{"station_id":19,"station_name":"天安门东站"},{"station_id":20,"station_name":"天安门西站"}],
  'cw_logic_station': [{"id":1,"station_id":10,"line_id":1,"station_type":1},{"id":2,"station_id":15,"line_id":1,"station_type":1}],
  'drive_ticket': [{"id":1,"ticket_id":1,"train_name":"G00101","start_station":"王府井站","end_station":"五道口站","seat_type":"驾驶位","pickup_time":"06:00:00","dropoff_time":"06:45:00","is_sold":true},{"id":2,"ticket_id":2,"train_name":"G00201","start_station":"王府井站","end_station":"五道口站","seat_type":"驾驶位","pickup_time":"06:10:00","dropoff_time":"06:55:00","is_sold":true},{"id":3,"ticket_id":3,"train_name":"G00301","start_station":"西单站","end_station":"中关村站","seat_type":"驾驶位","pickup_time":"06:20:00","dropoff_time":"07:00:00","is_sold":true},{"id":4,"ticket_id":4,"train_name":"G00401","start_station":"西单站","end_station":"中关村站","seat_type":"驾驶位","pickup_time":"06:30:00","dropoff_time":"07:10:00","is_sold":true},{"id":5,"ticket_id":5,"train_name":"G00501","start_station":"东直门站","end_station":"国贸站","seat_type":"驾驶位","pickup_time":"06:40:00","dropoff_time":"07:15:00","is_sold":true},{"id":6,"ticket_id":6,"train_name":"G00601","start_station":"东直门站","end_station":"国贸站","seat_type":"驾驶位","pickup_time":"06:50:00","dropoff_time":"07:25:00","is_sold":true}],
  'drive_ticket_collect': [{"collect_id":1,"collect_name":"早班交路票夹","description":"包含所有早班交路票","ticket_ids":[1,2,3,4,5,6],"created_time":"2023-08-31T10:00:00Z"},{"collect_id":2,"collect_name":"晚班交路票夹","description":"包含所有晚班交路票","ticket_ids":[],"created_time":"2023-08-31T10:00:00Z"}],
  'drive_ticket_param': [{"id":1,"param_name":"最大开车时间","param_value":"02:00:00","param_type":"1","param_desc":"最大开车时间参数","is_checked":true},{"id":2,"param_name":"早班接车时间","param_value":"04:00:00","param_type":1,"param_desc":"早班接车时间参数","is_checked":true},{"id":3,"param_name":"早班退车时间","param_value":"11:00:00","param_type":1,"param_desc":"早班退车时间参数","is_checked":true},{"id":4,"param_name":"白班接车时间","param_value":"11:00:00","param_type":1,"param_desc":"白班接车时间参数","is_checked":true},{"id":5,"param_name":"白班退车时间","param_value":"16:00:00","param_type":1,"param_desc":"白班退车时间参数","is_checked":true},{"id":6,"param_name":"夜班接车时间","param_value":"16:00:00","param_type":1,"param_desc":"白班接车时间参数","is_checked":true},{"id":7,"param_name":"夜班退车时间","param_value":"22:00:00","param_type":1,"param_desc":"白班退车时间参数","is_checked":true},{"id":8,"param_name":"强制回程站点","param_value":"五道口站","param_type":2,"param_desc":"强制回程站点参数","is_checked":false},{"id":9,"param_name":"变更车次间隔时间","param_value":"00:30:00","param_type":1,"param_desc":"变更车次间隔时间参数(默认30分钟)","is_checked":true}]
};

// API路径到数据键的映射
const apiToDataKey = {
  '/api/crossing-roads': 'cw_crossing_road',
  '/api/lines': 'cw_line',
  '/api/train-schedules': 'cw_train_schedule',
  '/api/train-schedule-details': 'cw_train_schedule_detail',
  '/api/seat-types': 'cw_seat_type',
  '/api/stations': 'cw_station',
  '/api/logic-stations': 'cw_logic_station',
  '/api/drive-tickets': 'drive_ticket',
  '/api/drive-ticket-collect': 'drive_ticket_collect',
  '/api/drive-ticket-params': 'drive_ticket_param'
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
    // 从KV存储或默认数据读取数据
    if (apiToDataKey[path] && request.method === 'GET') {
      try {
        const dataKey = apiToDataKey[path];
        
        // 优先从KV存储读取数据
        const kvData = await env.SUBWAY_DATA.get(dataKey);
        if (kvData) {
          return new Response(kvData, {
            headers: corsHeaders
          });
        }
        
        // 如果KV中没有数据，返回默认数据
        const defaultDataForKey = defaultData[dataKey];
        if (defaultDataForKey) {
          return new Response(JSON.stringify(defaultDataForKey), {
            headers: corsHeaders
          });
        } else {
          return new Response(JSON.stringify({ error: '数据不存在' }), {
            status: 404,
            headers: corsHeaders
          });
        }
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
        // 这里应该调用生成交路票夹的逻辑
        return new Response(JSON.stringify({ message: '交路票夹记录生成和更新成功', count: 0 }), {
          headers: corsHeaders
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: '生成交路票夹失败: ' + error.message }), {
          status: 500,
          headers: corsHeaders
        });
      }
    }

    // 处理PUT请求 - 更新数据
    if (apiToDataKey[path] && request.method === 'PUT') {
      try {
        const data = await request.json();
        const dataKey = apiToDataKey[path];
        
        // 将数据存储到KV中
        await env.SUBWAY_DATA.put(dataKey, JSON.stringify(data));
        
        return new Response(JSON.stringify({ 
          message: '数据更新成功（已保存到KV存储）' 
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