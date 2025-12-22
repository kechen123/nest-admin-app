const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const { exec } = require("child_process");
const fs = require("fs");
const { promisify } = require("util");

const execAsync = promisify(exec);

const sqlFile = path.join(__dirname, "init.sql");
const containerName = "myapp-mysql";
const dbName = process.env.DB_DATABASE || "myapp_db";
const dbUser = process.env.DB_USERNAME || "root";
const dbPassword = process.env.DB_PASSWORD || "root";

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

// 查询管理员用户名
async function queryAdminUsername() {
  const queryCommand = `docker exec ${containerName} mysql -u${dbUser} -p${dbPassword} ${dbName} -e "SELECT username FROM users WHERE role = 'super_admin' OR is_admin = 1 ORDER BY id LIMIT 1;" -N -s`;
  
  try {
    const { stdout } = await execAsync(queryCommand);
    const username = stdout.trim();
    return username || "admin";
  } catch (error) {
    // 如果查询失败，返回默认值
    return "admin";
  }
}

// 执行初始化
async function initDatabase() {
  try {
    console.log(`正在初始化数据库 ${dbName}...`);

    // 第一步：创建数据库
    const createDbCommand = `docker exec -i ${containerName} mysql -u${dbUser} -p${dbPassword}`;

    await new Promise((resolve, reject) => {
      const child = exec(createDbCommand, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`创建数据库失败: ${error.message}`));
          return;
        }
        if (stderr && !stderr.includes("Warning")) {
          console.warn(`警告: ${stderr}`);
        }
        resolve();
      });

      child.stdin.write(createDbSql);
      child.stdin.end();
    });

    // 第二步：执行初始化 SQL
    const initCommand = `docker exec -i ${containerName} mysql -u${dbUser} -p${dbPassword} ${dbName}`;

    // 移除 SQL 文件末尾的 SELECT 输出语句（如果存在）
    const sqlToExecute = sqlContent.replace(
      /-- ============================================\s*-- 9\. 初始化完成\s*-- ============================================\s*SELECT.*?;[\s\S]*$/,
      ""
    );

    await new Promise((resolve, reject) => {
      const child = exec(initCommand, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`执行初始化 SQL 失败: ${error.message}`));
          return;
        }
        if (stderr && !stderr.includes("Warning")) {
          console.warn(`警告: ${stderr}`);
        }
        resolve();
      });

      child.stdin.write(sqlToExecute);
      child.stdin.end();
    });

    // 第三步：查询并输出实际数据库信息
    const adminUsername = await queryAdminUsername();
    const defaultPassword = extractDefaultPassword(sqlContent);

    console.log("\n数据库初始化完成！");
    console.log("\n数据库信息:");
    console.log(`  数据库名: ${dbName}`);
    console.log(`  默认管理员账号: ${adminUsername}`);
    console.log(`  默认管理员密码: ${defaultPassword}`);
    console.log("\n⚠️  请在生产环境中修改默认密码！");
  } catch (error) {
    console.error(`错误: ${error.message}`);
    process.exit(1);
  }
}

initDatabase();
