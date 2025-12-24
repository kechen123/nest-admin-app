/**
 * 快速启动脚本（跨平台）
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');

const execAsync = promisify(exec);
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function checkMySQLReady(maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      await execAsync('docker exec yl-mysql-dev mysqladmin ping -h localhost -uroot -proot 2>&1');
      return true;
    } catch {
      await sleep(1000);
    }
  }
  return false;
}

async function main() {
  console.log('🚀 快速启动项目...\n');

  // 检查 .env 文件
  const envPath = path.join(__dirname, '..', 'backend', '.env');
  if (!fs.existsSync(envPath)) {
    console.log('⚠️  未找到 backend/.env 文件');
    console.log('请先创建 backend/.env 文件并配置数据库信息');
    process.exit(1);
  }

  try {
    // 启动 MySQL
    console.log('📦 启动 MySQL...');
    await execAsync('npm run mysql:start');

    // 等待 MySQL 启动
    console.log('⏳ 等待 MySQL 启动（约 15 秒）...');
    await sleep(15000);

    // 检查 MySQL 是否就绪
    console.log('🔍 检查 MySQL 状态...');
    const mysqlReady = await checkMySQLReady();
    
    if (!mysqlReady) {
      console.log('❌ MySQL 启动超时，请检查日志: npm run mysql:logs');
      process.exit(1);
    }
    console.log('✅ MySQL 已就绪\n');

    // 初始化数据库
    console.log('🗄️  初始化数据库...');
    process.chdir(path.join(__dirname, '..', 'backend'));
    await execAsync('npm run db:init');
    process.chdir(path.join(__dirname, '..'));

    console.log('\n✅ 启动完成！\n');
    console.log('访问地址:');
    console.log('  - 前端: http://localhost:4000');
    console.log('  - 后端 API: http://localhost:3000/api');
    console.log('  - Swagger: http://localhost:3000/api');
    console.log('\n运行以下命令检查服务状态:');
    console.log('  npm run health');

  } catch (error) {
    console.error('❌ 启动过程中出错:', error.message);
    process.exit(1);
  }
}

main();

