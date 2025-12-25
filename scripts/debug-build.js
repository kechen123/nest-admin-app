/**
 * 构建调试脚本
 * 记录 Docker 构建过程的详细信息
 */

const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const LOG_PATH = path.join(__dirname, "..", ".cursor", "debug.log");
const SERVER_ENDPOINT = "http://127.0.0.1:7244/ingest/0ca50388-22e6-4cac-83d9-1563006094ea";

// #region agent log
function logDebug(data) {
  const logEntry = {
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    sessionId: "debug-session",
    runId: "build-debug",
    ...data
  };
  
  // 写入本地日志文件
  try {
    fs.appendFileSync(LOG_PATH, JSON.stringify(logEntry) + "\n", "utf8");
  } catch (err) {
    // 忽略写入错误
  }
  
  // 发送到服务器
  try {
    if (typeof fetch !== "undefined") {
      fetch(SERVER_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(logEntry)
      }).catch(() => {});
    } else {
      // 如果 fetch 不可用，使用 http/https 模块
      const http = require("http");
      const url = require("url");
      const parsedUrl = url.parse(SERVER_ENDPOINT);
      const postData = JSON.stringify(logEntry);
      
      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port,
        path: parsedUrl.path,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(postData)
        }
      };
      
      const req = http.request(options, () => {});
      req.on("error", () => {});
      req.write(postData);
      req.end();
    }
  } catch (err) {
    // 忽略网络错误
  }
}
// #endregion agent log

// #region agent log
logDebug({
  location: "debug-build.js:start",
  message: "构建调试脚本开始",
  hypothesisId: "ALL",
  data: { nodeVersion: process.version, platform: process.platform }
});
// #endregion agent log

// 检查 Docker 是否可用
function checkDocker() {
  return new Promise((resolve) => {
    // #region agent log
    logDebug({
      location: "debug-build.js:checkDocker",
      message: "检查 Docker 是否可用",
      hypothesisId: "E",
      data: {}
    });
    // #endregion agent log
    
    const docker = spawn("docker", ["--version"], {
      shell: process.platform === "win32"
    });
    
    let output = "";
    docker.stdout.on("data", (data) => {
      output += data.toString();
    });
    
    docker.stderr.on("data", (data) => {
      output += data.toString();
    });
    
    docker.on("exit", (code) => {
      // #region agent log
      logDebug({
        location: "debug-build.js:checkDocker:exit",
        message: "Docker 检查完成",
        hypothesisId: "E",
        data: { exitCode: code, output: output.trim() }
      });
      // #endregion agent log
      resolve(code === 0);
    });
    
    docker.on("error", (err) => {
      // #region agent log
      logDebug({
        location: "debug-build.js:checkDocker:error",
        message: "Docker 检查失败",
        hypothesisId: "E",
        data: { error: err.message }
      });
      // #endregion agent log
      resolve(false);
    });
  });
}

// 检查必要文件是否存在
function checkFiles() {
  const files = [
    "docker-compose.prod.yml",
    "docker/backend/Dockerfile.prod",
    "docker/web/Dockerfile.prod",
    "backend/package.json",
    "backend/pnpm-lock.yaml",
    "web/package.json",
    "web/pnpm-lock.yaml"
  ];
  
  // #region agent log
  logDebug({
    location: "debug-build.js:checkFiles",
    message: "检查必要文件",
    hypothesisId: "D",
    data: { files }
  });
  // #endregion agent log
  
  const results = {};
  files.forEach((file) => {
    const fullPath = path.join(__dirname, "..", file);
    const exists = fs.existsSync(fullPath);
    results[file] = exists;
    
    // #region agent log
    logDebug({
      location: "debug-build.js:checkFiles:item",
      message: `检查文件: ${file}`,
      hypothesisId: "D",
      data: { file, exists, fullPath }
    });
    // #endregion agent log
  });
  
  return results;
}

// 运行构建
async function runBuild() {
  // #region agent log
  logDebug({
    location: "debug-build.js:runBuild:start",
    message: "开始运行 Docker 构建",
    hypothesisId: "ALL",
    data: {}
  });
  // #endregion agent log
  
  const dockerCompose = spawn(
    "docker-compose",
    ["-f", "docker-compose.prod.yml", "build"],
    {
      cwd: path.join(__dirname, ".."),
      shell: process.platform === "win32",
      stdio: ["inherit", "pipe", "pipe"]
    }
  );
  
  let stdout = "";
  let stderr = "";
  
  dockerCompose.stdout.on("data", (data) => {
    const text = data.toString();
    stdout += text;
    process.stdout.write(text);
    
    // #region agent log
    logDebug({
      location: "debug-build.js:runBuild:stdout",
      message: "Docker 构建输出",
      hypothesisId: "A",
      data: { output: text.trim() }
    });
    // #endregion agent log
  });
  
  dockerCompose.stderr.on("data", (data) => {
    const text = data.toString();
    stderr += text;
    process.stderr.write(text);
    
    // #region agent log
    logDebug({
      location: "debug-build.js:runBuild:stderr",
      message: "Docker 构建错误输出",
      hypothesisId: "A",
      data: { error: text.trim() }
    });
    // #endregion agent log
  });
  
  dockerCompose.on("exit", (code) => {
    // #region agent log
    logDebug({
      location: "debug-build.js:runBuild:exit",
      message: "Docker 构建完成",
      hypothesisId: "ALL",
      data: {
        exitCode: code,
        stdoutLength: stdout.length,
        stderrLength: stderr.length,
        stdout: stdout.substring(Math.max(0, stdout.length - 5000)), // 最后 5000 字符
        stderr: stderr.substring(Math.max(0, stderr.length - 5000))  // 最后 5000 字符
      }
    });
    // #endregion agent log
    
    process.exit(code || 0);
  });
  
  dockerCompose.on("error", (err) => {
    // #region agent log
    logDebug({
      location: "debug-build.js:runBuild:error",
      message: "Docker 构建启动失败",
      hypothesisId: "E",
      data: { error: err.message, code: err.code }
    });
    // #endregion agent log
    
    console.error(`Error: ${err.message}`);
    process.exit(1);
  });
}

// 主函数
async function main() {
  // #region agent log
  logDebug({
    location: "debug-build.js:main:start",
    message: "主函数开始",
    hypothesisId: "ALL",
    data: {}
  });
  // #endregion agent log
  
  // 检查 Docker
  const dockerAvailable = await checkDocker();
  if (!dockerAvailable) {
    // #region agent log
    logDebug({
      location: "debug-build.js:main:dockerCheck",
      message: "Docker 不可用",
      hypothesisId: "E",
      data: {}
    });
    // #endregion agent log
    console.error("Error: Docker is not available");
    process.exit(1);
  }
  
  // 检查文件
  const fileCheck = checkFiles();
  const missingFiles = Object.entries(fileCheck)
    .filter(([_, exists]) => !exists)
    .map(([file]) => file);
  
  if (missingFiles.length > 0) {
    // #region agent log
    logDebug({
      location: "debug-build.js:main:missingFiles",
      message: "缺少必要文件",
      hypothesisId: "D",
      data: { missingFiles }
    });
    // #endregion agent log
    console.error(`Error: Missing files: ${missingFiles.join(", ")}`);
    process.exit(1);
  }
  
  // 运行构建
  await runBuild();
}

main().catch((err) => {
  // #region agent log
  logDebug({
    location: "debug-build.js:main:catch",
    message: "主函数异常",
    hypothesisId: "ALL",
    data: { error: err.message, stack: err.stack }
  });
  // #endregion agent log
  
  console.error(`Fatal error: ${err.message}`);
  process.exit(1);
});

