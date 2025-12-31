-- ============================================
-- 小程序商城数据库表结构
-- 包含：用户、商品、分类、购物车、订单、地址、轮播图等
-- 使用方法：mysql -u root -p myapp_db < mall.sql
-- ============================================

-- 设置字符集
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- 1. 小程序用户表
-- ============================================
DROP TABLE IF EXISTS `miniapp_users`;
CREATE TABLE `miniapp_users` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `openid` VARCHAR(100) NOT NULL UNIQUE COMMENT '微信openid',
  `unionid` VARCHAR(100) COMMENT '微信unionid',
  `nickname` VARCHAR(100) COMMENT '微信昵称',
  `avatar` VARCHAR(500) COMMENT '微信头像',
  `phone` VARCHAR(20) COMMENT '手机号',
  `password` VARCHAR(255) COMMENT '加密后的密码',
  `gender` TINYINT DEFAULT 0 COMMENT '性别: 0-未知, 1-男, 2-女',
  `balance` DECIMAL(10,2) DEFAULT 0 COMMENT '账户余额',
  `points` INT DEFAULT 0 COMMENT '积分',
  `member_level` TINYINT DEFAULT 0 COMMENT '会员等级: 0-普通, 1-银卡, 2-金卡, 3-钻石',
  `total_consumption` DECIMAL(10,2) DEFAULT 0 COMMENT '累计消费金额',
  `status` TINYINT DEFAULT 1 COMMENT '状态: 0-禁用, 1-正常',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at` TIMESTAMP NULL DEFAULT NULL COMMENT '删除时间',
  INDEX idx_openid (`openid`),
  INDEX idx_phone (`phone`),
  INDEX idx_status (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='小程序用户表';

-- ============================================
-- 2. 商品分类表
-- ============================================
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL COMMENT '分类名称',
  `icon` VARCHAR(500) COMMENT '分类图标',
  `parent_id` INT DEFAULT 0 COMMENT '父分类ID',
  `order_num` INT DEFAULT 0 COMMENT '显示顺序',
  `status` TINYINT DEFAULT 1 COMMENT '状态: 0-禁用, 1-启用',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at` TIMESTAMP NULL DEFAULT NULL COMMENT '删除时间',
  INDEX idx_parent_id (`parent_id`),
  INDEX idx_status (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品分类表';

-- ============================================
-- 3. 商品表
-- ============================================
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(200) NOT NULL COMMENT '商品名称',
  `subtitle` VARCHAR(200) COMMENT '商品副标题',
  `category_id` INT NOT NULL COMMENT '分类ID',
  `main_image` VARCHAR(500) COMMENT '商品主图',
  `detail` TEXT COMMENT '商品详情',
  `min_price` DECIMAL(10,2) DEFAULT 0 COMMENT '最低价格',
  `max_price` DECIMAL(10,2) DEFAULT 0 COMMENT '最高价格',
  `sales` INT DEFAULT 0 COMMENT '销量',
  `stock` INT DEFAULT 0 COMMENT '库存',
  `sort_order` INT DEFAULT 0 COMMENT '排序值',
  `is_recommend` TINYINT DEFAULT 0 COMMENT '是否推荐: 0-否, 1-是',
  `is_new` TINYINT DEFAULT 0 COMMENT '是否新品: 0-否, 1-是',
  `status` TINYINT DEFAULT 1 COMMENT '状态: 0-下架, 1-上架',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at` TIMESTAMP NULL DEFAULT NULL COMMENT '删除时间',
  INDEX idx_category_id (`category_id`),
  INDEX idx_status (`status`),
  INDEX idx_is_recommend (`is_recommend`),
  INDEX idx_is_new (`is_new`),
  CONSTRAINT `fk_products_category_id` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品表';

-- ============================================
-- 4. 商品规格表
-- ============================================
DROP TABLE IF EXISTS `product_skus`;
CREATE TABLE `product_skus` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `product_id` INT NOT NULL COMMENT '商品ID',
  `sku_code` VARCHAR(100) NOT NULL UNIQUE COMMENT 'SKU编码',
  `spec_name` VARCHAR(200) NOT NULL COMMENT '规格名称',
  `spec_values` TEXT NOT NULL COMMENT '规格值(JSON)',
  `price` DECIMAL(10,2) NOT NULL COMMENT '价格',
  `original_price` DECIMAL(10,2) COMMENT '原价',
  `stock` INT DEFAULT 0 COMMENT '库存',
  `sales` INT DEFAULT 0 COMMENT '销量',
  `image` VARCHAR(500) COMMENT 'SKU图片',
  `status` TINYINT DEFAULT 1 COMMENT '状态: 0-禁用, 1-启用',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at` TIMESTAMP NULL DEFAULT NULL COMMENT '删除时间',
  INDEX idx_product_id (`product_id`),
  INDEX idx_sku_code (`sku_code`),
  INDEX idx_status (`status`),
  CONSTRAINT `fk_product_skus_product_id` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品规格表';

-- ============================================
-- 5. 商品图片表
-- ============================================
DROP TABLE IF EXISTS `product_images`;
CREATE TABLE `product_images` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `product_id` INT NOT NULL COMMENT '商品ID',
  `url` VARCHAR(500) NOT NULL COMMENT '图片URL',
  `sort_order` INT DEFAULT 0 COMMENT '排序值',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at` TIMESTAMP NULL DEFAULT NULL COMMENT '删除时间',
  INDEX idx_product_id (`product_id`),
  CONSTRAINT `fk_product_images_product_id` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品图片表';

-- ============================================
-- 6. 购物车表
-- ============================================
DROP TABLE IF EXISTS `cart_items`;
CREATE TABLE `cart_items` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT NOT NULL COMMENT '用户ID',
  `product_id` INT NOT NULL COMMENT '商品ID',
  `sku_id` INT NOT NULL COMMENT 'SKU ID',
  `quantity` INT DEFAULT 1 COMMENT '商品数量',
  `is_selected` TINYINT DEFAULT 1 COMMENT '是否选中: 0-否, 1-是',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at` TIMESTAMP NULL DEFAULT NULL COMMENT '删除时间',
  INDEX idx_user_id (`user_id`),
  INDEX idx_product_id (`product_id`),
  INDEX idx_sku_id (`sku_id`),
  UNIQUE KEY uk_user_sku (`user_id`, `sku_id`, `deleted_at`),
  CONSTRAINT `fk_cart_items_user_id` FOREIGN KEY (`user_id`) REFERENCES `miniapp_users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_cart_items_product_id` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_cart_items_sku_id` FOREIGN KEY (`sku_id`) REFERENCES `product_skus` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='购物车表';

-- ============================================
-- 7. 收货地址表
-- ============================================
DROP TABLE IF EXISTS `addresses`;
CREATE TABLE `addresses` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT NOT NULL COMMENT '用户ID',
  `receiver_name` VARCHAR(50) NOT NULL COMMENT '收货人姓名',
  `receiver_phone` VARCHAR(20) NOT NULL COMMENT '收货人电话',
  `province` VARCHAR(50) NOT NULL COMMENT '省份',
  `city` VARCHAR(50) NOT NULL COMMENT '城市',
  `district` VARCHAR(50) NOT NULL COMMENT '区县',
  `detail_address` VARCHAR(200) NOT NULL COMMENT '详细地址',
  `postal_code` VARCHAR(10) COMMENT '邮政编码',
  `is_default` TINYINT DEFAULT 0 COMMENT '是否默认地址: 0-否, 1-是',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at` TIMESTAMP NULL DEFAULT NULL COMMENT '删除时间',
  INDEX idx_user_id (`user_id`),
  INDEX idx_is_default (`is_default`),
  CONSTRAINT `fk_addresses_user_id` FOREIGN KEY (`user_id`) REFERENCES `miniapp_users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='收货地址表';

-- ============================================
-- 8. 订单表
-- ============================================
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `order_no` VARCHAR(50) NOT NULL UNIQUE COMMENT '订单号',
  `user_id` INT NOT NULL COMMENT '用户ID',
  `status` TINYINT DEFAULT 0 COMMENT '订单状态: 0-待付款, 1-待发货, 2-待收货, 3-已完成, 4-已取消',
  `total_amount` DECIMAL(10,2) NOT NULL COMMENT '商品总金额',
  `shipping_fee` DECIMAL(10,2) DEFAULT 0 COMMENT '运费',
  `discount_amount` DECIMAL(10,2) DEFAULT 0 COMMENT '优惠金额',
  `pay_amount` DECIMAL(10,2) NOT NULL COMMENT '实付金额',
  `address_id` INT NULL COMMENT '收货地址ID',
  `receiver_name` VARCHAR(50) NULL COMMENT '收货人姓名',
  `receiver_phone` VARCHAR(20) NULL COMMENT '收货人电话',
  `receiver_address` VARCHAR(500) NULL COMMENT '收货地址',
  `remark` VARCHAR(500) COMMENT '订单备注',
  `pay_type` TINYINT DEFAULT 0 COMMENT '支付方式: 0-未支付, 1-微信支付, 2-余额支付',
  `pay_time` DATETIME COMMENT '支付时间',
  `ship_time` DATETIME COMMENT '发货时间',
  `confirm_time` DATETIME COMMENT '确认收货时间',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at` TIMESTAMP NULL DEFAULT NULL COMMENT '删除时间',
  INDEX idx_order_no (`order_no`),
  INDEX idx_user_id (`user_id`),
  INDEX idx_status (`status`),
  INDEX idx_created_at (`created_at`),
  CONSTRAINT `fk_orders_user_id` FOREIGN KEY (`user_id`) REFERENCES `miniapp_users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_orders_address_id` FOREIGN KEY (`address_id`) REFERENCES `addresses` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单表';

-- ============================================
-- 9. 订单详情表
-- ============================================
DROP TABLE IF EXISTS `order_items`;
CREATE TABLE `order_items` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `order_id` INT NOT NULL COMMENT '订单ID',
  `product_id` INT NOT NULL COMMENT '商品ID',
  `product_name` VARCHAR(200) NOT NULL COMMENT '商品名称',
  `sku_id` INT NOT NULL COMMENT 'SKU ID',
  `spec_name` VARCHAR(200) NOT NULL COMMENT '规格名称',
  `image` VARCHAR(500) COMMENT '商品图片',
  `price` DECIMAL(10,2) NOT NULL COMMENT '单价',
  `quantity` INT NOT NULL COMMENT '数量',
  `subtotal` DECIMAL(10,2) NOT NULL COMMENT '小计金额',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at` TIMESTAMP NULL DEFAULT NULL COMMENT '删除时间',
  INDEX idx_order_id (`order_id`),
  INDEX idx_product_id (`product_id`),
  INDEX idx_sku_id (`sku_id`),
  CONSTRAINT `fk_order_items_order_id` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_order_items_product_id` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_order_items_sku_id` FOREIGN KEY (`sku_id`) REFERENCES `product_skus` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单详情表';

-- ============================================
-- 10. 轮播图表
-- ============================================
DROP TABLE IF EXISTS `banners`;
CREATE TABLE `banners` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `title` VARCHAR(100) NOT NULL COMMENT '标题',
  `image` VARCHAR(500) NOT NULL COMMENT '图片URL',
  `link_type` TINYINT DEFAULT 0 COMMENT '跳转类型: 0-无, 1-商品, 2-分类, 3-链接',
  `link_value` VARCHAR(500) COMMENT '跳转值',
  `sort_order` INT DEFAULT 0 COMMENT '排序值',
  `status` TINYINT DEFAULT 1 COMMENT '状态: 0-禁用, 1-启用',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at` TIMESTAMP NULL DEFAULT NULL COMMENT '删除时间',
  INDEX idx_status (`status`),
  INDEX idx_sort_order (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='轮播图表';

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- 测试数据插入
-- ============================================

-- ============================================
-- 1. 插入小程序用户测试数据
-- ============================================
-- 注意：密码都是 qwe123 (bcrypt加密)
INSERT INTO `miniapp_users` (`id`, `openid`, `unionid`, `nickname`, `avatar`, `phone`, `password`, `gender`, `balance`, `points`, `member_level`, `total_consumption`, `status`) VALUES
(1, 'oUpF8uMuAJO_M2pxb1Q9zNjWeS6o', 'oUpF8uMuAJO_M2pxb1Q9zNjWeS6o_union', '张三', 'https://picsum.photos/200/200', '13800138001', '$2b$10$G./q24s9U1PSu/JhFEHVT.gqBy9ynK/E8uaGAv.w4pYbGP6ess9HS', 1, 1000.00, 500, 1, 2500.00, 1),
(2, 'oUpF8uMuAJO_M2pxb1Q9zNjWeS6p', 'oUpF8uMuAJO_M2pxb1Q9zNjWeS6p_union', '李四', 'https://picsum.photos/200/200', '13800138002', '$2b$10$G./q24s9U1PSu/JhFEHVT.gqBy9ynK/E8uaGAv.w4pYbGP6ess9HS', 2, 500.00, 200, 0, 800.00, 1),
(3, 'oUpF8uMuAJO_M2pxb1Q9zNjWeS6q', 'oUpF8uMuAJO_M2pxb1Q9zNjWeS6q_union', '王五', 'https://picsum.photos/200/200', '13800138003', '$2b$10$G./q24s9U1PSu/JhFEHVT.gqBy9ynK/E8uaGAv.w4pYbGP6ess9HS', 1, 2000.00, 1000, 2, 5000.00, 1),
(4, 'oUpF8uMuAJO_M2pxb1Q9zNjWeS6r', NULL, '赵六', 'https://picsum.photos/200/200', NULL, NULL, 0, 0.00, 0, 0, 0.00, 1);

-- ============================================
-- 2. 插入商品分类测试数据
-- ============================================
INSERT INTO `categories` (`id`, `name`, `icon`, `parent_id`, `order_num`, `status`) VALUES
(1, '手机数码', 'https://picsum.photos/200/200', 0, 1, 1),
(2, '电脑办公', 'https://picsum.photos/200/200', 0, 2, 1),
(3, '服装鞋帽', 'https://picsum.photos/200/200', 0, 3, 1),
(4, '食品生鲜', 'https://picsum.photos/200/200', 0, 4, 1),
(5, '智能手机', 'https://picsum.photos/200/200', 1, 1, 1),
(6, '平板电脑', 'https://picsum.photos/200/200', 1, 2, 1),
(7, '笔记本电脑', 'https://picsum.photos/200/200', 2, 1, 1),
(8, '台式电脑', 'https://picsum.photos/200/200', 2, 2, 1);

-- ============================================
-- 3. 插入商品测试数据
-- ============================================
INSERT INTO `products` (`id`, `name`, `subtitle`, `category_id`, `main_image`, `detail`, `min_price`, `max_price`, `sales`, `stock`, `sort_order`, `is_recommend`, `is_new`, `status`) VALUES
(1, 'iPhone 15 Pro Max', '钛金属设计，A17 Pro芯片，专业级摄影', 5, 'https://picsum.photos/200/200', '<p>iPhone 15 Pro Max 是苹果最新旗舰手机，采用钛金属材质，配备A17 Pro芯片，支持专业级摄影功能。</p>', 8999.00, 12999.00, 1250, 500, 1, 1, 1, 1),
(2, '华为 Mate 60 Pro', '麒麟9000S芯片，卫星通信，超强续航', 5, 'https://picsum.photos/200/200', '<p>华为 Mate 60 Pro 搭载麒麟9000S芯片，支持卫星通信，拥有超强续航能力。</p>', 6999.00, 8999.00, 890, 300, 2, 1, 0, 1),
(3, '小米 14 Ultra', '徕卡影像，骁龙8 Gen3，2K屏幕', 5, 'https://picsum.photos/200/200', '<p>小米 14 Ultra 配备徕卡影像系统，搭载骁龙8 Gen3处理器，2K高清屏幕。</p>', 5999.00, 6999.00, 650, 200, 3, 0, 1, 1),
(4, 'MacBook Pro 16英寸', 'M3 Max芯片，32GB内存，1TB存储', 7, 'https://picsum.photos/200/200', '<p>MacBook Pro 16英寸配备M3 Max芯片，32GB统一内存，1TB固态存储，专业级性能。</p>', 19999.00, 29999.00, 320, 100, 1, 1, 1, 1),
(5, 'iPad Pro 12.9英寸', 'M2芯片，Liquid Retina XDR显示屏', 6, 'https://picsum.photos/200/200', '<p>iPad Pro 12.9英寸搭载M2芯片，配备Liquid Retina XDR显示屏，支持Apple Pencil。</p>', 6799.00, 9299.00, 450, 150, 1, 1, 0, 1),
(6, 'Nike Air Max 270', '经典气垫，舒适缓震，时尚百搭', 3, 'https://picsum.photos/200/200', '<p>Nike Air Max 270 经典气垫设计，提供舒适缓震，时尚百搭。</p>', 899.00, 1299.00, 1200, 800, 1, 0, 0, 1),
(7, '有机苹果 5kg装', '新鲜有机，脆甜多汁，产地直供', 4, 'https://picsum.photos/200/200', '<p>有机苹果，新鲜有机认证，脆甜多汁，产地直供，5kg装。</p>', 49.90, 79.90, 2500, 2000, 1, 0, 0, 1);

-- ============================================
-- 4. 插入商品规格测试数据
-- ============================================
INSERT INTO `product_skus` (`id`, `product_id`, `sku_code`, `spec_name`, `spec_values`, `price`, `original_price`, `stock`, `sales`, `image`, `status`) VALUES
-- iPhone 15 Pro Max SKU
  (1, 1, 'IPHONE15PM-256-BLACK', '256GB 深空黑色', '{"storage":"256GB","color":"深空黑色"}', 8999.00, 9999.00, 150, 300, 'https://picsum.photos/200/200', 1),
(2, 1, 'IPHONE15PM-512-BLACK', '512GB 深空黑色', '{"storage":"512GB","color":"深空黑色"}', 10999.00, 11999.00, 100, 200, 'https://picsum.photos/200/200', 1),
(3, 1, 'IPHONE15PM-1TB-BLACK', '1TB 深空黑色', '{"storage":"1TB","color":"深空黑色"}', 12999.00, 13999.00, 50, 100, 'https://picsum.photos/200/200', 1),
(4, 1, 'IPHONE15PM-256-WHITE', '256GB 原色钛金属', '{"storage":"256GB","color":"原色钛金属"}', 8999.00, 9999.00, 100, 250, 'https://picsum.photos/200/200', 1),
(5, 1, 'IPHONE15PM-512-WHITE', '512GB 原色钛金属', '{"storage":"512GB","color":"原色钛金属"}', 10999.00, 11999.00, 80, 180, 'https://picsum.photos/200/200', 1),
(30, 1, 'IPHONE15PM-256-BLUE', '256GB 蓝色钛金属', '{"storage":"256GB","color":"蓝色钛金属"}', 8999.00, 9999.00, 90, 220, 'https://picsum.photos/200/200', 1),
(31, 1, 'IPHONE15PM-512-BLUE', '512GB 蓝色钛金属', '{"storage":"512GB","color":"蓝色钛金属"}', 10999.00, 11999.00, 70, 150, 'https://picsum.photos/200/200', 1),
(32, 1, 'IPHONE15PM-1TB-WHITE', '1TB 原色钛金属', '{"storage":"1TB","color":"原色钛金属"}', 12999.00, 13999.00, 40, 80, 'https://picsum.photos/200/200', 1),
-- 华为 Mate 60 Pro SKU
(6, 2, 'MATE60PRO-256-BLACK', '256GB 雅川青', '{"storage":"256GB","color":"雅川青"}', 6999.00, 7999.00, 100, 200, 'https://picsum.photos/200/200', 1),
(7, 2, 'MATE60PRO-512-BLACK', '512GB 雅川青', '{"storage":"512GB","color":"雅川青"}', 7999.00, 8999.00, 80, 150, 'https://picsum.photos/200/200', 1),
(8, 2, 'MATE60PRO-1TB-BLACK', '1TB 雅川青', '{"storage":"1TB","color":"雅川青"}', 8999.00, 9999.00, 50, 100, 'https://picsum.photos/200/200', 1),
(24, 2, 'MATE60PRO-256-WHITE', '256GB 白沙银', '{"storage":"256GB","color":"白沙银"}', 6999.00, 7999.00, 90, 180, 'https://picsum.photos/200/200', 1),
(25, 2, 'MATE60PRO-512-WHITE', '512GB 白沙银', '{"storage":"512GB","color":"
-- 小米 14 Ultra SKU
(9, 3, 'MI14ULTRA-256-BLACK', '256GB 黑色', '{"storage":"256GB","color":"黑色"}', 5999.00, 6499.00, 80, 120, 'https://picsum.photos/200/200', 1),
(10, 3, 'MI14ULTRA-512-BLACK', '512GB 黑色', '{"storage":"512GB","color":"黑色"}', 6499.00, 6999.00, 60, 100, 'https://picsum.photos/200/200', 1),
(27, 3, 'MI14ULTRA-256-WHITE', '256GB 白色', '{"storage":"256GB","color":"白色"}', 5999.00, 6499.00, 75, 110, 'https://picsum.photos/200/200', 1),
(28, 3, 'MI14ULTRA-512-WHITE', '512GB 白色', '{"storage":"512GB","color":"白色"}', 6499.00, 6999.00, 55, 90, 'https://picsum.photos/200/200', 1),
(29, 3, 'MI14ULTRA-256-BLUE', '256GB 蓝色', '{"storage":"256GB","color":"蓝色"}', 5999.00, 6499.00, 70, 100, 'https://picsum.photos/200/200', 1),
-- MacBook Pro SKU
(11, 4, 'MBP16-M3MAX-32GB-1TB', 'M3 Max 32GB 1TB 深空灰色', '{"chip":"M3 Max","memory":"32GB","storage":"1TB","color":"深空灰色"}', 19999.00, 21999.00, 30, 50, 'https://example.com/skus/mbp16-m3max.jpg', 1),
(12, 4, 'MBP16-M3MAX-64GB-2TB', 'M3 Max 64GB 2TB 深空灰色', '{"chip":"M3 Max","memory":"64GB","storage":"2TB","color":"深空灰色"}', 25999.00, 27999.00, 20, 30, 'https://example.com/skus/mbp16-m3max-64gb.jpg', 1),
(13, 4, 'MBP16-M3MAX-32GB-1TB-SILVER', 'M3 Max 32GB 1TB 银色', '{"chip":"M3 Max","memory":"32GB","storage":"1TB","color":"银色"}', 19999.00, 21999.00, 25, 40, 'https://example.com/skus/mbp16-m3max-silver.jpg', 1),
-- iPad Pro SKU
(14, 5, 'IPADPRO-128GB-WIFI', '128GB WiFi版', '{"storage":"128GB","network":"WiFi"}', 6799.00, 7299.00, 50, 80, 'https://picsum.photos/200/200', 1),
(15, 5, 'IPADPRO-256GB-WIFI', '256GB WiFi版', '{"storage":"256GB","network":"WiFi"}', 7599.00, 8099.00, 40, 70, 'https://picsum.photos/200/200', 1),
(16, 5, 'IPADPRO-512GB-WIFI', '512GB WiFi版', '{"storage":"512GB","network":"WiFi"}', 9299.00, 9799.00, 30, 50, 'https://picsum.photos/200/200', 1),
(33, 5, 'IPADPRO-128GB-CELLULAR', '128GB 蜂窝网络版', '{"storage":"128GB","network":"Cellular"}', 7799.00, 8299.00, 45, 70, 'https://picsum.photos/200/200', 1),
(34, 5, 'IPADPRO-256GB-CELLULAR', '256GB 蜂窝网络版', '{"storage":"256GB","network":"Cellular"}', 8599.00, 9099.00, 35, 60, 'https://picsum.photos/200/200', 1),
(35, 5, 'IPADPRO-512GB-CELLULAR', '512GB 蜂窝网络版', '{"storage":"512GB","network":"Cellular"}', 10299.00, 10799.00, 25, 40, 'https://picsum.photos/200/200', 1),
-- Nike Air Max 270 SKU
(17, 6, 'NIKE270-42-BLACK', '42码 黑色', '{"size":"42","color":"黑色"}', 899.00, 1299.00, 200, 300, 'https://picsum.photos/200/200', 1),
(18, 6, 'NIKE270-43-BLACK', '43码 黑色', '{"size":"43","color":"黑色"}', 899.00, 1299.00, 180, 280, 'https://picsum.photos/200/200', 1),
(19, 6, 'NIKE270-44-BLACK', '44码 黑色', '{"size":"44","color":"黑色"}', 899.00, 1299.00, 150, 250, 'https://picsum.photos/200/200', 1),
(20, 6, 'NIKE270-42-WHITE', '42码 白色', '{"size":"42","color":"白色"}', 999.00, 1299.00, 150, 200, 'https://picsum.photos/200/200', 1),
(36, 6, 'NIKE270-43-WHITE', '43码 白色', '{"size":"43","color":"白色"}', 999.00, 1299.00, 130, 180, 'https://picsum.photos/200/200', 1),
(37, 6, 'NIKE270-44-WHITE', '44码 白色', '{"size":"44","color":"白色"}', 999.00, 1299.00, 120, 160, 'https://picsum.photos/200/200', 1),
(38, 6, 'NIKE270-41-BLACK', '41码 黑色', '{"size":"41","color":"黑色"}', 899.00, 1299.00, 100, 150, 'https://picsum.photos/200/200', 1),
(39, 6, 'NIKE270-45-BLACK', '45码 黑色', '{"size":"45","color":"黑色"}', 899.00, 1299.00, 80, 120, 'https://picsum.photos/200/200', 1),
(40, 6, 'NIKE270-42-RED', '42码 红色', '{"size":"42","color":"红色"}', 1099.00, 1299.00, 90, 130, 'https://picsum.photos/200/200', 1),
-- 有机苹果 SKU
(21, 7, 'APPLE-5KG-RED', '5kg 红富士', '{"weight":"5kg","variety":"红富士"}', 49.90, 79.90, 1000, 800, 'https://picsum.photos/200/200', 1),
(22, 7, 'APPLE-5KG-GREEN', '5kg 青苹果', '{"weight":"5kg","variety":"青苹果"}', 59.90, 79.90, 800, 600, 'https://picsum.photos/200/200', 1),
(23, 7, 'APPLE-10KG-RED', '10kg 红富士', '{"weight":"10kg","variety":"红富士"}', 89.90, 129.90, 500, 400, 'https://picsum.photos/200/200', 1),
(41, 7, 'APPLE-10KG-GREEN', '10kg 青苹果', '{"weight":"10kg","variety":"青苹果"}', 99.90, 129.90, 400, 350, 'https://picsum.photos/200/200', 1),
(42, 7, 'APPLE-3KG-RED', '3kg 红富士', '{"weight":"3kg","variety":"红富士"}', 29.90, 49.90, 1200, 1000, 'https://picsum.photos/200/200', 1),
(43, 7, 'APPLE-3KG-GREEN', '3kg 青苹果', '{"weight":"3kg","variety":"青苹果"}', 34.90, 49.90, 1000, 800, 'https://picsum.photos/200/200', 1);

-- ============================================
-- 5. 插入商品图片测试数据
-- ============================================
INSERT INTO `product_images` (`id`, `product_id`, `url`, `sort_order`) VALUES
-- iPhone 15 Pro Max 图片
(1, 1, 'https://picsum.photos/200/200', 1),
(2, 1, 'https://picsum.photos/200/200', 2),
(3, 1, 'https://picsum.photos/200/200', 3),
(5, 2, 'https://picsum.photos/200/200', 1),
(6, 2, 'https://picsum.photos/200/200', 2),
(7, 2, 'https://picsum.photos/200/200', 3),
-- 小米 14 Ultra 图片
(8, 3, 'https://example.com/products/mi14ultra-1.jpg', 1),
(9, 3, 'https://example.com/products/mi14ultra-2.jpg', 2),
(10, 3, 'https://example.com/products/mi14ultra-3.jpg', 3),
-- MacBook Pro 图片
(11, 4, 'https://example.com/products/mbp16-1.jpg', 1),
(12, 4, 'https://example.com/products/mbp16-2.jpg', 2),
(13, 4, 'https://example.com/products/mbp16-3.jpg', 3),
-- iPad Pro 图片
(14, 5, 'https://example.com/products/ipadpro-1.jpg', 1),
(15, 5, 'https://example.com/products/ipadpro-2.jpg', 2),
-- Nike Air Max 270 图片
(16, 6, 'https://example.com/products/nike270-1.jpg', 1),
(17, 6, 'https://example.com/products/nike270-2.jpg', 2),
(18, 6, 'https://example.com/products/nike270-3.jpg', 3),
-- 有机苹果 图片
(19, 7, 'https://example.com/products/apple-1.jpg', 1),
(20, 7, 'https://example.com/products/apple-2.jpg', 2);

-- ============================================
-- 6. 插入购物车测试数据
-- ============================================
INSERT INTO `cart_items` (`id`, `user_id`, `product_id`, `sku_id`, `quantity`, `is_selected`) VALUES
(1, 1, 1, 1, 1, 1),
(2, 1, 2, 6, 1, 1),
(3, 1, 5, 14, 2, 1),
(4, 2, 3, 9, 1, 1),
(5, 2, 6, 17, 1, 0),
(6, 3, 4, 11, 1, 1);

-- ============================================
-- 7. 插入收货地址测试数据
-- ============================================
INSERT INTO `addresses` (`id`, `user_id`, `receiver_name`, `receiver_phone`, `province`, `city`, `district`, `detail_address`, `postal_code`, `is_default`) VALUES
(1, 1, '张三', '13800138001', '广东省', '深圳市', '南山区', '科技园南区深南大道9988号', '518000', 1),
(2, 1, '张三', '13800138001', '广东省', '广州市', '天河区', '天河路123号', '510000', 0),
(3, 2, '李四', '13800138002', '北京市', '北京市', '朝阳区', '建国路88号', '100000', 1),
(4, 3, '王五', '13800138003', '上海市', '上海市', '浦东新区', '陆家嘴环路1000号', '200000', 1),
(5, 3, '王五', '13800138003', '上海市', '上海市', '黄浦区', '南京东路100号', '200001', 0);

-- ============================================
-- 8. 插入订单测试数据
-- ============================================
INSERT INTO `orders` (`id`, `order_no`, `user_id`, `status`, `total_amount`, `shipping_fee`, `discount_amount`, `pay_amount`, `address_id`, `receiver_name`, `receiver_phone`, `receiver_address`, `remark`, `pay_type`, `pay_time`, `ship_time`, `confirm_time`) VALUES
(1, '202401011234567890', 1, 3, 8999.00, 0.00, 0.00, 8999.00, 1, '张三', '13800138001', '广东省深圳市南山区科技园南区深南大道9988号', NULL, 1, '2024-01-01 10:30:00', '2024-01-02 14:20:00', '2024-01-05 16:45:00'),
(2, '202401021234567891', 1, 2, 6999.00, 0.00, 0.00, 6999.00, 1, '张三', '13800138001', '广东省深圳市南山区科技园南区深南大道9988号', '请尽快发货', 1, '2024-01-02 11:00:00', '2024-01-03 09:15:00', NULL),
(3, '202401031234567892', 2, 1, 5999.00, 0.00, 0.00, 5999.00, 3, '李四', '13800138002', '北京市北京市朝阳区建国路88号', NULL, 1, '2024-01-03 15:20:00', NULL, NULL),
(4, '202401041234567893', 3, 0, 19999.00, 0.00, 0.00, 19999.00, 4, '王五', '13800138003', '上海市上海市浦东新区陆家嘴环路1000号', NULL, 0, NULL, NULL, NULL),
(5, '202401051234567894', 3, 3, 13598.00, 0.00, 0.00, 13598.00, 4, '王五', '13800138003', '上海市上海市浦东新区陆家嘴环路1000号', NULL, 1, '2024-01-05 09:00:00', '2024-01-06 10:30:00', '2024-01-08 14:20:00');

-- ============================================
-- 9. 插入订单详情测试数据
-- ============================================
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `sku_id`, `spec_name`, `image`, `price`, `quantity`, `subtotal`) VALUES
-- 订单1：iPhone 15 Pro Max 256GB
(1, 1, 1, 'iPhone 15 Pro Max', 1, '256GB 深空黑色', 'https://example.com/skus/iphone15pm-256-black.jpg', 8999.00, 1, 8999.00),
-- 订单2：华为 Mate 60 Pro 256GB
(2, 2, 2, '华为 Mate 60 Pro', 6, '256GB 雅川青', 'https://example.com/skus/mate60pro-256-black.jpg', 6999.00, 1, 6999.00),
-- 订单3：小米 14 Ultra 256GB
(3, 3, 3, '小米 14 Ultra', 9, '256GB 黑色', 'https://example.com/skus/mi14ultra-256-black.jpg', 5999.00, 1, 5999.00),
-- 订单4：MacBook Pro 16英寸
(4, 4, 4, 'MacBook Pro 16英寸', 11, 'M3 Max 32GB 1TB 深空灰色', 'https://example.com/skus/mbp16-m3max.jpg', 19999.00, 1, 19999.00),
-- 订单5：iPad Pro 128GB + iPad Pro 256GB
(5, 5, 5, 'iPad Pro 12.9英寸', 14, '128GB WiFi版', 'https://example.com/skus/ipadpro-128gb.jpg', 6799.00, 1, 6799.00),
(6, 5, 5, 'iPad Pro 12.9英寸', 15, '256GB WiFi版', 'https://example.com/skus/ipadpro-256gb.jpg', 7599.00, 1, 7599.00);

-- ============================================
-- 10. 插入轮播图测试数据
-- ============================================
INSERT INTO `banners` (`id`, `title`, `image`, `link_type`, `link_value`, `sort_order`, `status`) VALUES
(1, '春季新品上市', 'https://example.com/banners/spring2024.jpg', 1, '1', 1, 1),
(2, 'iPhone 15 Pro Max 热销中', 'https://example.com/banners/iphone15pm.jpg', 1, '1', 2, 1),
(3, 'MacBook Pro 限时优惠', 'https://example.com/banners/mbp16.jpg', 1, '4', 3, 1),
(4, '手机数码专场', 'https://example.com/banners/phone-category.jpg', 2, '1', 4, 1),
(5, '更多优惠等你来', 'https://example.com/banners/more-deals.jpg', 3, 'https://example.com/activity', 5, 1);
