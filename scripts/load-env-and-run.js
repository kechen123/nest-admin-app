/**
 * 跨平台环境变量加载脚本
 * 从 backend/.env 读取环境变量并执行命令
 *
 * 特点：
 * - 不依赖任何外部包（dotenv），开箱即用
 * - 跨平台兼容（Windows/Mac/Linux）
 * - 支持 Docker 模式，无需本地安装依赖
 *
 * 用法: node scripts/load-env-and-run.js <command> [args...]
 * 例如: node scripts/load-env-and-run.js docker-compose -f docker-compose.dev.yml up -d
 */

const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

/**
 * 简单的 .env 文件解析器（不依赖外部包，跨平台兼容）
 * 支持的功能：
 * - 基本 KEY=VALUE 格式
 * - 单引号和双引号包裹的值
 * - 行尾注释（# 开头）
 * - 跳过空行和注释行
 * - 跨平台行结束符（\r\n 和 \n）
 */
function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const content = fs.readFileSync(filePath, "utf8");
  // 处理不同平台的行结束符：Windows (\r\n), Linux/Mac (\n)
  const lines = content.split(/\r?\n/);

  lines.forEach((line) => {
    // 移除行首行尾空白（跨平台兼容）
    line = line.trim();

    // 跳过空行
    if (!line) return;

    // 跳过注释行（以 # 开头）
    if (line.startsWith("#")) return;

    // 匹配 KEY=VALUE 格式
    // 支持：KEY=value, KEY="value", KEY='value', KEY=value # comment
    const match = line.match(/^([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/);
    if (!match) return;

    const key = match[1].trim();
    let value = match[2].trim();

    // 处理行尾注释（值中可能包含 #，所以只处理行尾的 #）
    // 简单策略：如果整个值被引号包裹，则忽略行尾注释
    // 否则，如果值中有 #，且后面跟着空格，可能是注释
    const commentIndex = value.indexOf(" #");
    if (commentIndex > 0 && !value.startsWith('"') && !value.startsWith("'")) {
      value = value.substring(0, commentIndex).trim();
    }

    // 处理引号（单引号和双引号）
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
      // 处理基本转义字符
      value = value.replace(/\\"/g, '"').replace(/\\'/g, "'").replace(/\\n/g, "\n");
    }

    // 设置环境变量（跨平台兼容）
    process.env[key] = value;
  });
}

// 加载 .env 文件
const envPath = path.join(__dirname, "..", "backend", ".env");
if (fs.existsSync(envPath)) {
  parseEnvFile(envPath);
} else {
  console.warn(`Warning: ${envPath} not found`);
}

// 获取要执行的命令和参数
const [, , ...args] = process.argv;

if (args.length === 0) {
  console.error("Error: No command provided");
  process.exit(1);
}

// 执行命令
const command = args[0];
const commandArgs = args.slice(1);

// 将环境变量传递给子进程
const env = { ...process.env };

const child = spawn(command, commandArgs, {
  stdio: "inherit",
  shell: process.platform === "win32",
  env,
});

child.on("error", (error) => {
  console.error(`Error executing command: ${error.message}`);
  process.exit(1);
});

child.on("exit", (code) => {
  process.exit(code || 0);
});
