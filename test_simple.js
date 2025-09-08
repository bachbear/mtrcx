console.log('测试脚本开始');
console.log('当前工作目录:', process.cwd());

// 测试读取文件
const fs = require('fs').promises;

async function test() {
  try {
    console.log('尝试读取逻辑车站文件...');
    const data = await fs.readFile('./data/cw_logic_station.json', 'utf8');
    console.log('文件内容长度:', data.length);
    console.log('前100字符:', data.substring(0, 100));
    
    const jsonData = JSON.parse(data);
    console.log('解析后的数组长度:', jsonData.length);
    
    console.log('测试完成');
  } catch (error) {
    console.error('错误:', error.message);
  }
}

test();