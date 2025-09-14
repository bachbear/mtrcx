/**
 * 响应工具函数
 */

export function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export function errorResponse(message, status = 400, details = null) {
  const errorData = { error: message };
  if (details) {
    errorData.details = details;
  }
  
  return jsonResponse(errorData, status);
}

export function successResponse(message, data = null, count = null) {
  const responseData = { message };
  if (data !== null) {
    responseData.data = data;
  }
  if (count !== null) {
    responseData.count = count;
  }
  
  return jsonResponse(responseData);
}