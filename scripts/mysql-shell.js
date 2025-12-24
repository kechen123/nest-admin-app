/**
 * MySQL Shell 脚本
 * 从 backend/.env 读取配置并连接到 MySQL
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// 加载 .env 文件
const envPath = path.join(__dirname, '..', 'backend', '.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
}

// 读取配置
const dbPassword = process.env.DB_PASSWORD || 'root';
const dbDatabase = process.env.DB_DATABASE || 'myapp_db';

// 执行 mysql shell
const child = spawn('docker', [
  'exec',
  '-it',
  'yl-mysql-dev',
  'mysql',
  '--ssl-mode=DISABLED',
  `-uroot`,
  `-p${dbPassword}`,
  dbDatabase
], {
  stdio: 'inherit',
  shell: process.platform === 'win32'
});

child.on('error', (error) => {
  console.error(`Error: ${error.message}`);
  console.error('请确保 MySQL 容器已启动: npm run mysql:start');
  process.exit(1);
});

child.on('exit', (code) => {
  process.exit(code || 0);
});

