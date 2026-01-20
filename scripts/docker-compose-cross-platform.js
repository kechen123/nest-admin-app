/**
 * 跨平台 Docker Compose 命令适配器
 *
 * 自动检测系统并使用正确的 Docker Compose 命令：
 * - Linux/macOS (Ubuntu): docker compose (新版本，无连字符)
 * - Windows: docker-compose (旧版本，有连字符)
 *
 * 如果新版本命令不可用，会回退到旧版本命令
 *
 * 用法: node scripts/docker-compose-cross-platform.js <docker-compose 参数>
 * 例如: node scripts/docker-compose-cross-platform.js -f docker-compose.dev.yml run --rm backend npm run db:init
 */

const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

/**
 * 检测系统中可用的 Docker Compose 命令
 * @returns {string} 可用的命令名称
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
        console.log("✓ 检测到新版本 Docker Compose (docker compose)");
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
          console.log("✓ 检测到旧版本 Docker Compose (docker-compose)");
          resolve("docker-compose");
          return;
        }

        console.error("❌ 未找到可用的 Docker Compose 命令");
        console.error("请确保已安装 Docker 和 Docker Compose:");
        console.error("- Ubuntu/Debian: sudo apt update && sudo apt install docker.io docker-compose-plugin");
        console.error("- CentOS/RHEL: sudo yum install docker docker-compose");
        console.error("- Windows: 安装 Docker Desktop");
        process.exit(1);
      });
    });

    newCommand.on("error", () => {
      // 继续尝试旧版本
      const oldCommand = spawn("docker-compose", ["version"], {
        stdio: "pipe",
        shell: false,
      });

      oldCommand.on("close", (oldCode) => {
        if (oldCode === 0) {
          console.log("✓ 检测到旧版本 Docker Compose (docker-compose)");
          resolve("docker-compose");
          return;
        }

        console.error("❌ 未找到可用的 Docker Compose 命令");
        console.error("请确保已安装 Docker 和 Docker Compose");
        process.exit(1);
      });
    });
  });
}

/**
 * 执行 Docker Compose 命令
 * @param {string[]} args - 命令参数
 */
async function runDockerCompose(args) {
  const command = await detectDockerComposeCommand();

  console.log(`执行命令: ${command} ${args.join(" ")}`);

  const isWindows = process.platform === "win32";
  const shell = isWindows;

  // 如果是新版本命令，需要将参数传递给 docker compose
  const finalArgs = command === "docker compose" ? ["compose", ...args] : args;

  const child = spawn("docker", finalArgs, {
    stdio: "inherit",
    shell: shell,
    env: process.env,
  });

  child.on("error", (error) => {
    console.error(`执行命令失败: ${error.message}`);
    process.exit(1);
  });

  child.on("exit", (code) => {
    process.exit(code || 0);
  });
}

// 获取命令行参数
const [, , ...args] = process.argv;

if (args.length === 0) {
  console.error("用法: node scripts/docker-compose-cross-platform.js <docker-compose 参数>");
  console.error("例如: node scripts/docker-compose-cross-platform.js -f docker-compose.dev.yml run --rm backend npm run db:init");
  process.exit(1);
}

runDockerCompose(args);