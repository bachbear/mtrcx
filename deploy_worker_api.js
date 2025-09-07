import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cloudflare API配置
const CLOUDFLARE_ACCOUNT_ID = 'eaf576cf734a494c98e45cfa863ebed8';
const CLOUDFLARE_API_TOKEN = '5WemO59WtzlF7rzQfPgJ7zNN_DVB_5WXECLqwMhz';
const WORKER_NAME = 'mtrcx-subway-system';

// 读取worker脚本内容
const workerScriptPath = path.join(__dirname, 'src', 'index.js');
const workerScript = fs.readFileSync(workerScriptPath, 'utf8');

// 部署worker
async function deployWorker() {
  console.log('Deploying worker using Cloudflare API...');
  
  try {
    const url = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/workers/scripts/${WORKER_NAME}`;
    
    // 准备请求体
    const formData = new FormData();
    
    // 添加元数据
    const metadata = {
      body_part: 'script',
      bindings: [
        {
          type: 'kv_namespace',
          name: 'SUBWAY_DATA',
          namespace_id: '01b950f1bbeb414c979fd12500f0ffda'
        }
      ]
    };
    
    formData.append('metadata', JSON.stringify(metadata));
    
    // 添加脚本内容
    const scriptBlob = new Blob([workerScript], { type: 'application/javascript' });
    formData.append('script', scriptBlob);
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
      },
      body: formData
    });
    
    const responseText = await response.text();
    
    if (!response.ok) {
      throw new Error(`Failed to deploy worker: ${response.status} ${responseText}`);
    }
    
    console.log('Worker deployed successfully!');
    console.log('Response:', responseText);
  } catch (error) {
    console.error('Error deploying worker:', error);
    process.exit(1);
  }
}

// 执行部署
deployWorker();