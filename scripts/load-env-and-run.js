/**
 * 跨平台环境变量加载脚本
 * 从 backend/.env 读取环境变量并执行命令
 * 
 * 用法: node scripts/load-env-and-run.js <command> [args...]
 * 例如: node scripts/load-env-and-run.js docker-compose -f docker-compose.dev.yml up -d
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// 加载 .env 文件
const envPath = path.join(__dirname, '..', 'backend', '.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
} else {
  console.warn(`Warning: ${envPath} not found`);
}

// 获取要执行的命令和参数
const [, , ...args] = process.argv;

if (args.length === 0) {
  console.error('Error: No command provided');
  process.exit(1);
}

// 执行命令
const command = args[0];
const commandArgs = args.slice(1);

// 将环境变量传递给子进程
const env = { ...process.env };

const child = spawn(command, commandArgs, {
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env
});

child.on('error', (error) => {
  console.error(`Error executing command: ${error.message}`);
  process.exit(1);
});

child.on('exit', (code) => {
  process.exit(code || 0);
});

