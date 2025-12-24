-- ============================================
-- 数据库初始化脚本 - RBAC权限管理系统完整版
-- 包含所有表的创建和测试数据插入
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
  `avatar` VARCHAR(500) DEFAULT '/avatar/default.jpg' COMMENT '头像URL',
  `phone` VARCHAR(20) COMMENT '手机号',
  `gender` TINYINT DEFAULT 0 COMMENT '性别: 0-未知, 1-男, 2-女',
  `dept_id` INT COMMENT '部门ID',
  `post_id` INT COMMENT '岗位ID',
  `login_ip` VARCHAR(50) COMMENT '最后登录IP',
  `login_date` DATETIME COMMENT '最后登录时间',
  `remark` VARCHAR(500) COMMENT '备注',
  `status` TINYINT DEFAULT 1 COMMENT '状态: 0-禁用, 1-正常',
  `is_admin` TINYINT DEFAULT 0 COMMENT '是否管理员: 0-否, 1-是',
  `del_flag` TINYINT DEFAULT 0 COMMENT '删除标志: 0-正常, 1-删除',
  `created_by` INT COMMENT '创建人',
  `updated_by` INT COMMENT '更新人',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at` TIMESTAMP NULL DEFAULT NULL COMMENT '删除时间',
  INDEX idx_username (`username`),
  INDEX idx_email (`email`),
  INDEX idx_status (`status`),
  INDEX idx_dept_id (`dept_id`),
  INDEX idx_del_flag (`del_flag`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- ============================================
-- 2. 创建部门表
-- ============================================
DROP TABLE IF EXISTS `departments`;
CREATE TABLE `departments` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL COMMENT '部门名称',
  `parent_id` INT DEFAULT 0 COMMENT '父部门ID',
  `ancestors` VARCHAR(500) COMMENT '祖级列表',
  `leader` VARCHAR(50) COMMENT '负责人',
  `phone` VARCHAR(20) COMMENT '联系电话',
  `email` VARCHAR(100) COMMENT '邮箱',
  `order_num` INT DEFAULT 0 COMMENT '显示顺序',
  `status` TINYINT DEFAULT 1 COMMENT '状态: 0-停用, 1-正常',
  `del_flag` TINYINT DEFAULT 0 COMMENT '删除标志: 0-正常, 1-删除',
  `remark` VARCHAR(500) COMMENT '备注',
  `created_by` INT COMMENT '创建人',
  `updated_by` INT COMMENT '更新人',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at` TIMESTAMP NULL DEFAULT NULL COMMENT '删除时间',
  INDEX idx_parent_id (`parent_id`),
  INDEX idx_status (`status`),
  INDEX idx_order_num (`order_num`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='部门表';

-- ============================================
-- 3. 创建岗位表
-- ============================================
DROP TABLE IF EXISTS `posts`;
CREATE TABLE `posts` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `code` VARCHAR(50) NOT NULL UNIQUE COMMENT '岗位编码',
  `name` VARCHAR(100) NOT NULL COMMENT '岗位名称',
  `order_num` INT DEFAULT 0 COMMENT '显示顺序',
  `status` TINYINT DEFAULT 1 COMMENT '状态: 0-停用, 1-正常',
  `remark` VARCHAR(500) COMMENT '备注',
  `created_by` INT COMMENT '创建人',
  `updated_by` INT COMMENT '更新人',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at` TIMESTAMP NULL DEFAULT NULL COMMENT '删除时间',
  INDEX idx_code (`code`),
  INDEX idx_status (`status`),
  INDEX idx_order_num (`order_num`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='岗位表';

-- ============================================
-- 4. 创建角色表
-- ============================================
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL UNIQUE COMMENT '角色名称',
  `code` VARCHAR(50) NOT NULL UNIQUE COMMENT '角色代码',
  `data_scope` VARCHAR(20) DEFAULT '1' COMMENT '数据范围: 1-全部数据, 2-自定义数据, 3-本部门数据, 4-本部门及以下数据, 5-仅本人数据',
  `order_num` INT DEFAULT 0 COMMENT '显示顺序',
  `status` TINYINT DEFAULT 1 COMMENT '状态: 0-禁用, 1-正常',
  `remark` VARCHAR(500) COMMENT '备注',
  `created_by` INT COMMENT '创建人',
  `updated_by` INT COMMENT '更新人',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at` TIMESTAMP NULL DEFAULT NULL COMMENT '删除时间',
  INDEX idx_code (`code`),
  INDEX idx_status (`status`),
  INDEX idx_order_num (`order_num`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色表';

-- ============================================
-- 5. 创建菜单表（集成权限）
-- ============================================
DROP TABLE IF EXISTS `menus`;
CREATE TABLE `menus` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL COMMENT '菜单名称',
  `title` VARCHAR(50) NOT NULL COMMENT '菜单标题',
  `permission_code` VARCHAR(100) COMMENT '权限标识',
  `menu_type` CHAR(1) DEFAULT 'C' COMMENT '菜单类型: M-目录, C-菜单, F-按钮',
  `path` VARCHAR(200) COMMENT '路由地址',
  `component` VARCHAR(200) COMMENT '组件路径',
  `query` VARCHAR(255) COMMENT '路由参数',
  `is_frame` TINYINT DEFAULT 1 COMMENT '是否外链: 0-是, 1-否',
  `is_cache` TINYINT DEFAULT 0 COMMENT '是否缓存: 0-缓存, 1-不缓存',
  `visible` TINYINT DEFAULT 1 COMMENT '显示状态: 0-隐藏, 1-显示',
  `status` TINYINT DEFAULT 1 COMMENT '状态: 0-禁用, 1-正常',
  `icon` VARCHAR(100) DEFAULT '#' COMMENT '菜单图标',
  `parent_id` INT DEFAULT 0 COMMENT '父菜单ID',
  `order_num` INT DEFAULT 0 COMMENT '显示顺序',
  `remark` VARCHAR(500) COMMENT '备注',
  `created_by` INT COMMENT '创建人',
  `updated_by` INT COMMENT '更新人',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at` TIMESTAMP NULL DEFAULT NULL COMMENT '删除时间',
  INDEX idx_parent_id (`parent_id`),
  INDEX idx_menu_type (`menu_type`),
  INDEX idx_status (`status`),
  INDEX idx_visible (`visible`),
  INDEX idx_order_num (`order_num`),
  UNIQUE KEY uk_permission_code (`permission_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='菜单权限表';

-- ============================================
-- 6. 创建用户角色关联表
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
-- 7. 创建权限表
-- ============================================
DROP TABLE IF EXISTS `permissions`;
CREATE TABLE `permissions` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL COMMENT '权限名称',
  `code` VARCHAR(100) NOT NULL UNIQUE COMMENT '权限代码',
  `type` VARCHAR(20) DEFAULT 'api' COMMENT '类型: menu-菜单, button-按钮, api-接口',
  `parent_id` INT DEFAULT NULL COMMENT '父级权限ID',
  `path` VARCHAR(200) COMMENT '路由路径',
  `icon` VARCHAR(50) COMMENT '图标',
  `sort` INT DEFAULT 0 COMMENT '排序',
  `created_by` INT COMMENT '创建人',
  `updated_by` INT COMMENT '更新人',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at` TIMESTAMP NULL DEFAULT NULL COMMENT '删除时间',
  INDEX idx_code (`code`),
  INDEX idx_parent_id (`parent_id`),
  INDEX idx_type (`type`),
  INDEX idx_sort (`sort`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='权限表';

-- ============================================
-- 8. 创建角色权限关联表
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
-- 9. 创建角色菜单关联表
-- ============================================
DROP TABLE IF EXISTS `role_menus`;
CREATE TABLE `role_menus` (
  `role_id` INT NOT NULL COMMENT '角色ID',
  `menu_id` INT NOT NULL COMMENT '菜单ID',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`role_id`, `menu_id`),
  FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`menu_id`) REFERENCES `menus`(`id`) ON DELETE CASCADE,
  INDEX idx_role_id (`role_id`),
  INDEX idx_menu_id (`menu_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色菜单关联表';

-- ============================================
-- 8. 创建操作日志表
-- ============================================
DROP TABLE IF EXISTS `operation_logs`;
CREATE TABLE `operation_logs` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `title` VARCHAR(100) COMMENT '操作模块',
  `business_type` VARCHAR(50) COMMENT '业务类型',
  `method` VARCHAR(100) COMMENT '方法名称',
  `request_method` VARCHAR(10) COMMENT '请求方式',
  `operator_type` TINYINT DEFAULT 0 COMMENT '操作类别: 0-其它, 1-后台用户',
  `user_id` INT COMMENT '操作人员ID',
  `username` VARCHAR(50) COMMENT '操作人员账号',
  `oper_url` VARCHAR(500) COMMENT '请求URL',
  `oper_ip` VARCHAR(50) COMMENT '操作IP',
  `oper_location` VARCHAR(255) COMMENT '操作地点',
  `oper_param` TEXT COMMENT '请求参数',
  `json_result` TEXT COMMENT '返回参数',
  `status` TINYINT DEFAULT 1 COMMENT '操作状态: 0-异常, 1-正常',
  `error_msg` TEXT COMMENT '错误消息',
  `oper_time` DATETIME COMMENT '操作时间',
  INDEX idx_user_id (`user_id`),
  INDEX idx_oper_time (`oper_time`),
  INDEX idx_status (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志表';

-- ============================================
-- 10. 创建登录日志表
-- ============================================
DROP TABLE IF EXISTS `login_logs`;
CREATE TABLE `login_logs` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `username` VARCHAR(50) COMMENT '登录账号',
  `ipaddr` VARCHAR(50) COMMENT '登录IP地址',
  `login_location` VARCHAR(255) COMMENT '登录地点',
  `browser` VARCHAR(50) COMMENT '浏览器类型',
  `os` VARCHAR(50) COMMENT '操作系统',
  `status` TINYINT DEFAULT 1 COMMENT '登录状态: 0-失败, 1-成功',
  `msg` VARCHAR(255) COMMENT '提示消息',
  `login_time` DATETIME COMMENT '登录时间',
  INDEX idx_username (`username`),
  INDEX idx_login_time (`login_time`),
  INDEX idx_status (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='登录日志表';

-- ============================================
-- 11. 创建字典类型表
-- ============================================
DROP TABLE IF EXISTS `dict_types`;
CREATE TABLE `dict_types` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `dict_name` VARCHAR(100) NOT NULL COMMENT '字典名称',
  `dict_type` VARCHAR(100) NOT NULL UNIQUE COMMENT '字典类型',
  `status` TINYINT DEFAULT 1 COMMENT '状态: 0-停用, 1-正常',
  `remark` VARCHAR(500) COMMENT '备注',
  `created_by` INT COMMENT '创建人',
  `updated_by` INT COMMENT '更新人',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at` TIMESTAMP NULL DEFAULT NULL COMMENT '删除时间',
  INDEX idx_dict_type (`dict_type`),
  INDEX idx_status (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='字典类型表';

-- ============================================
-- 12. 创建字典数据表
-- ============================================
DROP TABLE IF EXISTS `dict_data`;
CREATE TABLE `dict_data` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `dict_sort` INT DEFAULT 0 COMMENT '字典排序',
  `dict_label` VARCHAR(100) NOT NULL COMMENT '字典标签',
  `dict_value` VARCHAR(100) NOT NULL COMMENT '字典键值',
  `dict_type` VARCHAR(100) NOT NULL COMMENT '字典类型',
  `css_class` VARCHAR(100) COMMENT '样式属性',
  `list_class` VARCHAR(100) COMMENT '表格回显样式',
  `is_default` TINYINT DEFAULT 0 COMMENT '是否默认: 0-否, 1-是',
  `status` TINYINT DEFAULT 1 COMMENT '状态: 0-停用, 1-正常',
  `remark` VARCHAR(500) COMMENT '备注',
  `created_by` INT COMMENT '创建人',
  `updated_by` INT COMMENT '更新人',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at` TIMESTAMP NULL DEFAULT NULL COMMENT '删除时间',
  INDEX idx_dict_type (`dict_type`),
  INDEX idx_status (`status`),
  INDEX idx_dict_sort (`dict_sort`),
  FOREIGN KEY (`dict_type`) REFERENCES `dict_types`(`dict_type`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='字典数据表';

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- 14. 插入部门测试数据
-- ============================================
INSERT INTO `departments` (`id`, `name`, `parent_id`, `ancestors`, `leader`, `phone`, `email`, `order_num`, `status`, `remark`) VALUES
(1, '总公司', 0, '0', '张总', '010-88888888', 'ceo@company.com', 1, 1, '公司总部'),
(2, '研发部', 1, '0,1', '李经理', '010-88880001', 'dev@company.com', 1, 1, '技术研发部门'),
(3, '产品部', 2, '0,1,2', '王经理', '010-88880002', 'product@company.com', 1, 1, '产品设计部门'),
(4, '开发部', 2, '0,1,2', '赵经理', '010-88880003', 'develop@company.com', 2, 1, '软件开发部门'),
(5, '测试部', 2, '0,1,2', '钱经理', '010-88880004', 'test@company.com', 3, 1, '软件测试部门'),
(6, '市场部', 1, '0,1', '孙经理', '010-88880005', 'market@company.com', 2, 1, '市场营销部门'),
(7, '销售部', 6, '0,1,6', '周经理', '010-88880006', 'sales@company.com', 1, 1, '产品销售部门'),
(8, '运营部', 1, '0,1', '吴经理', '010-88880007', 'operation@company.com', 3, 1, '运营管理部门'),
(9, '财务部', 1, '0,1', '郑经理', '010-88880008', 'finance@company.com', 4, 1, '财务管理部门'),
(10, '人事部', 1, '0,1', '王经理', '010-88880009', 'hr@company.com', 5, 1, '人力资源部门');

-- ============================================
-- 15. 插入岗位测试数据
-- ============================================
INSERT INTO `posts` (`id`, `code`, `name`, `order_num`, `status`, `remark`) VALUES
(1, 'ceo', '董事长', 1, 1, '公司最高管理者'),
(2, 'cto', '技术总监', 2, 1, '技术负责人'),
(3, 'cfo', '财务总监', 3, 1, '财务负责人'),
(4, 'coo', '运营总监', 4, 1, '运营负责人'),
(5, 'dev_manager', '开发经理', 5, 1, '开发团队负责人'),
(6, 'dev_senior', '高级开发工程师', 6, 1, '高级开发人员'),
(7, 'dev_junior', '初级开发工程师', 7, 1, '初级开发人员'),
(8, 'test_manager', '测试经理', 8, 1, '测试团队负责人'),
(9, 'tester', '测试工程师', 9, 1, '测试人员'),
(10, 'product_manager', '产品经理', 10, 1, '产品负责人'),
(11, 'ui_designer', 'UI设计师', 11, 1, '界面设计师'),
(12, 'sales_manager', '销售经理', 12, 1, '销售负责人'),
(13, 'salesman', '销售专员', 13, 1, '销售人员'),
(14, 'hr_manager', '人事经理', 14, 1, '人事负责人'),
(15, 'hr_specialist', '人事专员', 15, 1, '人事专员');

-- ============================================
-- 16. 插入角色测试数据
-- ============================================
INSERT INTO `roles` (`id`, `name`, `code`, `data_scope`, `order_num`, `status`, `remark`) VALUES
(1, '超级管理员', 'super_admin', '1', 1, 1, '拥有所有权限，系统最高权限'),
(2, '系统管理员', 'admin', '1', 2, 1, '系统管理权限，不能管理用户权限'),
(3, '部门管理员', 'dept_admin', '4', 3, 1, '管理本部门及下属部门'),
(4, '项目经理', 'project_manager', '3', 4, 1, '管理本项目组'),
(5, '开发工程师', 'developer', '5', 5, 1, '开发人员角色'),
(6, '测试工程师', 'tester', '5', 6, 1, '测试人员角色'),
(7, '产品经理', 'product_manager', '5', 7, 1, '产品人员角色'),
(8, '普通用户', 'user', '5', 8, 1, '普通用户，只有查看权限');

-- ============================================
-- 17. 插入用户测试数据
-- ============================================
-- 密码都是: admin123 (bcrypt加密)
INSERT INTO `users` (`id`, `username`, `email`, `password`, `nickname`, `phone`, `gender`, `dept_id`, `post_id`, `login_ip`, `login_date`, `status`, `is_admin`, `remark`) VALUES
(1, 'admin', 'admin@company.com', '$2b$10$CyOrL4KfwIoJGYbFoVAPguVvhakw3jHnoNuZA2YxoRXsCl5LzrDN2', '超级管理员', '13800000001', 1, 1, 1, '192.168.1.100', '2024-01-15 09:30:00', 1, 1, '系统超级管理员'),
(2, 'zhangsan', 'zhangsan@company.com', '$2b$10$CyOrL4KfwIoJGYbFoVAPguVvhakw3jHnoNuZA2YxoRXsCl5LzrDN2', '张三', '13800000002', 1, 2, 5, '192.168.1.101', '2024-01-15 10:20:00', 1, 0, '研发部开发经理'),
(3, 'lisi', 'lisi@company.com', '$2b$10$CyOrL4KfwIoJGYbFoVAPguVvhakw3jHnoNuZA2YxoRXsCl5LzrDN2', '李四', '13800000003', 1, 4, 6, '192.168.1.102', '2024-01-15 11:15:00', 1, 0, '开发部高级工程师'),
(4, 'wangwu', 'wangwu@company.com', '$2b$10$CyOrL4KfwIoJGYbFoVAPguVvhakw3jHnoNuZA2YxoRXsCl5LzrDN2', '王五', '13800000004', 2, 5, 9, '192.168.1.103', '2024-01-15 14:30:00', 1, 0, '测试部工程师'),
(5, 'zhaoliu', 'zhaoliu@company.com', '$2b$10$CyOrL4KfwIoJGYbFoVAPguVvhakw3jHnoNuZA2YxoRXsCl5LzrDN2', '赵六', '13800000005', 1, 3, 10, '192.168.1.104', '2024-01-15 15:45:00', 1, 0, '产品部经理'),
(6, 'qianqi', 'qianqi@company.com', '$2b$10$CyOrL4KfwIoJGYbFoVAPguVvhakw3jHnoNuZA2YxoRXsCl5LzrDN2', '钱七', '13800000006', 1, 7, 13, '192.168.1.105', '2024-01-15 16:20:00', 1, 0, '销售部专员'),
(7, 'sunba', 'sunba@company.com', '$2b$10$CyOrL4KfwIoJGYbFoVAPguVvhakw3jHnoNuZA2YxoRXsCl5LzrDN2', '孙八', '13800000007', 1, 8, 4, '192.168.1.106', '2024-01-15 17:10:00', 1, 0, '运营部总监'),
(8, 'zhoujiu', 'zhoujiu@company.com', '$2b$10$CyOrL4KfwIoJGYbFoVAPguVvhakw3jHnoNuZA2YxoRXsCl5LzrDN2', '周九', '13800000008', 2, 9, 3, '192.168.1.107', '2024-01-15 18:05:00', 1, 0, '财务部总监'),
(9, 'wushi', 'wushi@company.com', '$2b$10$CyOrL4KfwIoJGYbFoVAPguVvhakw3jHnoNuZA2YxoRXsCl5LzrDN2', '吴十', '13800000009', 1, 10, 14, '192.168.1.108', '2024-01-15 19:00:00', 1, 0, '人事部经理'),
(10, 'demo', 'demo@company.com', '$2b$10$CyOrL4KfwIoJGYbFoVAPguVvhakw3jHnoNuZA2YxoRXsCl5LzrDN2', '演示用户', '13800000010', 0, 2, 7, '192.168.1.109', '2024-01-15 20:30:00', 1, 0, '演示账号，权限受限');

-- ============================================
-- 18. 插入菜单测试数据
-- ============================================
INSERT INTO `menus` (`id`, `name`, `title`, `permission_code`, `menu_type`, `path`, `component`, `query`, `is_frame`, `is_cache`, `visible`, `status`, `icon`, `parent_id`, `order_num`, `remark`) VALUES
(1, 'System', '系统管理', NULL, 'M', '/system', 'Layout', NULL, 1, 0, 1, 1, 'Setting', 0, 1, NULL),
(2, 'Monitor', '系统监控', NULL, 'M', '/monitor', 'Layout', NULL, 1, 0, 1, 1, 'Bell', 0, 2, NULL),
(4, 'Profile', '个人中心', NULL, 'C', '/profile', 'profile/index', NULL, 1, 0, 1, 1, 'User', 0, 4, NULL),
(5, 'UserManage', '用户管理', 'system:user:list', 'C', '/system/user/', 'system/user/index', NULL, 1, 0, 1, 1, 'UserFilled', 1, 1, NULL),
(6, 'RoleManage', '角色管理', 'system:role:list', 'C', '/system/role/', 'system/role/index', NULL, 1, 0, 1, 1, 'User', 1, 2, NULL),
(7, 'MenuManage', '菜单管理', 'system:menu:list', 'C', '/system/menu/', 'system/menu/index', NULL, 1, 0, 1, 1, 'Menu', 1, 3, NULL),
(8, 'DeptManage', '部门管理', 'system:dept:list', 'C', '/system/dept/', 'system/dept/index', NULL, 1, 0, 1, 1, 'OfficeBuilding', 1, 4, NULL),
(9, 'PostManage', '岗位管理', 'system:post:list', 'C', '/system/post/', 'system/post/index', NULL, 1, 0, 1, 1, 'Suitcase', 1, 5, NULL),
(10, 'DictManage', '字典管理', 'system:dict:list', 'C', '/system/dict/', 'system/dict/index', NULL, 1, 0, 1, 1, 'Notebook', 1, 6, NULL),
(13, 'OperLog', '操作日志', 'monitor:operlog:list', 'C', '/monitor/operlog/', 'monitor/operlog/index', NULL, 1, 0, 1, 1, 'Document', 2, 2, NULL),
(14, 'LoginLog', '登录日志', 'monitor:logininfor:list', 'C', '/monitor/logininfor/', 'monitor/logininfor/index', NULL, 1, 0, 1, 1, 'Lock', 2, 3, NULL),
(15, 'Server', '服务监控', 'monitor:server:list', 'C', '/monitor/server/', 'monitor/server/index', NULL, 1, 0, 1, 1, 'DataLine', 2, 4, NULL),
(21, 'UserQuery', '用户查询', 'system:user:query', 'F', NULL, NULL, NULL, 1, 0, 1, 1, '#', 5, 1, NULL),
(22, 'UserAdd', '用户新增', 'system:user:add', 'F', NULL, NULL, NULL, 1, 0, 1, 1, '#', 5, 2, NULL),
(23, 'UserEdit', '用户修改', 'system:user:edit', 'F', NULL, NULL, NULL, 1, 0, 1, 1, '#', 5, 3, NULL),
(24, 'UserDelete', '用户删除', 'system:user:remove', 'F', NULL, NULL, NULL, 1, 0, 1, 1, '#', 5, 4, NULL),
(25, 'UserExport', '用户导出', 'system:user:export', 'F', NULL, NULL, NULL, 1, 0, 1, 1, '#', 5, 5, NULL),
(26, 'UserImport', '用户导入', 'system:user:import', 'F', NULL, NULL, NULL, 1, 0, 1, 1, '#', 5, 6, NULL),
(27, 'RoleQuery', '角色查询', 'system:role:query', 'F', NULL, NULL, NULL, 1, 0, 1, 1, '#', 6, 1, NULL),
(28, 'RoleAdd', '角色新增', 'system:role:add', 'F', NULL, NULL, NULL, 1, 0, 1, 1, '#', 6, 2, NULL),
(29, 'RoleEdit', '角色修改', 'system:role:edit', 'F', NULL, NULL, NULL, 1, 0, 1, 1, '#', 6, 3, NULL),
(30, 'RoleDelete', '角色删除', 'system:role:remove', 'F', NULL, NULL, NULL, 1, 0, 1, 1, '#', 6, 4, NULL),
(31, 'Index', '首页', NULL, 'C', '/', 'index', NULL, 1, 0, 1, 1, 'HomeFilled', 0, 0, NULL),
(100, '测试目录名称', '测试目录标题', NULL, 'M', '/test', '/test', NULL, 1, 0, 1, 1, 'Tools', 0, 33, 'test111'),
(101, '测试子菜单名称', '测试子菜单标题', NULL, 'C', '/test/testaa', '/test/testaa', NULL, 1, 0, 1, 1, 'Document', 100, 1, NULL),
(102, '字典类型', '字典类型', NULL, 'C', '/system/dict/type/', '/system/dict/type', NULL, 0, 1, 1, 1, 'Collection', 10, 1, NULL),
(103, '字典数据', '字典数据', NULL, 'C', '/system/dict/data/', '/system/dict/data/', NULL, 0, 1, 1, 1, 'List', 10, 2, NULL);

-- ============================================
-- 19. 插入字典类型测试数据
-- ============================================
INSERT INTO `dict_types` (`id`, `dict_name`, `dict_type`, `status`, `remark`) VALUES
(1, '用户性别', 'sys_user_sex', 1, '用户性别列表'),
(2, '菜单状态', 'sys_show_hide', 1, '菜单状态列表'),
(3, '系统开关', 'sys_normal_disable', 1, '系统开关列表'),
(4, '任务状态', 'sys_job_status', 1, '任务状态列表'),
(5, '操作类型', 'sys_oper_type', 1, '操作类型列表'),
(6, '通知类型', 'sys_notice_type', 1, '通知类型列表'),
(7, '系统是否', 'sys_yes_no', 1, '系统是否列表'),
(8, '用户类型', 'sys_user_type', 1, '用户类型列表'),
(9, '登录状态', 'sys_login_status', 1, '登录状态列表');

-- ============================================
-- 20. 插入字典数据测试数据
-- ============================================
INSERT INTO `dict_data` (`id`, `dict_label`, `dict_value`, `dict_type`, `dict_sort`, `status`, `remark`) VALUES
(1, '男', '1', 'sys_user_sex', 1, 1, '性别男'),
(2, '女', '2', 'sys_user_sex', 2, 1, '性别女'),
(3, '未知', '0', 'sys_user_sex', 3, 1, '性别未知'),
(4, '显示', '1', 'sys_show_hide', 1, 1, '显示菜单'),
(5, '隐藏', '0', 'sys_show_hide', 2, 1, '隐藏菜单'),
(6, '正常', '1', 'sys_normal_disable', 1, 1, '正常状态'),
(7, '停用', '0', 'sys_normal_disable', 2, 1, '停用状态'),
(8, '新增', '1', 'sys_oper_type', 1, 1, '新增操作'),
(9, '修改', '2', 'sys_oper_type', 2, 1, '修改操作'),
(10, '删除', '3', 'sys_oper_type', 3, 1, '删除操作'),
(11, '授权', '4', 'sys_oper_type', 4, 1, '授权操作'),
(12, '导出', '5', 'sys_oper_type', 5, 1, '导出操作'),
(13, '导入', '6', 'sys_oper_type', 6, 1, '导入操作'),
(14, '强退', '7', 'sys_oper_type', 7, 1, '强退操作'),
(15, '生成代码', '8', 'sys_oper_type', 8, 1, '生成代码操作'),
(16, '通知', '1', 'sys_notice_type', 1, 1, '通知'),
(17, '公告', '2', 'sys_notice_type', 2, 1, '公告'),
(18, '是', 'Y', 'sys_yes_no', 1, 1, '系统默认是'),
(19, '否', 'N', 'sys_yes_no', 2, 1, '系统默认否'),
(20, '后台用户', '00', 'sys_user_type', 1, 1, '后台用户'),
(21, '前台用户', '01', 'sys_user_type', 2, 1, '前台用户'),
(22, '成功', '1', 'sys_login_status', 1, 1, '登录成功'),
(23, '失败', '0', 'sys_login_status', 2, 1, '登录失败');

-- ============================================
-- 22. 插入操作日志测试数据
-- ============================================
INSERT INTO `operation_logs` (`id`, `title`, `business_type`, `method`, `request_method`, `user_id`, `username`, `oper_url`, `oper_ip`, `oper_location`, `oper_param`, `json_result`, `status`, `oper_time`) VALUES
(1, '用户管理', '查询', 'com.example.controller.UserController.list', 'GET', 1, 'admin', '/api/user/list', '192.168.1.100', '内网IP', '{\"page\":1,\"size\":10}', '{\"code\":200,\"data\":[...]}', 1, '2024-01-15 09:35:00'),
(2, '用户管理', '新增', 'com.example.controller.UserController.add', 'POST', 1, 'admin', '/api/user/add', '192.168.1.100', '内网IP', '{\"username\":\"testuser\",\"nickname\":\"测试用户\"}', '{\"code\":200,\"msg\":\"添加成功\"}', 1, '2024-01-15 10:15:00'),
(3, '角色管理', '修改', 'com.example.controller.RoleController.edit', 'PUT', 2, 'zhangsan', '/api/role/edit', '192.168.1.101', '内网IP', '{\"id\":3,\"name\":\"部门管理员\",\"code\":\"dept_admin\"}', '{\"code\":200,\"msg\":\"修改成功\"}', 1, '2024-01-15 11:30:00'),
(4, '菜单管理', '删除', 'com.example.controller.MenuController.delete', 'DELETE', 1, 'admin', '/api/menu/delete/21', '192.168.1.100', '内网IP', '{\"id\":21}', '{\"code\":200,\"msg\":\"删除成功\"}', 1, '2024-01-15 14:45:00'),
(5, '部门管理', '查询', 'com.example.controller.DeptController.list', 'GET', 3, 'lisi', '/api/dept/list', '192.168.1.102', '内网IP', '{}', '{\"code\":200,\"data\":[...]}', 1, '2024-01-15 15:20:00');

-- ============================================
-- 23. 插入用户角色关联测试数据
-- ============================================
INSERT INTO `user_roles` (`user_id`, `role_id`) VALUES
(1, 1),  -- admin -> 超级管理员
(2, 3),  -- zhangsan -> 部门管理员
(2, 5),  -- zhangsan -> 开发工程师
(3, 5),  -- lisi -> 开发工程师
(4, 6),  -- wangwu -> 测试工程师
(5, 7),  -- zhaoliu -> 产品经理
(6, 8),  -- qianqi -> 普通用户
(7, 4),  -- sunba -> 项目经理
(7, 8),  -- sunba -> 普通用户
(8, 8),  -- zhoujiu -> 普通用户
(9, 3),  -- wushi -> 部门管理员
(9, 8),  -- wushi -> 普通用户
(10, 8); -- demo -> 普通用户

-- ============================================
-- 24. 插入角色菜单关联测试数据
-- ============================================

-- 超级管理员拥有所有菜单权限
INSERT INTO `role_menus` (`role_id`, `menu_id`)
SELECT 1, id FROM `menus` WHERE `status` = 1;

-- 系统管理员拥有系统管理相关权限（除权限分配外）
INSERT INTO `role_menus` (`role_id`, `menu_id`)
SELECT 2, id FROM `menus` 
WHERE `status` = 1 
AND `permission_code` LIKE 'system:%'
AND `permission_code` NOT IN ('system:user:remove', 'system:role:remove', 'system:menu:remove');

-- 部门管理员拥有部门管理权限
INSERT INTO `role_menus` (`role_id`, `menu_id`)
SELECT 3, id FROM `menus` 
WHERE `status` = 1 
AND (`permission_code` LIKE 'system:dept:%' 
     OR `permission_code` LIKE 'monitor:%'
     OR id = 4);  -- 个人中心相关

-- 开发工程师拥有查看权限
INSERT INTO `role_menus` (`role_id`, `menu_id`)
SELECT 5, id FROM `menus` 
WHERE `status` = 1 
AND (`permission_code` LIKE '%:list' 
     OR `permission_code` LIKE '%:query'
     OR `menu_type` = 'M'
     OR id = 4);

-- 普通用户只有个人中心
INSERT INTO `role_menus` (`role_id`, `menu_id`)
SELECT 8, id FROM `menus` 
WHERE `status` = 1 
AND id = 4;  -- 个人中心相关

-- ============================================
-- 25. 插入权限数据
-- ============================================
INSERT INTO `permissions` (`id`, `name`, `code`, `type`, `parent_id`, `sort`, `created_at`, `updated_at`) VALUES
-- 用户管理权限
(1, '用户管理', 'user:manage', 'menu', NULL, 1, NOW(), NOW()),
(2, '创建用户', 'user:create', 'button', 1, 1, NOW(), NOW()),
(3, '编辑用户', 'user:edit', 'button', 1, 2, NOW(), NOW()),
(4, '查看用户', 'user:view', 'button', 1, 3, NOW(), NOW()),
(5, '删除用户', 'user:delete', 'button', 1, 4, NOW(), NOW()),

-- 角色管理权限
(6, '角色管理', 'role:manage', 'menu', NULL, 2, NOW(), NOW()),
(7, '创建角色', 'role:create', 'button', 6, 1, NOW(), NOW()),
(8, '编辑角色', 'role:edit', 'button', 6, 2, NOW(), NOW()),
(9, '查看角色', 'role:view', 'button', 6, 3, NOW(), NOW()),
(10, '删除角色', 'role:delete', 'button', 6, 4, NOW(), NOW()),

-- 菜单管理权限
(11, '菜单管理', 'menu:manage', 'menu', NULL, 3, NOW(), NOW()),
(12, '创建菜单', 'menu:create', 'button', 11, 1, NOW(), NOW()),
(13, '编辑菜单', 'menu:edit', 'button', 11, 2, NOW(), NOW()),
(14, '查看菜单', 'menu:view', 'button', 11, 3, NOW(), NOW()),
(15, '删除菜单', 'menu:delete', 'button', 11, 4, NOW(), NOW()),

-- 部门管理权限
(16, '部门管理', 'dept:manage', 'menu', NULL, 4, NOW(), NOW()),
(17, '创建部门', 'dept:create', 'button', 16, 1, NOW(), NOW()),
(18, '编辑部门', 'dept:edit', 'button', 16, 2, NOW(), NOW()),
(19, '查看部门', 'dept:view', 'button', 16, 3, NOW(), NOW()),
(20, '删除部门', 'dept:delete', 'button', 16, 4, NOW(), NOW()),

-- 岗位管理权限
(21, '岗位管理', 'post:manage', 'menu', NULL, 5, NOW(), NOW()),
(22, '创建岗位', 'post:create', 'button', 21, 1, NOW(), NOW()),
(23, '编辑岗位', 'post:edit', 'button', 21, 2, NOW(), NOW()),
(24, '查看岗位', 'post:view', 'button', 21, 3, NOW(), NOW()),
(25, '删除岗位', 'post:delete', 'button', 21, 4, NOW(), NOW()),

-- 字典管理权限
(26, '字典管理', 'dict:manage', 'menu', NULL, 6, NOW(), NOW()),
(27, '创建字典', 'dict:create', 'button', 26, 1, NOW(), NOW()),
(28, '编辑字典', 'dict:edit', 'button', 26, 2, NOW(), NOW()),
(29, '查看字典', 'dict:view', 'button', 26, 3, NOW(), NOW()),
(30, '删除字典', 'dict:delete', 'button', 26, 4, NOW(), NOW());

-- ============================================
-- 26. 插入角色权限关联数据
-- ============================================

-- 超级管理员拥有所有权限
INSERT INTO `role_permissions` (`role_id`, `permission_id`, `created_at`)
SELECT 1, id, NOW() FROM `permissions`
WHERE `deleted_at` IS NULL;

-- 系统管理员拥有用户、角色、菜单、部门、岗位、字典管理权限
INSERT INTO `role_permissions` (`role_id`, `permission_id`, `created_at`)
SELECT 2, id, NOW() FROM `permissions`
WHERE `code` IN (
  'user:manage', 'user:create', 'user:edit', 'user:view', 'user:delete',
  'role:manage', 'role:create', 'role:edit', 'role:view', 'role:delete',
  'menu:manage', 'menu:create', 'menu:edit', 'menu:view', 'menu:delete',
  'dept:manage', 'dept:create', 'dept:edit', 'dept:view', 'dept:delete',
  'post:manage', 'post:create', 'post:edit', 'post:view', 'post:delete',
  'dict:manage', 'dict:create', 'dict:edit', 'dict:view', 'dict:delete'
);

-- 部门管理员拥有用户查看和编辑权限
INSERT INTO `role_permissions` (`role_id`, `permission_id`, `created_at`)
SELECT 3, id, NOW() FROM `permissions`
WHERE `code` IN (
  'user:view', 'user:edit',
  'dept:view', 'dept:edit'
);

-- 开发工程师拥有查看权限
INSERT INTO `role_permissions` (`role_id`, `permission_id`, `created_at`)
SELECT 5, id, NOW() FROM `permissions`
WHERE `code` LIKE '%:view';

-- ============================================
-- 27. 重置自增ID起始值
-- ============================================
ALTER TABLE `users` AUTO_INCREMENT = 100;
ALTER TABLE `departments` AUTO_INCREMENT = 100;
ALTER TABLE `posts` AUTO_INCREMENT = 100;
ALTER TABLE `roles` AUTO_INCREMENT = 100;
ALTER TABLE `menus` AUTO_INCREMENT = 104;
ALTER TABLE `permissions` AUTO_INCREMENT = 100;
ALTER TABLE `dict_types` AUTO_INCREMENT = 100;
ALTER TABLE `dict_data` AUTO_INCREMENT = 100;
ALTER TABLE `operation_logs` AUTO_INCREMENT = 100;
ALTER TABLE `login_logs` AUTO_INCREMENT = 100;

-- ============================================
-- 28. 创建视图
-- ============================================
CREATE OR REPLACE VIEW v_user_info AS
SELECT 
    u.id,
    u.username,
    u.email,
    u.nickname,
    u.phone,
    u.avatar,
    u.gender,
    u.status,
    u.login_ip,
    u.login_date,
    u.created_at,
    d.name as dept_name,
    d.leader as dept_leader,
    p.name as post_name,
    p.code as post_code,
    GROUP_CONCAT(DISTINCT r.name ORDER BY r.name SEPARATOR ', ') as role_names,
    GROUP_CONCAT(DISTINCT r.code ORDER BY r.code SEPARATOR ', ') as role_codes
FROM users u
LEFT JOIN departments d ON u.dept_id = d.id
LEFT JOIN posts p ON u.post_id = p.id
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
WHERE u.del_flag = 0
GROUP BY u.id, u.username, u.email, u.nickname, u.phone, u.avatar, u.gender, 
         u.status, u.login_ip, u.login_date, u.created_at, d.name, d.leader, p.name, p.code;

CREATE OR REPLACE VIEW v_menu_tree AS
SELECT 
    m1.id,
    m1.name,
    m1.title,
    m1.permission_code,
    m1.menu_type,
    m1.path,
    m1.component,
    m1.icon,
    m1.parent_id,
    m1.order_num,
    m1.visible,
    m1.status,
    m2.title as parent_title,
    m2.name as parent_name,
    CASE 
        WHEN m1.menu_type = 'M' THEN '目录'
        WHEN m1.menu_type = 'C' THEN '菜单'
        WHEN m1.menu_type = 'F' THEN '按钮'
        ELSE '未知'
    END as menu_type_name
FROM menus m1
LEFT JOIN menus m2 ON m1.parent_id = m2.id
WHERE m1.status = 1
ORDER BY m1.parent_id, m1.order_num;

-- ============================================
-- 29. 输出初始化完成信息
-- ============================================
SELECT '============================================' AS '';
SELECT '数据库初始化完成' AS '';
SELECT '============================================' AS '';
SELECT '测试账号信息:' AS '';
SELECT '--------------------------------------------' AS '';
SELECT '超级管理员: admin / admin123' AS '';
SELECT '开发经理: zhangsan / admin123' AS '';
SELECT '开发工程师: lisi / admin123' AS '';
SELECT '测试工程师: wangwu / admin123' AS '';
SELECT '产品经理: zhaoliu / admin123' AS '';
SELECT '演示账号: demo / admin123' AS '';
SELECT '--------------------------------------------' AS '';
SELECT CONCAT('数据统计: ') AS '';
SELECT CONCAT('  用户数量: ', (SELECT COUNT(*) FROM users), ' 个') AS '';
SELECT CONCAT('  部门数量: ', (SELECT COUNT(*) FROM departments), ' 个') AS '';
SELECT CONCAT('  岗位数量: ', (SELECT COUNT(*) FROM posts), ' 个') AS '';
SELECT CONCAT('  角色数量: ', (SELECT COUNT(*) FROM roles), ' 个') AS '';
SELECT CONCAT('  菜单数量: ', (SELECT COUNT(*) FROM menus), ' 个') AS '';
SELECT '--------------------------------------------' AS '';
SELECT CONCAT('初始化时间: ', NOW()) AS '';
SELECT '============================================' AS '';