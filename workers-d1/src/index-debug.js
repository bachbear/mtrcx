import { generateDriveTickets } from './logic/drive_tickets.js';
import { generateDriveTicketCollect } from './logic/drive_ticket_collect.js';
import { generateRideTickets } from './logic/ride_tickets.js';

/**
 * Cloudflare Workers API for 地铁交路管理系统 - 诊断版本
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
      // 诊断信息 - 检查环境绑定
      if (path === '/api/debug') {
        const debugInfo = {
          path,
          method,
          hasDB: !!env.DB,
          hasKV: !!env.SUBWAY_DATA,
          envKeys: Object.keys(env),
          timestamp: new Date().toISOString()
        };
        return new Response(JSON.stringify(debugInfo, null, 2), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // API路由处理
      if (path.startsWith('/api/')) {
        const response = await handleApiRequest(request, env, path, method);
        // 添加CORS头到所有API响应
        Object.entries(corsHeaders).forEach(([key, value]) => {
          response.headers.set(key, value);
        });
        return response;
      }

      // 静态文件或默认响应
      return new Response('Not found', {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'text/plain; charset=utf-8' }
      });

    } catch (error) {
      console.error('API Error:', error);
      return new Response(JSON.stringify({ 
        error: '服务器内部错误', 
        details: error.message,
        stack: error.stack
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};

async function handleApiRequest(request, env, path, method) {
  // 检查 DB 绑定
  if (!env.DB) {
    return new Response(JSON.stringify({ 
      error: 'D1数据库未绑定', 
      details: 'env.DB is undefined',
      availableBindings: Object.keys(env)
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const { DB } = env;

  switch (path) {
    // 便乘票管理
    case '/api/ride-tickets':
      if (method === 'GET') {
        try {
          const result = await DB.prepare('SELECT * FROM drive_ride_ticket ORDER BY id').all();
          return jsonResponse(result.results);
        } catch (error) {
          return jsonResponse({ 
            error: '查询便乘票失败', 
            details: error.message 
          }, 500);
        }
      }
      break;

    // 生成便乘票
    case '/api/generate-ride-tickets':
      if (method === 'POST') {
        try {
          return await handleGenerateRideTickets(DB);
        } catch (error) {
          return jsonResponse({ 
            error: '生成便乘票失败', 
            details: error.message 
          }, 500);
        }
      }
      break;

    // 线路管理
    case '/api/lines':
      if (method === 'GET') {
        try {
          const result = await DB.prepare('SELECT * FROM cw_line ORDER BY line_id').all();
          return jsonResponse(result.results);
        } catch (error) {
          return jsonResponse({ 
            error: '查询线路失败', 
            details: error.message 
          }, 500);
        }
      }
      break;

    default:
      return new Response(JSON.stringify({ 
        error: '未找到API端点',
        requestedPath: path,
        method: method
      }), {
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

// 生成便乘票处理函数
async function handleGenerateRideTickets(DB) {
  try {
    // 简单的便乘票生成逻辑
    const result = await DB.prepare(`
      INSERT INTO drive_ride_ticket (ride_ticket_seq, train_name, departure_station, arrival_station, departure_time, arrival_time, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      'RT' + Date.now(),
      'TEST_TRAIN',
      '测试起点站',
      '测试终点站',
      '08:00',
      '09:00',
      new Date().toISOString()
    ).run();

    return jsonResponse({ 
      message: '便乘票生成成功', 
      rideTicketId: result.meta.last_row_id 
    });
  } catch (error) {
    console.error('生成便乘票失败:', error);
    return jsonResponse({ 
      error: '生成便乘票失败', 
      details: error.message 
    }, 500);
  }
}