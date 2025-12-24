/**
 * 修复 MySQL 外部连接访问权限
 * 用于在数据库已初始化后，允许 root 用户从外部连接
 * 
 * 使用方法：
 * node database/fix-external-access.js
 * 或
 * docker exec -it yl-mysql-dev mysql -uroot -proot < database/fix-external-access.sql
 */

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const { exec, spawn } = require("child_process");
const { promisify } = require("util");
const fs = require("fs");

const execAsync = promisify(exec);

const containerName = process.env.MYSQL_CONTAINER_NAME || "yl-mysql-dev";
const dbPassword = process.env.DB_PASSWORD || "root";
const mysqlHost = process.env.DB_HOST === "mysql" ? "mysql" : "localhost";
const mysqlPort = process.env.DB_PORT || "3306";

// 检测是否在 Docker 容器内运行
const isInDocker = process.env.DB_HOST === "mysql" || 
                    process.env.DB_HOST === "yl-mysql-dev" ||
                    (process.env.NODE_ENV === "development" && process.env.DB_HOST && process.env.DB_HOST !== "localhost");

async function fixExternalAccess() {
  try {
    console.log("正在修复 MySQL 外部连接权限...");
    
    const sqlCommands = `-- 创建允许从任何主机连接的 root 用户
CREATE USER IF NOT EXISTS 'root'@'%' IDENTIFIED WITH mysql_native_password BY '${dbPassword}';

-- 授予所有权限
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;

-- 刷新权限
FLUSH PRIVILEGES;

-- 显示当前用户权限（验证）
SELECT User, Host FROM mysql.user WHERE User = 'root';
`;

    // 将 SQL 写入临时文件
    const tempSqlFile = path.join("/tmp", `fix_external_access_${Date.now()}.sql`);
    fs.writeFileSync(tempSqlFile, sqlCommands, "utf8");

    let stdout = "";
    let stderr = "";

    if (isInDocker) {
      // 在容器内，使用 spawn 和管道传递文件内容
      await new Promise((resolve, reject) => {
        const readStream = fs.createReadStream(tempSqlFile);
        const mysqlProcess = spawn("mysql", [
          `--skip-ssl`,
          `-h${mysqlHost}`,
          `-P${mysqlPort}`,
          `-uroot`,
          `-p${dbPassword}`
        ], {
          stdio: ["pipe", "pipe", "pipe"]
        });

        readStream.pipe(mysqlProcess.stdin);

        mysqlProcess.stdout.on("data", (data) => {
          stdout += data.toString();
        });

        mysqlProcess.stderr.on("data", (data) => {
          const output = data.toString();
          stderr += output;
          if (!output.includes("Warning") && !output.includes("Deprecated")) {
            console.warn(`警告: ${output.trim()}`);
          }
        });

        mysqlProcess.on("close", (code) => {
          try {
            fs.unlinkSync(tempSqlFile);
          } catch (e) {}
          if (code !== 0) {
            reject(new Error(`执行失败，退出码: ${code}`));
          } else {
            resolve();
          }
        });

        mysqlProcess.on("error", (error) => {
          try {
            fs.unlinkSync(tempSqlFile);
          } catch (e) {}
          reject(error);
        });
      });
    } else {
      // 在容器外，使用 docker exec 和 stdin 输入
      await new Promise((resolve, reject) => {
        const child = exec(`docker exec -i ${containerName} mysql --skip-ssl -uroot -p${dbPassword}`, (error, stdoutData, stderrData) => {
          try {
            fs.unlinkSync(tempSqlFile);
          } catch (e) {}
          if (error) {
            reject(error);
            return;
          }
          stdout = stdoutData;
          stderr = stderrData;
          resolve();
        });

        const readStream = fs.createReadStream(tempSqlFile);
        readStream.pipe(child.stdin);
      });
    }

    console.log("\n✅ MySQL 外部连接权限修复完成！");
    console.log("\n现在可以使用以下信息连接 MySQL：");
    console.log(`  主机: localhost`);
    console.log(`  端口: 3306`);
    console.log(`  用户名: root`);
    console.log(`  密码: ${dbPassword}`);
    
    if (stdout) {
      console.log("\n当前 root 用户权限：");
      console.log(stdout);
    }
  } catch (error) {
    console.error(`❌ 修复失败: ${error.message}`);
    console.error("\n请手动执行以下 SQL 命令：");
    console.log(`
CREATE USER IF NOT EXISTS 'root'@'%' IDENTIFIED WITH mysql_native_password BY '${dbPassword}';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;
    `);
    process.exit(1);
  }
}

fixExternalAccess();

