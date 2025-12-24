/**
 * 数据库初始化脚本
 * 
 * 功能：
 * 1. 自动检测运行环境（Docker 容器内 或 本地环境）
 * 2. 从 backend/.env 文件读取配置
 * 3. 创建数据库
 * 4. 执行初始化 SQL
 * 5. 配置 MySQL 外部连接权限
 * 6. 显示数据库连接信息
 * 
 * 支持的运行模式：
 * - 模式一：Docker 容器内运行（所有服务在 Docker 中）
 *   - 使用 Docker 服务名 "mysql" 连接数据库
 *   - 通过 spawn 直接执行 mysql 命令
 *   - 执行命令：npm run backend:init-db
 * 
 * - 模式二：本地运行（后端在本地，MySQL 在 Docker 中）
 *   - 使用 localhost 连接数据库
 *   - 通过 docker exec 执行 MySQL 命令
 *   - 执行命令：cd backend && npm run db:init
 * 
 * 配置来源：
 * - 优先级：系统环境变量 > .env 文件 > 默认值
 * - 配置文件：backend/.env
 * 
 * 兼容性：
 * - MySQL 8.0+（使用 --ssl-mode=DISABLED）
 * - Windows、Linux、Mac 跨平台支持
 * - Windows PowerShell 完全支持
 */

const path = require("path");
const { exec, spawn } = require("child_process");
const fs = require("fs");
const { promisify } = require("util");
const os = require("os");

// ============================================================================
// 配置加载
// ============================================================================

// 读取 .env 文件（如果存在）
// 优先级：系统环境变量（docker-compose env_file） > .env 文件 > 默认值
// 在 Docker 容器中，.env 文件挂载在 /app/.env
// 在本地，.env 文件在 backend/.env
const envPath = path.join(__dirname, "..", ".env");
if (fs.existsSync(envPath)) {
  // 先读取 .env 文件，然后环境变量会覆盖（如果存在）
  // 这样确保即使 docker-compose env_file 没有正确加载，也能从文件读取
  require("dotenv").config({ path: envPath, override: false });
  console.log(`✅ 已从文件加载配置: ${envPath}`);
} else {
  console.warn(`⚠️  警告: 未找到 .env 文件: ${envPath}`);
  console.warn(`   将使用环境变量或默认值`);
}

const execAsync = promisify(exec);

// ============================================================================
// 系统配置
// ============================================================================

// 检测操作系统，Windows 上不使用 shell，让 Node.js 使用默认的 cmd.exe
const isWindows = process.platform === 'win32';
const shellOption = isWindows ? undefined : '/bin/sh';

const sqlFile = path.join(__dirname, "init.sql");
// Docker 容器名称（根据 docker-compose 配置）
const containerName = process.env.MYSQL_CONTAINER_NAME || "yl-mysql-dev";

// ============================================================================
// 数据库配置（从环境变量或 .env 文件读取）
// ============================================================================

// 读取配置：优先级为 环境变量 > .env 文件 > 默认值
// docker-compose 的 env_file 会在容器启动时设置环境变量，所以这里会优先使用
// 但如果环境变量不存在，dotenv 已经加载了 .env 文件，所以可以直接使用
// 注意：在本地运行时，环境变量可能不存在，所以会从 .env 文件读取
const dbName = process.env.DB_DATABASE || "myapp_db";
const dbUser = process.env.DB_USERNAME || "root";
const dbPassword = process.env.DB_PASSWORD || "root";
const dbPort = process.env.DB_PORT || "3306";
const dbHost = process.env.DB_HOST || "localhost";

// ============================================================================
// 运行环境检测
// ============================================================================

// 检测是否在 Docker 容器内运行
// 方法1: 检查是否存在 /.dockerenv 文件（Docker 容器的标志文件，最可靠）
// 方法2: 检查 DB_HOST 是否为 "mysql"（Docker 服务名）
// 方法3: 检查是否有 Docker 相关的环境变量
const hasDockerenv = fs.existsSync("/.dockerenv");
const dbHostIsMysql = process.env.DB_HOST === "mysql";
const dbHostIsContainer = process.env.DB_HOST === "yl-mysql-dev";
const isInDocker = hasDockerenv ||
                    dbHostIsMysql || 
                    dbHostIsContainer ||
                    (process.env.NODE_ENV === "development" && process.env.DB_HOST && process.env.DB_HOST !== "localhost");

// 根据运行环境确定 MySQL 主机
// 在 Docker 容器内，使用服务名 "mysql"；在本地，使用 .env 中的 DB_HOST
const mysqlHost = isInDocker ? "mysql" : dbHost;
const mysqlPort = dbPort;

// ============================================================================
// SQL 文件处理
// ============================================================================

// 读取 SQL 文件
const sqlContent = fs.readFileSync(sqlFile, "utf8");

// 从 SQL 文件中提取默认密码（从注释中）
function extractDefaultPassword(sqlContent) {
  // 匹配格式: -- 密码: admin123 (请在生产环境中修改)
  const match = sqlContent.match(/密码:\s*([^\s(]+)/);
  return match ? match[1].trim() : "admin123";
}

// 创建数据库的 SQL 命令
const createDbSql = `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`;

// ============================================================================
// 辅助函数
// ============================================================================

// 查询管理员用户名
async function queryAdminUsername() {
  let queryCommand;
  if (isInDocker) {
    // 在容器内，直接使用 mysql 命令
    // 使用 --ssl-mode=DISABLED 禁用 SSL（MySQL 8.0+ 兼容）
    queryCommand = `mysql --ssl-mode=DISABLED -h${mysqlHost} -P${mysqlPort} -u${dbUser} -p${dbPassword} ${dbName} -e "SELECT username FROM users WHERE role = 'super_admin' OR is_admin = 1 ORDER BY id LIMIT 1;" -N -s`;
  } else {
    // 在容器外，使用 docker exec
    queryCommand = `docker exec ${containerName} mysql --ssl-mode=DISABLED -u${dbUser} -p${dbPassword} ${dbName} -e "SELECT username FROM users WHERE role = 'super_admin' OR is_admin = 1 ORDER BY id LIMIT 1;" -N -s`;
  }
  
  try {
    const { stdout } = await execAsync(queryCommand);
    const username = stdout.trim();
    return username || "admin";
  } catch (error) {
    // 如果查询失败，返回默认值
    return "admin";
  }
}

// ============================================================================
// 主函数：数据库初始化
// ============================================================================

/**
 * 执行数据库初始化
 * 
 * 步骤：
 * 1. 显示配置信息
 * 2. 创建数据库
 * 3. 执行初始化 SQL
 * 4. 配置 MySQL 外部连接权限（开发环境）
 * 5. 查询并显示数据库信息
 */
async function initDatabase() {
  // 在函数开始处声明临时目录，整个函数内复用
  const tempDir = os.tmpdir();
  
  try {
    // 显示实际使用的配置（用于调试和验证）
    console.log(`正在初始化数据库 ${dbName}...`);
    console.log(`配置信息:`);
    console.log(`  数据库名: ${dbName}`);
    console.log(`  用户名: ${dbUser}`);
    console.log(`  密码: ${dbPassword ? '***' : '未设置'} (长度: ${dbPassword ? dbPassword.length : 0})`);
    console.log(`  主机: ${mysqlHost} (DB_HOST=${dbHost})`);
    console.log(`  端口: ${mysqlPort} (DB_PORT=${dbPort})`);
    console.log(`  运行环境: ${isInDocker ? 'Docker 容器内' : '本地环境'}`);
    console.log(`  容器名: ${containerName}`);
    console.log(`\n提示: 如果密码验证失败，请确保 MySQL 容器的 MYSQL_ROOT_PASSWORD 与 backend/.env 中的 DB_PASSWORD 一致`);
    if (isInDocker) {
      console.log(`检测到 Docker 环境，使用 MySQL 服务: ${mysqlHost}:${mysqlPort}`);
    } else {
      console.log(`检测到本地环境，使用 MySQL 容器: ${containerName}`);
    }

    // 第一步：创建数据库
    // 使用临时文件方式执行 SQL，避免引号转义问题（跨平台兼容）
    const tempCreateDbFile = path.join(tempDir, `create_db_${Date.now()}.sql`);
    fs.writeFileSync(tempCreateDbFile, createDbSql, "utf8");
    
    let createDbCommand;
    if (isInDocker) {
      // 在容器内，使用文件方式执行
      createDbCommand = `mysql --ssl-mode=DISABLED -h${mysqlHost} -P${mysqlPort} -u${dbUser} -p${dbPassword} < ${tempCreateDbFile}`;
    } else {
      // 在容器外，使用 docker exec 和文件方式执行
      // 将文件复制到容器内，或直接通过 stdin 传递
      createDbCommand = `docker exec -i ${containerName} mysql --ssl-mode=DISABLED -u${dbUser} -p${dbPassword} < ${tempCreateDbFile}`;
    }

    try {
      // 使用文件输入方式，更可靠
      const readStream = fs.createReadStream(tempCreateDbFile);
      
      if (isInDocker) {
        // 在容器内使用 spawn
        const commandParts = [
          "mysql",
          "--ssl-mode=DISABLED",
          `-h${mysqlHost}`,
          `-P${mysqlPort}`,
          `-u${dbUser}`,
          `-p${dbPassword}`
        ];
        
        await new Promise((resolve, reject) => {
          const mysqlProcess = spawn(commandParts[0], commandParts.slice(1), {
            stdio: ["pipe", "pipe", "pipe"]
          });
          
          readStream.pipe(mysqlProcess.stdin);
          
          let stderrOutput = "";
          mysqlProcess.stderr.on("data", (data) => {
            const output = data.toString();
            stderrOutput += output;
            if (!output.includes("Warning") && !output.includes("Using a password")) {
              console.warn(`警告: ${output.trim()}`);
            }
          });
          
          mysqlProcess.on("close", (code) => {
            // 清理临时文件
            try {
              fs.unlinkSync(tempCreateDbFile);
            } catch (e) {}
            
            if (code !== 0) {
              reject(new Error(`创建数据库失败，退出码: ${code}${stderrOutput ? `\n${stderrOutput}` : ""}`));
            } else {
              resolve();
            }
          });
          
          mysqlProcess.on("error", (error) => {
            try {
              fs.unlinkSync(tempCreateDbFile);
            } catch (e) {}
            reject(error);
          });
        });
        
        console.log(`✅ 数据库 ${dbName} 创建成功`);
      } else {
        // 在容器外，使用 docker exec 并通过 stdin 传递
        await new Promise((resolve, reject) => {
          const child = exec(`docker exec -i ${containerName} mysql --ssl-mode=DISABLED -u${dbUser} -p${dbPassword}`, {
            shell: shellOption
          }, (error, stdout, stderr) => {
            // 清理临时文件
            try {
              fs.unlinkSync(tempCreateDbFile);
            } catch (e) {}
            
            if (error) {
              // 将错误信息附加到 error 对象
              error.stdout = stdout;
              error.stderr = stderr;
              reject(error);
              return;
            }
            if (stderr && !stderr.includes("Warning") && !stderr.includes("Using a password")) {
              console.warn(`警告: ${stderr}`);
            }
            resolve();
          });
          
          readStream.pipe(child.stdin);
        });
        
        console.log(`✅ 数据库 ${dbName} 创建成功`);
      }
    } catch (error) {
      // 清理临时文件
      try {
        fs.unlinkSync(tempCreateDbFile);
      } catch (e) {}
      
      // 显示完整的错误信息用于调试
      const errorOutput = (error.stderr || error.stdout || error.message || '').toString();
      console.error(`\n执行命令失败`);
      if (error.stdout) {
        console.error(`标准输出: ${error.stdout}`);
      }
      if (error.stderr) {
        console.error(`错误输出: ${error.stderr}`);
      }
      // 检查是否是 mysql 命令找不到的错误
      if (errorOutput.includes("not found") || errorOutput.includes("command not found") || errorOutput.includes("不是内部或外部命令")) {
        if (isInDocker) {
          throw new Error(`mysql 命令未找到。请确保 Dockerfile.dev 中已安装 mysql-client: RUN apk add --no-cache mysql-client\n原始错误: ${errorOutput}`);
        } else {
          throw new Error(`mysql 命令未找到。请确保已安装 MySQL 客户端工具。\n原始错误: ${errorOutput}`);
        }
      }
      // 检查是否是认证失败的错误
      if (errorOutput.includes("Access denied") || errorOutput.includes("1045") || errorOutput.includes("ERROR 1045")) {
        console.error(`\n❌ 数据库认证失败！`);
        console.error(`\n问题原因：`);
        if (isInDocker) {
          console.error(`  MySQL 容器的 root 密码与 backend/.env 中的 DB_PASSWORD 不一致。`);
          console.error(`  MySQL 容器的密码是在首次启动时设置的，后续修改 .env 文件不会自动更新密码。`);
        } else {
          console.error(`  MySQL 容器的 root 密码与 backend/.env 中的 DB_PASSWORD 不一致。`);
          console.error(`  请确保 backend/.env 文件中的 DB_PASSWORD 与 MySQL 容器启动时使用的密码一致。`);
        }
        console.error(`\n当前配置（从 backend/.env 读取）：`);
        console.error(`  数据库名: ${dbName}`);
        console.error(`  用户名: ${dbUser}`);
        console.error(`  密码: ${dbPassword ? '***' : '未设置'} (长度: ${dbPassword ? dbPassword.length : 0})`);
        console.error(`  主机: ${mysqlHost}`);
        console.error(`  端口: ${mysqlPort}`);
        console.error(`  容器名: ${containerName}`);
        
        // 尝试使用默认密码 root 连接，以检测实际的密码
        if (!isInDocker) {
          // 在本地环境，尝试使用默认密码测试
          try {
            const testCommand = `docker exec ${containerName} mysql --ssl-mode=DISABLED -uroot -proot -e "SELECT 1;" 2>&1`;
            const { stdout: testStdout, stderr: testStderr } = await execAsync(testCommand, { shell: shellOption });
            if (testStdout && testStdout.includes('1')) {
              console.error(`\n🔍 检测结果：`);
              console.error(`  MySQL 容器的实际密码是: root`);
              console.error(`  但 backend/.env 中配置的密码是: ${dbPassword.length} 个字符的密码`);
              console.error(`\n💡 快速解决方案（选择其一）：`);
              console.error(`\n  方案 1: 修改 backend/.env 文件使用当前密码（快速）`);
              console.error(`    将 backend/.env 中的 DB_PASSWORD 改为: root`);
              console.error(`    然后重新运行: cd backend && npm run db:init`);
              console.error(`\n  方案 2: 删除数据卷并重新初始化（推荐，使用新密码）`);
              console.error(`    在项目根目录运行:`);
              console.error(`    npm run mysql:stop`);
              console.error(`    docker volume rm yl_mysql_data`);
              console.error(`    npm run mysql:start`);
              console.error(`    等待 MySQL 启动后，在 backend 目录运行: npm run db:init`);
            } else {
              console.error(`\n💡 解决方案：`);
              console.error(`  1. 检查 backend/.env 文件中的 DB_PASSWORD 是否与 MySQL 容器启动时使用的密码一致`);
              console.error(`  2. 如果忘记密码，删除数据卷并重新初始化：`);
              console.error(`     在项目根目录运行:`);
              console.error(`     npm run mysql:stop`);
              console.error(`     docker volume rm yl_mysql_data`);
              console.error(`     npm run mysql:start`);
              console.error(`     等待 MySQL 启动后，在 backend 目录运行: npm run db:init`);
            }
          } catch (testError) {
            // 默认密码也失败，说明密码不是 root
            console.error(`\n💡 解决方案：`);
            console.error(`  1. 检查 backend/.env 文件中的配置：`);
            console.error(`     DB_PASSWORD=${dbPassword ? '***' : '未设置'}`);
            console.error(`     DB_PORT=${mysqlPort}`);
            console.error(`     DB_DATABASE=${dbName}`);
            console.error(`  2. 确保 MySQL 容器已启动：`);
            console.error(`     在项目根目录运行: npm run mysql:start`);
            console.error(`  3. 如果密码不匹配，删除数据卷并重新初始化：`);
            console.error(`     在项目根目录运行:`);
            console.error(`     npm run mysql:stop`);
            console.error(`     docker volume rm yl_mysql_data`);
            console.error(`     npm run mysql:start`);
            console.error(`     等待 MySQL 启动后，在 backend 目录运行: npm run db:init`);
          }
        } else {
          // Docker 容器内的错误处理
          try {
            const testCommand = `mysql --ssl-mode=DISABLED -h${mysqlHost} -P${mysqlPort} -uroot -proot -e "SELECT 1;" 2>&1`;
            const { stdout: testStdout } = await execAsync(testCommand, { shell: shellOption });
            if (testStdout && testStdout.includes('1')) {
              console.error(`\n🔍 检测结果：`);
              console.error(`  MySQL 容器的实际密码是: root`);
              console.error(`  但配置的密码是: ${dbPassword.length} 个字符的密码`);
              console.error(`\n💡 快速解决方案（选择其一）：`);
              console.error(`\n  方案 1: 删除数据卷并重新初始化（推荐，使用新密码）`);
              console.error(`    npm run reset`);
              console.error(`    npm run dev:up`);
              console.error(`    npm run backend:init-db`);
              console.error(`\n  方案 2: 修改 .env 文件使用当前密码（快速，但使用默认密码）`);
              console.error(`    将 backend/.env 中的 DB_PASSWORD 改为: root`);
              console.error(`    然后重新运行: npm run backend:init-db`);
            }
          } catch (testError) {
            // 默认密码也失败，说明密码不是 root
            console.error(`\n💡 解决方案：`);
            console.error(`  1. 删除 MySQL 数据卷并重新初始化（推荐）：`);
            console.error(`     npm run reset`);
            console.error(`     npm run dev:up`);
            console.error(`     npm run backend:init-db`);
            console.error(`\n  2. 或者手动重置 MySQL 数据卷：`);
            console.error(`     npm run dev:down`);
            console.error(`     docker volume rm yl_mysql_data`);
            console.error(`     npm run dev:up`);
            console.error(`     npm run backend:init-db`);
            console.error(`\n  3. 或者将 backend/.env 中的 DB_PASSWORD 改回 MySQL 容器首次启动时使用的密码`);
          }
        }
        
        throw new Error(`数据库认证失败: MySQL 容器的 root 密码与配置的密码不匹配。请按照上述解决方案操作。`);
      }
      // 如果数据库已存在，忽略错误
      const errorMsg = errorOutput || error.message || '';
      if (!errorMsg.includes("already exists") && !errorMsg.includes("database exists") && !errorMsg.includes("1007")) {
        console.error(`\n❌ 创建数据库失败！`);
        console.error(`\n完整错误信息:`);
        console.error(errorOutput || error.message);
        throw new Error(`创建数据库失败。请检查上述错误信息。`);
      } else if (errorMsg.includes("already exists") || errorMsg.includes("database exists") || errorMsg.includes("1007")) {
        console.log(`数据库 ${dbName} 已存在，跳过创建步骤`);
      }
    }

    // 第二步：执行初始化 SQL
    // 移除 SQL 文件末尾的 SELECT 输出语句（如果存在）
    const sqlToExecute = sqlContent.replace(
      /-- ============================================\s*-- 9\. 初始化完成\s*-- ============================================\s*SELECT.*?;[\s\S]*$/,
      ""
    );

    // 将 SQL 写入临时文件，然后通过文件执行
    // 使用系统临时目录，兼容 Windows 和 Linux/Mac
    const tempSqlFile = path.join(tempDir, `temp_init_${Date.now()}.sql`);
    fs.writeFileSync(tempSqlFile, sqlToExecute, "utf8");

    // 执行 SQL 文件
    if (isInDocker) {
      // 在容器内，使用 spawn 和管道传递文件内容
      const readStream = fs.createReadStream(tempSqlFile);
      
      await new Promise((resolve, reject) => {
        const mysqlProcess = spawn("mysql", [
          `--ssl-mode=DISABLED`,
          `-h${mysqlHost}`,
          `-P${mysqlPort}`,
          `-u${dbUser}`,
          `-p${dbPassword}`,
          dbName
        ], {
          stdio: ["pipe", "pipe", "pipe"]
        });

        readStream.pipe(mysqlProcess.stdin);

        let stderrOutput = "";
        mysqlProcess.stderr.on("data", (data) => {
          const output = data.toString();
          stderrOutput += output;
          // 只显示非警告的错误
          if (!output.includes("Warning")) {
            console.warn(`警告: ${output.trim()}`);
          }
        });

        mysqlProcess.on("close", (code) => {
          // 清理临时文件
          try {
            fs.unlinkSync(tempSqlFile);
          } catch (e) {}

          if (code !== 0) {
            reject(new Error(`执行初始化 SQL 失败，退出码: ${code}${stderrOutput ? `\n${stderrOutput}` : ""}`));
          } else {
            resolve();
          }
        });

        mysqlProcess.on("error", (error) => {
          try {
            fs.unlinkSync(tempSqlFile);
          } catch (e) {}
          reject(new Error(`执行初始化 SQL 失败: ${error.message}`));
        });
      });
    } else {
      // 在容器外，使用 exec 和 stdin 输入
      await new Promise((resolve, reject) => {
        const child = exec(`docker exec -i ${containerName} mysql --ssl-mode=DISABLED -u${dbUser} -p${dbPassword} ${dbName}`, (error, stdout, stderr) => {
          // 清理临时文件
          try {
            fs.unlinkSync(tempSqlFile);
          } catch (e) {}

          if (error) {
            reject(new Error(`执行初始化 SQL 失败: ${error.message}`));
            return;
          }
          if (stderr && !stderr.includes("Warning")) {
            console.warn(`警告: ${stderr}`);
          }
          resolve();
        });

        // 通过 stdin 写入 SQL 内容
        const readStream = fs.createReadStream(tempSqlFile);
        readStream.pipe(child.stdin);
      });
    }

    // 第三步：配置 MySQL 外部连接权限（开发环境）
    if (isInDocker || process.env.NODE_ENV === "development") {
      console.log("\n正在配置 MySQL 外部连接权限...");
      try {
        const fixAccessSql = `
CREATE USER IF NOT EXISTS 'root'@'%' IDENTIFIED WITH mysql_native_password BY '${dbPassword}';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;
`;
        
        // 使用系统临时目录，兼容 Windows 和 Linux/Mac
        const tempFixFile = path.join(tempDir, `fix_access_${Date.now()}.sql`);
        fs.writeFileSync(tempFixFile, fixAccessSql, "utf8");

        if (isInDocker) {
          await new Promise((resolve, reject) => {
            const readStream = fs.createReadStream(tempFixFile);
            const mysqlProcess = spawn("mysql", [
              `--ssl-mode=DISABLED`,
              `-h${mysqlHost}`,
              `-P${mysqlPort}`,
              `-u${dbUser}`,
              `-p${dbPassword}`
            ], {
              stdio: ["pipe", "pipe", "pipe"]
            });

            readStream.pipe(mysqlProcess.stdin);

            let stderrOutput = "";
            mysqlProcess.stderr.on("data", (data) => {
              const output = data.toString();
              stderrOutput += output;
              if (!output.includes("Warning") && !output.includes("Deprecated")) {
                console.warn(`警告: ${output.trim()}`);
              }
            });

            mysqlProcess.on("close", (code) => {
              try {
                fs.unlinkSync(tempFixFile);
              } catch (e) {}
              if (code !== 0) {
                reject(new Error(`配置外部连接权限失败，退出码: ${code}${stderrOutput ? `\n${stderrOutput}` : ""}`));
              } else {
                resolve();
              }
            });

            mysqlProcess.on("error", (error) => {
              try {
                fs.unlinkSync(tempFixFile);
              } catch (e) {}
              reject(error);
            });
          });
        } else {
          await new Promise((resolve, reject) => {
            const child = exec(`docker exec -i ${containerName} mysql --ssl-mode=DISABLED -u${dbUser} -p${dbPassword}`, (error, stdout, stderr) => {
              try {
                fs.unlinkSync(tempFixFile);
              } catch (e) {}
              if (error) {
                reject(error);
                return;
              }
              if (stderr && !stderr.includes("Warning") && !stderr.includes("Deprecated")) {
                console.warn(`警告: ${stderr}`);
              }
              resolve();
            });

            const readStream = fs.createReadStream(tempFixFile);
            readStream.pipe(child.stdin);
          });
        }
        console.log("✅ MySQL 外部连接权限配置完成");
      } catch (error) {
        console.warn(`⚠️  配置外部连接权限失败: ${error.message}`);
        console.warn("   可以稍后手动执行: npm run mysql:fix-access");
      }
    }

    // 第四步：查询并输出实际数据库信息
    const adminUsername = await queryAdminUsername();
    const defaultPassword = extractDefaultPassword(sqlContent);

    console.log("\n数据库初始化完成！");
    console.log("\n数据库信息:");
    console.log(`  数据库名: ${dbName}`);
    console.log(`  默认管理员账号: ${adminUsername}`);
    console.log(`  默认管理员密码: ${defaultPassword}`);
    if (isInDocker || process.env.NODE_ENV === "development") {
      console.log(`\nMySQL 外部连接信息:`);
      console.log(`  主机: ${isInDocker ? 'localhost' : mysqlHost}`);
      console.log(`  端口: ${mysqlPort}`);
      console.log(`  用户名: ${dbUser}`);
      console.log(`  密码: ${dbPassword}`);
    }
    console.log("\n⚠️  请在生产环境中修改默认密码！");
  } catch (error) {
    console.error(`错误: ${error.message}`);
    process.exit(1);
  }
}

initDatabase();
