/**
 * 重置开发环境脚本（跨平台）
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const readline = require('readline');

const execAsync = promisify(exec);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.log('🧹 正在清理开发环境...\n');

  try {
    // 停止并删除容器
    console.log('📦 停止并删除容器...');
    await execAsync('docker-compose -f docker-compose.dev.yml down');
    console.log('✅ 容器已停止\n');

    // 删除数据卷
    console.log('🗑️  删除数据卷...');
    try {
      await execAsync('docker volume rm yl_mysql_data');
      console.log('✅ 数据卷已删除\n');
    } catch (error) {
      console.log('ℹ️  数据卷已删除或不存在\n');
    }

    // 询问是否删除镜像
    const answer = await question('是否删除镜像？(y/N): ');
    if (answer.toLowerCase() === 'y') {
      console.log('🗑️  删除镜像...');
      try {
        await execAsync('docker rmi yl-backend-dev yl-web-dev 2>&1');
        console.log('✅ 镜像已删除\n');
      } catch (error) {
        console.log('ℹ️  镜像已删除或不存在\n');
      }
    }

    console.log('✅ 清理完成！\n');
    console.log('现在可以运行以下命令重新初始化：');
    console.log('  1. npm run dev:up          # 启动服务');
    console.log('  2. npm run backend:init-db # 初始化数据库');
    console.log('  3. npm run health          # 检查服务状态');

  } catch (error) {
    console.error('❌ 清理过程中出错:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();

