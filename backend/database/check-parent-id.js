const mysql = require("mysql2/promise");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USERNAME || "root",
  password: process.env.DB_PASSWORD || "root",
  database: process.env.DB_DATABASE || "myapp_db",
};

async function checkParentIds() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    // 查询所有 parent_id 值
    const [rows] = await connection.query("SELECT id, parent_id, name, code FROM permissions ORDER BY id");

    // 检查无效的 parent_id 值
    const invalidParentIds = [];
    const validIds = new Set(rows.map((r) => r.id));

    rows.forEach((row) => {
      if (row.parent_id !== null && row.parent_id !== 0 && !validIds.has(row.parent_id)) {
        invalidParentIds.push({ id: row.id, parent_id: row.parent_id, name: row.name });
      }
      if (row.parent_id === 0) {
        invalidParentIds.push({ id: row.id, parent_id: row.parent_id, name: row.name, issue: "parent_id为0，不符合外键约束" });
      }
    });

    console.log("检查结果:");
    console.log(`总记录数: ${rows.length}`);
    console.log(`无效的 parent_id 记录数: ${invalidParentIds.length}`);

    if (invalidParentIds.length > 0) {
      console.log("\n无效的记录:");
      invalidParentIds.forEach((row) => {
        console.log(`  ID: ${row.id}, parent_id: ${row.parent_id}, 名称: ${row.name}${row.issue ? ` (${row.issue})` : ""}`);
      });
    }

    // 统计 parent_id = 0 的记录数
    const zeroParentIds = rows.filter((r) => r.parent_id === 0);
    console.log(`\nparent_id = 0 的记录数: ${zeroParentIds.length}`);
  } catch (error) {
    console.error("检查失败:", error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkParentIds();
