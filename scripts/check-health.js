/**
 * 健康检查脚本
 * 检查所有服务的运行状态
 */

const http = require('http');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// 检查 HTTP 服务
function checkHTTPService(name, url, timeout = 3000) {
  return new Promise((resolve) => {
    const req = http.get(url, { timeout }, (res) => {
      resolve({
        name,
        status: res.statusCode === 200 || res.statusCode === 404 ? 'OK' : 'ERROR',
        code: res.statusCode,
        message: res.statusCode === 200 ? '运行正常' : `HTTP ${res.statusCode}`
      });
    });

    req.on('error', (error) => {
      resolve({
        name,
        status: 'ERROR',
        code: null,
        message: error.code === 'ECONNREFUSED' ? '服务未启动' : error.message
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        name,
        status: 'TIMEOUT',
        code: null,
        message: '连接超时'
      });
    });
  });
}

// 检查 MySQL 服务
async function checkMySQL() {
  try {
    await execAsync('docker exec yl-mysql-dev mysqladmin ping -h localhost -uroot -proot 2>&1');
    return {
      name: 'MySQL',
      status: 'OK',
      code: null,
      message: '运行正常'
    };
  } catch (error) {
    // 检查容器是否存在
    try {
      await execAsync('docker ps --filter name=yl-mysql-dev --format "{{.Names}}"');
      return {
        name: 'MySQL',
        status: 'ERROR',
        code: null,
        message: '容器运行中但无法连接'
      };
    } catch {
      return {
        name: 'MySQL',
        status: 'ERROR',
        code: null,
        message: '容器未运行'
      };
    }
  }
}

// 检查 Docker 容器状态
async function checkContainers() {
  try {
    const { stdout } = await execAsync('docker-compose -f docker-compose.dev.yml ps --format json');
    const containers = stdout.trim().split('\n').filter(line => line.trim()).map(line => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    }).filter(Boolean);

    return containers.map(container => ({
      name: container.Name || container.name,
      status: container.State || container.state,
      health: container.Health || container.health || 'N/A'
    }));
  } catch (error) {
    return [];
  }
}

async function main() {
  console.log('🔍 检查服务状态...\n');

  // 检查 HTTP 服务
  const httpChecks = await Promise.all([
    checkHTTPService('Backend API', 'http://localhost:3000/api'),
    checkHTTPService('Frontend', 'http://localhost:4000')
  ]);

  // 检查 MySQL
  const mysqlCheck = await checkMySQL();

  // 检查容器状态
  const containers = await checkContainers();

  // 显示结果
  console.log('📊 服务状态:');
  console.log('─'.repeat(60));
  
  [...httpChecks, mysqlCheck].forEach(({ name, status, message }) => {
    const icon = status === 'OK' ? '✅' : '❌';
    const statusText = status === 'OK' ? '正常' : status === 'TIMEOUT' ? '超时' : '异常';
    console.log(`${icon} ${name.padEnd(20)} ${statusText.padEnd(8)} ${message}`);
  });

  if (containers.length > 0) {
    console.log('\n🐳 Docker 容器状态:');
    console.log('─'.repeat(60));
    containers.forEach(({ name, status, health }) => {
      const icon = status === 'running' ? '✅' : '❌';
      const healthText = health !== 'N/A' ? ` (健康: ${health})` : '';
      console.log(`${icon} ${name.padEnd(25)} ${status}${healthText}`);
    });
  }

  console.log('─'.repeat(60));

  // 统计结果
  const allChecks = [...httpChecks, mysqlCheck];
  const allOk = allChecks.every(r => r.status === 'OK');
  const runningContainers = containers.filter(c => c.status === 'running').length;

  if (allOk && runningContainers === containers.length) {
    console.log('\n✅ 所有服务运行正常！');
    process.exit(0);
  } else {
    console.log('\n❌ 部分服务异常，请检查上述信息');
    console.log('\n💡 提示:');
    if (!allOk) {
      console.log('   - 运行 npm run dev:up 启动所有服务');
      console.log('   - 运行 npm run ps 查看容器状态');
      console.log('   - 运行 npm run dev:logs 查看日志');
    }
    process.exit(1);
  }
}

main().catch(error => {
  console.error('检查过程中出错:', error.message);
  process.exit(1);
});

