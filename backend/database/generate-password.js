/**
 * 生成 bcrypt 密码哈希的工具脚本
 * 使用方法: node database/generate-password.js <password>
 */

const bcrypt = require("bcrypt");

const password = process.argv[2];

if (!password) {
  console.error("请提供密码参数");
  console.log("使用方法: node database/generate-password.js <password>");
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 10);
console.log("\n密码哈希值:");
console.log(hash);
console.log("\n可以在 SQL 脚本中使用此哈希值替换默认密码。\n");
