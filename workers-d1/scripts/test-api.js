/**
 * API测试脚本
 * 测试迁移后的Cloudflare Workers API功能
 */

// 测试配置
const API_BASE_URL = 'http://localhost:8787'; // 本地开发服务器
// const API_BASE_URL = 'https://your-worker.your-subdomain.workers.dev'; // 生产环境

// 测试所有API端点
async function testAllAPIs() {
  console.log('开始测试地铁交路管理系统API...\n');

  const endpoints = [
    { path: '/api/lines', name: '线路数据' },
    { path: '/api/stations', name: '车站数据' },
    { path: '/api/seat-types', name: '座位类型数据' },
    { path: '/api/logic-stations', name: '逻辑车站数据' },
    { path: '/api/crossing-roads', name: '交路数据' },
    { path: '/api/train-schedules', name: '列车时刻表数据' },
    { path: '/api/train-schedule-details', name: '列车时刻表明细数据' },
    { path: '/api/drive-tickets', name: '交路票数据' },
    { path: '/api/drive-ticket-collect', name: '交路票夹数据' },
    { path: '/api/drive-ticket-params', name: '交路参数数据' },
    { path: '/api/ride-tickets', name: '便乘票数据' }
  ];

  for (const endpoint of endpoints) {
    await testEndpoint(endpoint.path, endpoint.name);
  }

  console.log('\n所有API测试完成！');
}

// 测试单个API端点
async function testEndpoint(path, name) {
  try {
    console.log(`测试 ${name} (${path})...`);
    
    const response = await fetch(`${API_BASE_URL}${path}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`✅ ${name}: 成功获取 ${Array.isArray(data) ? data.length : 1} 条记录`);
    
    // 显示前几条数据作为示例
    if (Array.isArray(data) && data.length > 0) {
      console.log(`   示例数据:`, JSON.stringify(data[0], null, 2));
    }
    
  } catch (error) {
    console.error(`❌ ${name}: 测试失败 -`, error.message);
  }
  
  console.log('');
}

// 测试POST端点
async function testPostEndpoints() {
  console.log('测试POST端点...\n');

  const postEndpoints = [
    { path: '/api/generate-drive-tickets', name: '生成交路票' },
    { path: '/api/generate-drive-ticket-collect', name: '生成交路票夹' },
    { path: '/api/generate-ride-tickets', name: '生成便乘票' }
  ];

  for (const endpoint of postEndpoints) {
    await testPostEndpoint(endpoint.path, endpoint.name);
  }
}

async function testPostEndpoint(path, name) {
  try {
    console.log(`测试 ${name} (POST ${path})...`);
    
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`✅ ${name}: ${data.message}`);
    
  } catch (error) {
    console.error(`❌ ${name}: 测试失败 -`, error.message);
  }
  
  console.log('');
}

// 主函数
async function main() {
  await testAllAPIs();
  await testPostEndpoints();
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}