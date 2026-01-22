/**
 * 构建调试脚本
 * 记录 Docker 构建过程的详细信息
 */

const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

// 加载 .env 文件
function loadEnvFile() {
  const envPath = path.join(__dirname, "..", "backend", ".env");

  try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));

    const envVars = {};
    lines.forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        envVars[key.trim()] = value;
        process.env[key.trim()] = value; // 设置到进程环境变量中
      }
    });

    return envVars;
  } catch (error) {
    return {};
  }
}

// 检查 Docker Desktop 是否运行（Windows）
function checkDockerDesktop() {
  return new Promise((resolve) => {
    if (process.platform !== "win32") {
      resolve({ available: false, reason: "Not Windows" });
      return;
    }

    // 在 PowerShell 中使用 Get-Process 检查 Docker Desktop
    const dockerDesktop = spawn("powershell", ["-Command", "Get-Process -Name 'Docker Desktop' -ErrorAction SilentlyContinue | Select-Object -Property ProcessName"], {
      shell: true
    });

    let output = "";
    dockerDesktop.stdout.on("data", (data) => {
      output += data.toString();
    });

    dockerDesktop.stderr.on("data", (data) => {
      output += data.toString();
    });

    dockerDesktop.on("exit", (code) => {
      const isRunning = output.includes("Docker Desktop");
      resolve({ available: isRunning, output: output.trim() });
    });

    dockerDesktop.on("error", (err) => {
      resolve({ available: false, error: err.message });
    });
  });
}

// 检查 Docker Engine 是否可用
function checkDockerEngine() {
  return new Promise((resolve) => {
    const docker = spawn("docker", ["info"], {
      shell: process.platform === "win32"
    });

    let output = "";
    let errorOutput = "";

    docker.stdout.on("data", (data) => {
      output += data.toString();
    });

    docker.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    docker.on("exit", (code) => {
      const isConnected = code === 0 && !errorOutput.includes("error during connect");
      resolve({ available: isConnected, code, errorOutput });
    });

    docker.on("error", (err) => {
      resolve({ available: false, error: err.message });
    });
  });
}

// 检查 Docker 是否可用
function checkDocker() {
  return new Promise((resolve) => {
    const docker = spawn("docker", ["--version"], {
      shell: process.platform === "win32"
    });

    docker.on("exit", (code) => {
      resolve(code === 0);
    });

    docker.on("error", (err) => {
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

  const results = {};
  files.forEach((file) => {
    const fullPath = path.join(__dirname, "..", file);
    const exists = fs.existsSync(fullPath);
    results[file] = exists;
  });

  return results;
}

// 运行构建
async function runBuild() {
  const dockerCompose = spawn(
    "docker-compose",
    ["-f", "docker-compose.prod.yml", "build"],
    {
      cwd: path.join(__dirname, ".."),
      shell: process.platform === "win32",
      stdio: ["inherit", "pipe", "pipe"]
    }
  );

  dockerCompose.stdout.on("data", (data) => {
    const text = data.toString();
    process.stdout.write(text);
  });

  dockerCompose.stderr.on("data", (data) => {
    const text = data.toString();
    process.stderr.write(text);
  });

  dockerCompose.on("exit", (code) => {
    process.exit(code || 0);
  });

  dockerCompose.on("error", (err) => {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  });
}

// 主函数
async function main() {
  // 加载环境变量文件
  const loadedEnvVars = loadEnvFile();

  // 检查 Docker Desktop（Windows）
  const dockerDesktopStatus = await checkDockerDesktop();

  // 检查 Docker CLI
  const dockerAvailable = await checkDocker();
  if (!dockerAvailable) {
    console.error("Error: Docker CLI is not available");
    if (!dockerDesktopStatus.available) {
      console.error("Suggestion: Please start Docker Desktop and try again");
    }
    process.exit(1);
  }

  // 检查 Docker Engine 连接
  const dockerEngineStatus = await checkDockerEngine();
  if (!dockerEngineStatus.available) {
    console.error("Error: Cannot connect to Docker Engine");
    console.error("Suggestion: Please ensure Docker Desktop is running and try again");
    console.error(`Error details: ${dockerEngineStatus.errorOutput || dockerEngineStatus.error || 'Unknown error'}`);
    process.exit(1);
  }

  // 检查文件
  const fileCheck = checkFiles();
  const missingFiles = Object.entries(fileCheck)
    .filter(([_, exists]) => !exists)
    .map(([file]) => file);

  if (missingFiles.length > 0) {
    console.error(`Error: Missing files: ${missingFiles.join(", ")}`);
    process.exit(1);
  }

  // 运行构建
  await runBuild();
}

main().catch((err) => {
  console.error(`Fatal error: ${err.message}`);
  process.exit(1);
});