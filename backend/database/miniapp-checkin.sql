-- ============================================
-- 小程序恋爱打卡系统数据库表
-- 包含：小程序用户表、用户绑定关系表、打卡记录表
-- ============================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- 1. 小程序用户表
-- ============================================
DROP TABLE IF EXISTS `miniapp_user`;
CREATE TABLE `miniapp_user` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
  `openid` VARCHAR(100) NOT NULL UNIQUE COMMENT '微信openid',
  `unionid` VARCHAR(100) COMMENT '微信unionid',
  `nickname` VARCHAR(50) COMMENT '昵称',
  `avatar` VARCHAR(500) COMMENT '头像URL',
  `gender` TINYINT DEFAULT 0 COMMENT '性别: 0-未知, 1-男, 2-女',
  `phone` VARCHAR(20) COMMENT '手机号',
  `status` TINYINT DEFAULT 1 COMMENT '状态: 0-禁用, 1-正常',
  `last_login_time` DATETIME COMMENT '最后登录时间',
  `last_login_ip` VARCHAR(50) COMMENT '最后登录IP',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at` TIMESTAMP NULL DEFAULT NULL COMMENT '删除时间',
  INDEX idx_openid (`openid`),
  INDEX idx_unionid (`unionid`),
  INDEX idx_status (`status`),
  INDEX idx_deleted_at (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='小程序用户表';

-- ============================================
-- 2. 用户绑定关系表（记录用户和另一半的绑定关系）
-- ============================================
DROP TABLE IF EXISTS `user_couple`;
CREATE TABLE `user_couple` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '绑定ID',
  `user_id` INT NOT NULL COMMENT '用户ID',
  `partner_id` INT NOT NULL COMMENT '另一半用户ID',
  `status` TINYINT DEFAULT 1 COMMENT '状态: 0-已解除, 1-绑定中',
  `bind_time` DATETIME COMMENT '绑定时间',
  `unbind_time` DATETIME COMMENT '解除绑定时间',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at` TIMESTAMP NULL DEFAULT NULL COMMENT '删除时间',
  INDEX idx_user_id (`user_id`),
  INDEX idx_partner_id (`partner_id`),
  INDEX idx_status (`status`),
  INDEX idx_deleted_at (`deleted_at`),
  UNIQUE KEY uk_user_partner (`user_id`, `partner_id`),
  FOREIGN KEY (`user_id`) REFERENCES `miniapp_user`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`partner_id`) REFERENCES `miniapp_user`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户绑定关系表';

-- ============================================
-- 3. 打卡记录表
-- ============================================
DROP TABLE IF EXISTS `checkin_record`;
CREATE TABLE `checkin_record` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '打卡ID',
  `user_id` INT NOT NULL COMMENT '用户ID',
  `latitude` DECIMAL(10, 8) NOT NULL COMMENT '纬度',
  `longitude` DECIMAL(11, 8) NOT NULL COMMENT '经度',
  `address` VARCHAR(500) NOT NULL COMMENT '地址描述',
  `content` VARCHAR(1000) COMMENT '打卡内容',
  `images` JSON COMMENT '图片列表（JSON数组）',
  `is_public` TINYINT DEFAULT 0 COMMENT '是否公开: 0-不公开, 1-公开',
  `status` TINYINT DEFAULT 1 COMMENT '状态: 0-已删除, 1-正常',
  `audit_status` TINYINT DEFAULT 0 COMMENT '审核状态: 0-待审核, 1-已通过, 2-已拒绝',
  `audit_remark` VARCHAR(500) COMMENT '审核备注',
  `audit_time` DATETIME COMMENT '审核时间',
  `audit_by` INT COMMENT '审核人ID',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at` TIMESTAMP NULL DEFAULT NULL COMMENT '删除时间',
  INDEX idx_user_id (`user_id`),
  INDEX idx_status (`status`),
  INDEX idx_audit_status (`audit_status`),
  INDEX idx_created_at (`created_at`),
  INDEX idx_deleted_at (`deleted_at`),
  INDEX idx_location (`latitude`, `longitude`),
  FOREIGN KEY (`user_id`) REFERENCES `miniapp_user`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='打卡记录表';

-- ============================================
-- 4. 通知表（用于通知另一半打卡）
-- ============================================
DROP TABLE IF EXISTS `checkin_notification`;
CREATE TABLE `checkin_notification` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '通知ID',
  `user_id` INT NOT NULL COMMENT '接收通知的用户ID',
  `checkin_id` INT NOT NULL COMMENT '打卡记录ID',
  `type` TINYINT DEFAULT 1 COMMENT '通知类型: 1-另一半打卡通知',
  `is_read` TINYINT DEFAULT 0 COMMENT '是否已读: 0-未读, 1-已读',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at` TIMESTAMP NULL DEFAULT NULL COMMENT '删除时间',
  INDEX idx_user_id (`user_id`),
  INDEX idx_checkin_id (`checkin_id`),
  INDEX idx_is_read (`is_read`),
  INDEX idx_created_at (`created_at`),
  INDEX idx_deleted_at (`deleted_at`),
  FOREIGN KEY (`user_id`) REFERENCES `miniapp_user`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`checkin_id`) REFERENCES `checkin_record`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='打卡通知表';

-- ============================================
-- 5. 邀请码表（用于管理用户邀请关系）
-- ============================================
DROP TABLE IF EXISTS `user_invite_code`;
CREATE TABLE `user_invite_code` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '邀请码ID',
  `code` VARCHAR(32) NOT NULL UNIQUE COMMENT '邀请码（唯一）',
  `inviter_id` INT NOT NULL COMMENT '邀请者用户ID',
  `status` ENUM('pending', 'accepted', 'expired', 'cancelled') DEFAULT 'pending' COMMENT '状态: pending-等待接受, accepted-已接受, expired-已过期, cancelled-已取消',
  `expire_time` DATETIME NOT NULL COMMENT '过期时间',
  `accepted_at` DATETIME NULL COMMENT '接受时间',
  `accepted_by` INT NULL COMMENT '接受者用户ID',
  `is_shared` TINYINT(1) DEFAULT 0 COMMENT '是否已分享: 0-未分享, 1-已分享',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at` TIMESTAMP NULL DEFAULT NULL COMMENT '删除时间',
  INDEX idx_code (`code`),
  INDEX idx_inviter_id (`inviter_id`),
  INDEX idx_status (`status`),
  INDEX idx_expire_time (`expire_time`),
  INDEX idx_accepted_by (`accepted_by`),
  INDEX idx_is_shared (`is_shared`),
  INDEX idx_created_at (`created_at`),
  INDEX idx_deleted_at (`deleted_at`),
  FOREIGN KEY (`inviter_id`) REFERENCES `miniapp_user`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`accepted_by`) REFERENCES `miniapp_user`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户邀请码表';

-- ============================================
-- 6. 邀请配置表（用于管理邀请标题和图片）
-- ============================================
DROP TABLE IF EXISTS `invite_config`;
CREATE TABLE `invite_config` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '配置ID',
  `title` VARCHAR(200) NOT NULL COMMENT '邀请标题',
  `image_url` VARCHAR(500) NOT NULL COMMENT '邀请图片URL',
  `is_enabled` TINYINT(1) DEFAULT 0 COMMENT '是否启用: 0-未启用, 1-启用',
  `sort_order` INT DEFAULT 0 COMMENT '排序',
  `remark` VARCHAR(500) COMMENT '备注',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at` TIMESTAMP NULL DEFAULT NULL COMMENT '删除时间',
  INDEX idx_is_enabled (`is_enabled`),
  INDEX idx_sort_order (`sort_order`),
  INDEX idx_created_at (`created_at`),
  INDEX idx_deleted_at (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='邀请配置表';

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- 初始化完成
-- ============================================
SELECT '小程序打卡系统数据库表创建完成' AS '';
