import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cloudflare API配置
const CLOUDFLARE_ACCOUNT_ID = 'eaf576cf734a494c979fd12500f0ffda';
const CLOUDFLARE_API_TOKEN = '8df54c205f6e62f024e337e2fcd5d6529c670';
const WORKER_NAME = 'mtrcx-subway-system';

// 读取worker脚本内容
const workerScriptPath = path.join(__dirname, 'src', 'index.js');
const workerScript = fs.readFileSync(workerScriptPath, 'utf8');

// 更新worker脚本
async function updateWorker() {
  console.log('Updating worker script...');
  
  try {
    // 创建multipart/form-data请求体
    const formData = new FormData();
    const blob = new Blob([workerScript], { type: 'application/javascript' });
    formData.append('metadata', JSON.stringify({ 
      body_part: 'script',
      bindings: [
        {
          type: 'kv_namespace',
          name: 'SUBWAY_DATA',
          namespace_id: '01b950f1bbeb414c979fd12500f0ffda'
        }
      ]
    }));
    formData.append('script', blob);
    
    const url = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/workers/scripts/${WORKER_NAME}`;
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
      },
      body: formData
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update worker: ${response.status} ${errorText}`);
    }
    
    const result = await response.json();
    console.log('Worker updated successfully:', result);
  } catch (error) {
    console.error('Error updating worker:', error);
    process.exit(1);
  }
}

// 执行更新
updateWorker();