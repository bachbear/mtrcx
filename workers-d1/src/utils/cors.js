/**
 * CORS 工具函数
 */

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
  'Access-Control-Max-Age': '86400',
};

export function handleCORS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}