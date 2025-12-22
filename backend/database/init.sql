-- ============================================
-- 数据库初始化脚本
-- 说明：执行此脚本前请确保数据库已创建
-- 使用方法：mysql -u root -p myapp_db < init.sql
-- ============================================

-- 设置字符集
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- 1. 创建用户表
-- ============================================
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
  `email` VARCHAR(100) UNIQUE COMMENT '邮箱',
  `password` VARCHAR(255) NOT NULL COMMENT '加密后的密码',
  `nickname` VARCHAR(50) COMMENT '昵称',
  `avatar` VARCHAR(500) COMMENT '头像URL',
  `phone` VARCHAR(20) COMMENT '手机号',
  `role` VARCHAR(20) DEFAULT 'user' COMMENT '角色',
  `status` TINYINT DEFAULT 1 COMMENT '状态: 0-禁用, 1-正常',
  `is_admin` TINYINT DEFAULT 0 COMMENT '是否管理员: 0-否, 1-是',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_username (`username`),
  INDEX idx_email (`email`),
  INDEX idx_status (`status`),
  INDEX idx_role (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- ============================================
-- 2. 创建角色表
-- ============================================
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL UNIQUE COMMENT '角色名称',
  `code` VARCHAR(50) NOT NULL UNIQUE COMMENT '角色代码',
  `description` VARCHAR(200) COMMENT '描述',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX idx_code (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色表';

-- ============================================
-- 3. 创建权限表
-- ============================================
DROP TABLE IF EXISTS `permissions`;
CREATE TABLE `permissions` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL COMMENT '权限名称',
  `code` VARCHAR(100) NOT NULL UNIQUE COMMENT '权限代码(如: user:create)',
  `type` VARCHAR(20) DEFAULT 'api' COMMENT '类型: api-接口权限, menu-菜单权限, button-按钮权限',
  `parent_id` INT DEFAULT NULL COMMENT '父级权限ID',
  `path` VARCHAR(200) COMMENT '路由路径',
  `icon` VARCHAR(50) COMMENT '图标',
  `sort` INT DEFAULT 0 COMMENT '排序',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX idx_parent_id (`parent_id`),
  INDEX idx_code (`code`),
  INDEX idx_type (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='权限表';

-- ============================================
-- 4. 创建用户角色关联表
-- ============================================
DROP TABLE IF EXISTS `user_roles`;
CREATE TABLE `user_roles` (
  `user_id` INT NOT NULL COMMENT '用户ID',
  `role_id` INT NOT NULL COMMENT '角色ID',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`user_id`, `role_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE,
  INDEX idx_user_id (`user_id`),
  INDEX idx_role_id (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户角色关联表';

-- ============================================
-- 5. 创建角色权限关联表
-- ============================================
DROP TABLE IF EXISTS `role_permissions`;
CREATE TABLE `role_permissions` (
  `role_id` INT NOT NULL COMMENT '角色ID',
  `permission_id` INT NOT NULL COMMENT '权限ID',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`role_id`, `permission_id`),
  FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE CASCADE,
  INDEX idx_role_id (`role_id`),
  INDEX idx_permission_id (`permission_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色权限关联表';

-- ============================================
-- 6. 创建菜单管理表
-- ============================================
DROP TABLE IF EXISTS `menus`;
CREATE TABLE `menus` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL COMMENT '菜单名称',
  `path` VARCHAR(200) COMMENT '路由路径',
  `icon` VARCHAR(50) COMMENT '图标',
  `parent_id` INT DEFAULT NULL COMMENT '父菜单ID',
  `component` VARCHAR(200) COMMENT '组件路径',
  `sort` INT DEFAULT 0 COMMENT '排序',
  `status` TINYINT DEFAULT 1 COMMENT '状态: 0-禁用, 1-启用',
  `permission_code` VARCHAR(100) COMMENT '关联的权限代码',
  `is_external` TINYINT DEFAULT 0 COMMENT '是否外部链接: 0-否, 1-是',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  FOREIGN KEY (`parent_id`) REFERENCES `menus`(`id`) ON DELETE CASCADE,
  INDEX idx_parent_id (`parent_id`),
  INDEX idx_status (`status`),
  INDEX idx_sort (`sort`),
  INDEX idx_permission_code (`permission_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='菜单管理表';

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- 7. 插入初始数据
-- ============================================

-- 插入默认管理员用户
-- 密码: admin123 (请在生产环境中修改)
-- 使用 bcrypt 加密后的密码: $2b$10$CyOrL4KfwIoJGYbFoVAPguVvhakw3jHnoNuZA2YxoRXsCl5LzrDN2
INSERT INTO `users` (`username`, `password`, `nickname`, `email`, `role`, `status`) VALUES
('admin', '$2b$10$CyOrL4KfwIoJGYbFoVAPguVvhakw3jHnoNuZA2YxoRXsCl5LzrDN2', '管理员', 'admin@example.com', 'super_admin', 1);

-- 插入角色数据
INSERT INTO `roles` (`name`, `code`, `description`) VALUES
('超级管理员', 'super_admin', '拥有所有权限'),
('普通用户', 'user', '普通用户角色'),
('编辑者', 'editor', '内容编辑角色');

-- 插入权限数据（使用变量来引用父级权限ID）
SET @user_menu_id = 0;
SET @role_menu_id = 0;
SET @system_menu_id = 0;

-- 插入菜单权限（父级）- 分别插入以安全获取ID
INSERT INTO `permissions` (`name`, `code`, `type`, `parent_id`, `path`, `icon`, `sort`) VALUES
('用户管理', 'user', 'menu', NULL, '/user', 'User', 1);
SET @user_menu_id = LAST_INSERT_ID();

INSERT INTO `permissions` (`name`, `code`, `type`, `parent_id`, `path`, `icon`, `sort`) VALUES
('角色管理', 'role', 'menu', NULL, '/role', 'Lock', 2);
SET @role_menu_id = LAST_INSERT_ID();

INSERT INTO `permissions` (`name`, `code`, `type`, `parent_id`, `path`, `icon`, `sort`) VALUES
('权限管理', 'permission', 'menu', NULL, '/permission', 'Key', 2);
SET @permission_menu_id = LAST_INSERT_ID();

INSERT INTO `permissions` (`name`, `code`, `type`, `parent_id`, `path`, `icon`, `sort`) VALUES
('系统设置', 'system', 'menu', NULL, '/system', 'Setting', 3);
SET @system_menu_id = LAST_INSERT_ID();

-- 插入用户管理子权限
INSERT INTO `permissions` (`name`, `code`, `type`, `parent_id`, `path`, `icon`, `sort`) VALUES
('用户列表', 'user:list', 'menu', @user_menu_id, '/user/list', '', 1),
('创建用户', 'user:create', 'button', @user_menu_id, '', '', 2),
('编辑用户', 'user:edit', 'button', @user_menu_id, '', '', 3),
('删除用户', 'user:delete', 'button', @user_menu_id, '', '', 4),
('查看用户详情', 'user:view', 'api', @user_menu_id, '', '', 5);

-- 插入角色管理子权限
INSERT INTO `permissions` (`name`, `code`, `type`, `parent_id`, `path`, `icon`, `sort`) VALUES
('角色列表', 'role:list', 'menu', @role_menu_id, '/role/list', '', 1),
('创建角色', 'role:create', 'button', @role_menu_id, '', '', 2),
('编辑角色', 'role:edit', 'button', @role_menu_id, '', '', 3),
('删除角色', 'role:delete', 'button', @role_menu_id, '', '', 4),
('分配权限', 'role:assign', 'button', @role_menu_id, '', '', 5);

-- 插入权限管理子权限
INSERT INTO `permissions` (`name`, `code`, `type`, `parent_id`, `path`, `icon`, `sort`) VALUES
('权限列表', 'permission:list', 'menu', @permission_menu_id, '/permission/list', '', 1),
('创建权限', 'permission:create', 'button', @permission_menu_id, '', '', 2),
('编辑权限', 'permission:edit', 'button', @permission_menu_id, '', '', 3),
('删除权限', 'permission:delete', 'button', @permission_menu_id, '', '', 4);

-- 插入系统设置子权限
INSERT INTO `permissions` (`name`, `code`, `type`, `parent_id`, `path`, `icon`, `sort`) VALUES
('菜单管理', 'menu:manage', 'menu', @system_menu_id, '/system/menu', '', 1),
('系统配置', 'system:config', 'menu', @system_menu_id, '/system/config', '', 2);

-- ============================================
-- 插入菜单数据
-- ============================================
SET @user_menu_parent_id = 0;
SET @role_menu_parent_id = 0;
SET @permission_menu_parent_id = 0;
SET @system_menu_parent_id = 0;

-- 插入顶级菜单
INSERT INTO `menus` (`name`, `path`, `icon`, `parent_id`, `component`, `sort`, `status`, `permission_code`, `is_external`) VALUES
('用户管理', '/user', 'User', NULL, 'Layout', 1, 1, 'user', 0);
SET @user_menu_parent_id = LAST_INSERT_ID();

INSERT INTO `menus` (`name`, `path`, `icon`, `parent_id`, `component`, `sort`, `status`, `permission_code`, `is_external`) VALUES
('角色管理', '/role', 'Lock', NULL, 'Layout', 2, 1, 'role', 0);
SET @role_menu_parent_id = LAST_INSERT_ID();

INSERT INTO `menus` (`name`, `path`, `icon`, `parent_id`, `component`, `sort`, `status`, `permission_code`, `is_external`) VALUES
('权限管理', '/permission', 'Key', NULL, 'Layout', 3, 1, 'permission', 0);
SET @permission_menu_parent_id = LAST_INSERT_ID();

INSERT INTO `menus` (`name`, `path`, `icon`, `parent_id`, `component`, `sort`, `status`, `permission_code`, `is_external`) VALUES
('系统设置', '/system', 'Setting', NULL, 'Layout', 4, 1, 'system', 0);
SET @system_menu_parent_id = LAST_INSERT_ID();

-- 插入用户管理子菜单
INSERT INTO `menus` (`name`, `path`, `icon`, `parent_id`, `component`, `sort`, `status`, `permission_code`, `is_external`) VALUES
('用户列表', '/user/list', '', @user_menu_parent_id, 'user/list', 1, 1, 'user:list', 0);

-- 插入角色管理子菜单
INSERT INTO `menus` (`name`, `path`, `icon`, `parent_id`, `component`, `sort`, `status`, `permission_code`, `is_external`) VALUES
('角色列表', '/role/list', '', @role_menu_parent_id, 'role/list', 1, 1, 'role:list', 0);

-- 插入权限管理子菜单
INSERT INTO `menus` (`name`, `path`, `icon`, `parent_id`, `component`, `sort`, `status`, `permission_code`, `is_external`) VALUES
('权限列表', '/permission/list', '', @permission_menu_parent_id, 'permission/list', 1, 1, 'permission:list', 0);

-- 插入系统设置子菜单
INSERT INTO `menus` (`name`, `path`, `icon`, `parent_id`, `component`, `sort`, `status`, `permission_code`, `is_external`) VALUES
('菜单管理', '/system/menu', '', @system_menu_parent_id, 'system/menu', 1, 1, 'menu:manage', 0),
('系统配置', '/system/config', '', @system_menu_parent_id, 'system/config', 2, 1, 'system:config', 0);

-- ============================================
-- 8. 分配角色和权限
-- ============================================

-- 给超级管理员角色分配所有权限
INSERT INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 1, id FROM `permissions`;

-- 给管理员用户分配超级管理员角色
INSERT INTO `user_roles` (`user_id`, `role_id`) VALUES (1, 1);

-- ============================================
-- 9. 初始化完成
-- ============================================
-- 初始化完成信息将由 init-db.js 脚本输出
