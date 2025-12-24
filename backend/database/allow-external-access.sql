-- ============================================
-- 允许 root 用户从外部连接（仅用于开发环境）
-- 此脚本会在数据库初始化后执行
-- ============================================

-- 使用 root 用户从 localhost 连接执行（此时数据库已初始化）
-- 创建允许从任何主机连接的 root 用户
-- 注意：这里使用环境变量中的密码，默认为 'root'
CREATE USER IF NOT EXISTS 'root'@'%' IDENTIFIED WITH mysql_native_password BY 'root';

-- 授予所有权限
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;

-- 刷新权限
FLUSH PRIVILEGES;

