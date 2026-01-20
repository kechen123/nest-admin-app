/**
 * 跨平台脚本运行器
 * 
 * 自动检测操作系统和 Docker 版本，运行合适的脚本
 * 支持 Windows、Linux (Ubuntu)、macOS
 * 
 * 用法: node scripts/run-cross-platform.js <脚本类型> [参数]
 * 例如: node scripts/run-cross-platform.js deploy web
 */

const { spawn, execSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const os = require("os");

/**
 * 检测操作系统信息
 */
function detectOS() {
  const platform = process.platform;
  const arch = os.arch();
  
  let osType = "unknown";
  let osVersion = "";
  let isWindows = false;
  let isLinux = false;
  let isMac = false;
  
  if (platform === "win32") {
    isWindows = true;
    osType = "windows";
    // 尝试获取 Windows 版本
    try {
      const version = execSync("ver", { encoding: "utf8" }).trim();
      osVersion = version;
    } catch (e) {
      osVersion = "Windows";
    }
  } else if (platform === "linux") {
    isLinux = true;
    osType = "linux";
    // 尝试检测 Linux 发行版
    try {
      if (fs.existsSync("/etc/os-release")) {
        const osRelease = fs.readFileSync("/etc/os-release", "utf8");
        const match = osRelease.match(/PRETTY_NAME="(.+)"/);
        if (match) {
          osVersion = match[1];
        } else if (osRelease.includes("Ubuntu")) {
          const ubuntuMatch = osRelease.match(/VERSION="(.+)"/);
          osVersion = `Ubuntu ${ubuntuMatch ? ubuntuMatch[1] : ""}`;
        } else if (osRelease.includes("Debian")) {
          osVersion = "Debian";
        } else if (osRelease.includes("CentOS")) {
          osVersion = "CentOS";
        } else {
          osVersion = "Linux";
        }
      } else {
        osVersion = "Linux";
      }
    } catch (e) {
      osVersion = "Linux";
    }
  } else if (platform === "darwin") {
    isMac = true;
    osType = "macos";
    try {
      const version = execSync("sw_vers -productVersion", { encoding: "utf8" }).trim();
      osVersion = `macOS ${version}`;
    } catch (e) {
      osVersion = "macOS";
    }
  }
  
  return {
    platform,
    arch,
    osType,
    osVersion,
    isWindows,
    isLinux,
    isMac,
  };
}

/**
 * 检测 Docker Compose 命令
 */
function detectDockerComposeCommand() {
  return new Promise((resolve) => {
    // 首先尝试新版本命令 (docker compose)
    const newCommand = spawn("docker", ["compose", "version"], {
      stdio: "pipe",
      shell: false,
    });

    newCommand.on("close", (code) => {
      if (code === 0) {
        resolve("docker compose");
        return;
      }

      // 如果新版本不可用，尝试旧版本命令 (docker-compose)
      const oldCommand = spawn("docker-compose", ["version"], {
        stdio: "pipe",
        shell: false,
      });

      oldCommand.on("close", (oldCode) => {
        if (oldCode === 0) {
          resolve("docker-compose");
          return;
        }

        resolve(null);
      });

      oldCommand.on("error", () => {
        resolve(null);
      });
    });

    newCommand.on("error", () => {
      const oldCommand = spawn("docker-compose", ["version"], {
        stdio: "pipe",
        shell: false,
      });

      oldCommand.on("close", (oldCode) => {
        if (oldCode === 0) {
          resolve("docker-compose");
          return;
        }
        resolve(null);
      });

      oldCommand.on("error", () => {
        resolve(null);
      });
    });
  });
}

/**
 * 运行脚本
 */
async function runScript(scriptType, args = []) {
  const osInfo = detectOS();
  const dockerCompose = await detectDockerComposeCommand();
  
  console.log("==========================================");
  console.log("系统信息:");
  console.log(`  操作系统: ${osInfo.osVersion} (${osInfo.platform})`);
  console.log(`  架构: ${osInfo.arch}`);
  if (dockerCompose) {
    console.log(`  Docker Compose: ${dockerCompose}`);
  } else {
    console.log(`  Docker Compose: 未安装`);
  }
  console.log("==========================================");
  
  const scriptDir = path.join(__dirname);
  let scriptPath = "";
  let command = "";
  
  switch (scriptType) {
    case "deploy":
    case "deploy:backend":
    case "deploy:web":
      const service = scriptType === "deploy" ? (args[0] || "all") : scriptType.split(":")[1];
      if (osInfo.isWindows) {
        scriptPath = path.join(scriptDir, "deploy.ps1");
        command = `powershell -ExecutionPolicy Bypass -File "${scriptPath}" ${service}`;
      } else {
        scriptPath = path.join(scriptDir, "deploy.sh");
        command = `bash "${scriptPath}" ${service}`;
      }
      break;
      
    case "export:images":
      if (osInfo.isWindows) {
        scriptPath = path.join(scriptDir, "export-images.ps1");
        command = `powershell -ExecutionPolicy Bypass -File "${scriptPath}"`;
      } else {
        scriptPath = path.join(scriptDir, "export-images.sh");
        command = `bash "${scriptPath}"`;
      }
      break;
      
    case "quick-start":
      if (osInfo.isWindows) {
        scriptPath = path.join(scriptDir, "quick-start.ps1");
        command = `powershell -ExecutionPolicy Bypass -File "${scriptPath}"`;
      } else {
        scriptPath = path.join(scriptDir, "quick-start.sh");
        command = `bash "${scriptPath}"`;
      }
      break;
      
    case "reset":
      if (osInfo.isWindows) {
        scriptPath = path.join(scriptDir, "reset-dev.ps1");
        command = `powershell -ExecutionPolicy Bypass -File "${scriptPath}"`;
      } else {
        scriptPath = path.join(scriptDir, "reset-dev.sh");
        command = `bash "${scriptPath}"`;
      }
      break;
      
    default:
      console.error(`未知的脚本类型: ${scriptType}`);
      console.error("支持的脚本类型: deploy, deploy:backend, deploy:web, export:images, quick-start, reset");
      process.exit(1);
  }
  
  if (!fs.existsSync(scriptPath)) {
    console.error(`脚本文件不存在: ${scriptPath}`);
    process.exit(1);
  }
  
  console.log(`执行命令: ${command}`);
  console.log("==========================================");
  
  const isWindows = osInfo.isWindows;
  const child = spawn(command, [], {
    stdio: "inherit",
    shell: true,
    env: process.env,
  });
  
  child.on("error", (error) => {
    console.error(`执行失败: ${error.message}`);
    process.exit(1);
  });
  
  child.on("exit", (code) => {
    process.exit(code || 0);
  });
}

// 获取命令行参数
const [, , scriptType, ...args] = process.argv;

if (!scriptType) {
  console.error("用法: node scripts/run-cross-platform.js <脚本类型> [参数]");
  console.error("支持的脚本类型:");
  console.error("  deploy [all|backend|web]  - 部署服务");
  console.error("  deploy:backend            - 部署后端");
  console.error("  deploy:web                - 部署前端");
  console.error("  export:images             - 导出镜像");
  console.error("  quick-start               - 快速启动");
  console.error("  reset                     - 重置开发环境");
  process.exit(1);
}

runScript(scriptType, args);
