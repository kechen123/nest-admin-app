-- ============================================
-- 商城管理菜单数据（分类结构）
-- 注意：菜单ID从200开始，避免与现有菜单冲突
-- ============================================

-- ============================================
-- 一级目录
-- ============================================

-- 1. 商城管理（一级目录）
INSERT INTO `menus` (`id`, `name`, `title`, `permission_code`, `menu_type`, `path`, `component`, `query`, `is_frame`, `is_cache`, `visible`, `status`, `icon`, `parent_id`, `order_num`, `remark`) VALUES
(200, 'Mall', '商城管理', NULL, 'M', '/mall', 'Layout', NULL, 1, 0, 1, 1, 'ShoppingBag', 0, 3, '商城管理模块');

-- ============================================
-- 二级目录（分类）
-- ============================================

-- 2. 商品管理（二级目录）
INSERT INTO `menus` (`id`, `name`, `title`, `permission_code`, `menu_type`, `path`, `component`, `query`, `is_frame`, `is_cache`, `visible`, `status`, `icon`, `parent_id`, `order_num`, `remark`) VALUES
(201, 'ProductManage', '商品管理', NULL, 'M', '/mall/product', 'Layout', NULL, 1, 0, 1, 1, 'Goods', 200, 1, '商品相关管理');

-- 3. 订单管理（二级目录）
INSERT INTO `menus` (`id`, `name`, `title`, `permission_code`, `menu_type`, `path`, `component`, `query`, `is_frame`, `is_cache`, `visible`, `status`, `icon`, `parent_id`, `order_num`, `remark`) VALUES
(206, 'OrderManage', '订单管理', NULL, 'M', '/mall/order', 'Layout', NULL, 1, 0, 1, 1, 'ShoppingCart', 200, 2, '订单相关管理');

-- 4. 用户管理（二级目录）
INSERT INTO `menus` (`id`, `name`, `title`, `permission_code`, `menu_type`, `path`, `component`, `query`, `is_frame`, `is_cache`, `visible`, `status`, `icon`, `parent_id`, `order_num`, `remark`) VALUES
(208, 'UserManage', '用户管理', NULL, 'M', '/mall/user', 'Layout', NULL, 1, 0, 1, 1, 'User', 200, 3, '用户相关管理');

-- 5. 内容管理（二级目录）
INSERT INTO `menus` (`id`, `name`, `title`, `permission_code`, `menu_type`, `path`, `component`, `query`, `is_frame`, `is_cache`, `visible`, `status`, `icon`, `parent_id`, `order_num`, `remark`) VALUES
(210, 'ContentManage', '内容管理', NULL, 'M', '/mall/content', 'Layout', NULL, 1, 0, 1, 1, 'Document', 200, 4, '内容相关管理');

-- 6. 数据统计（二级目录）
INSERT INTO `menus` (`id`, `name`, `title`, `permission_code`, `menu_type`, `path`, `component`, `query`, `is_frame`, `is_cache`, `visible`, `status`, `icon`, `parent_id`, `order_num`, `remark`) VALUES
(212, 'StatisticsManage', '数据统计', NULL, 'M', '/mall/statistics', 'Layout', NULL, 1, 0, 1, 1, 'DataAnalysis', 200, 5, '数据统计分析');

-- 7. 库存管理（二级目录）
INSERT INTO `menus` (`id`, `name`, `title`, `permission_code`, `menu_type`, `path`, `component`, `query`, `is_frame`, `is_cache`, `visible`, `status`, `icon`, `parent_id`, `order_num`, `remark`) VALUES
(214, 'InventoryManage', '库存管理', NULL, 'M', '/mall/inventory', 'Layout', NULL, 1, 0, 1, 1, 'Box', 200, 6, '库存相关管理');

-- ============================================
-- 三级菜单（具体功能页面）
-- ============================================

-- 商品管理下的菜单
INSERT INTO `menus` (`id`, `name`, `title`, `permission_code`, `menu_type`, `path`, `component`, `query`, `is_frame`, `is_cache`, `visible`, `status`, `icon`, `parent_id`, `order_num`, `remark`) VALUES
(202, 'CategoryManage', '商品分类管理', 'mall:category:list', 'C', '/mall/product/category', 'mall/product/category/index', NULL, 1, 0, 1, 1, 'Folder', 201, 1, '商品分类管理'),
(203, 'ProductList', '商品管理', 'mall:product:list', 'C', '/mall/product/list', 'mall/product/list/index', NULL, 1, 0, 1, 1, 'Goods', 201, 2, '商品列表管理'),
(204, 'ProductSkuManage', '商品规格管理', 'mall:product:sku:list', 'C', '/mall/product/sku', 'mall/product/sku/index', NULL, 1, 0, 1, 1, 'Box', 201, 3, '商品规格管理');

-- 订单管理下的菜单
INSERT INTO `menus` (`id`, `name`, `title`, `permission_code`, `menu_type`, `path`, `component`, `query`, `is_frame`, `is_cache`, `visible`, `status`, `icon`, `parent_id`, `order_num`, `remark`) VALUES
(207, 'OrderList', '订单管理', 'mall:order:list', 'C', '/mall/order/list', 'mall/order/list/index', NULL, 1, 0, 1, 1, 'ShoppingCart', 206, 1, '订单列表管理');

-- 用户管理下的菜单
INSERT INTO `menus` (`id`, `name`, `title`, `permission_code`, `menu_type`, `path`, `component`, `query`, `is_frame`, `is_cache`, `visible`, `status`, `icon`, `parent_id`, `order_num`, `remark`) VALUES
(209, 'MiniappUserList', '小程序用户管理', 'mall:miniapp:user:list', 'C', '/mall/user/miniapp', 'mall/user/miniapp/index', NULL, 1, 0, 1, 1, 'User', 208, 1, '小程序用户管理');

-- 内容管理下的菜单
INSERT INTO `menus` (`id`, `name`, `title`, `permission_code`, `menu_type`, `path`, `component`, `query`, `is_frame`, `is_cache`, `visible`, `status`, `icon`, `parent_id`, `order_num`, `remark`) VALUES
(211, 'BannerManage', '轮播图管理', 'mall:banner:list', 'C', '/mall/content/banner', 'mall/content/banner/index', NULL, 1, 0, 1, 1, 'PictureRounded', 210, 1, '轮播图管理');

-- 数据统计下的菜单
INSERT INTO `menus` (`id`, `name`, `title`, `permission_code`, `menu_type`, `path`, `component`, `query`, `is_frame`, `is_cache`, `visible`, `status`, `icon`, `parent_id`, `order_num`, `remark`) VALUES
(213, 'Statistics', '数据统计', 'mall:statistics:list', 'C', '/mall/statistics/index', 'mall/statistics/index', NULL, 1, 0, 1, 1, 'DataAnalysis', 212, 1, '数据统计分析');

-- 库存管理下的菜单
INSERT INTO `menus` (`id`, `name`, `title`, `permission_code`, `menu_type`, `path`, `component`, `query`, `is_frame`, `is_cache`, `visible`, `status`, `icon`, `parent_id`, `order_num`, `remark`) VALUES
(215, 'InventoryList', '库存管理', 'mall:inventory:list', 'C', '/mall/inventory/list', 'mall/inventory/list/index', NULL, 1, 0, 1, 1, 'Box', 214, 1, '库存列表管理');

-- ============================================
-- 按钮权限（F类型）
-- ============================================

-- 商品分类管理按钮
INSERT INTO `menus` (`id`, `name`, `title`, `permission_code`, `menu_type`, `path`, `component`, `query`, `is_frame`, `is_cache`, `visible`, `status`, `icon`, `parent_id`, `order_num`, `remark`) VALUES
(220, 'CategoryQuery', '分类查询', 'mall:category:query', 'F', NULL, NULL, NULL, 1, 0, 1, 1, '#', 202, 1, NULL),
(221, 'CategoryAdd', '分类新增', 'mall:category:add', 'F', NULL, NULL, NULL, 1, 0, 1, 1, '#', 202, 2, NULL),
(222, 'CategoryEdit', '分类修改', 'mall:category:edit', 'F', NULL, NULL, NULL, 1, 0, 1, 1, '#', 202, 3, NULL),
(223, 'CategoryDelete', '分类删除', 'mall:category:remove', 'F', NULL, NULL, NULL, 1, 0, 1, 1, '#', 202, 4, NULL);

-- 商品管理按钮
INSERT INTO `menus` (`id`, `name`, `title`, `permission_code`, `menu_type`, `path`, `component`, `query`, `is_frame`, `is_cache`, `visible`, `status`, `icon`, `parent_id`, `order_num`, `remark`) VALUES
(224, 'ProductQuery', '商品查询', 'mall:product:query', 'F', NULL, NULL, NULL, 1, 0, 1, 1, '#', 203, 1, NULL),
(225, 'ProductAdd', '商品新增', 'mall:product:add', 'F', NULL, NULL, NULL, 1, 0, 1, 1, '#', 203, 2, NULL),
(226, 'ProductEdit', '商品修改', 'mall:product:edit', 'F', NULL, NULL, NULL, 1, 0, 1, 1, '#', 203, 3, NULL),
(227, 'ProductDelete', '商品删除', 'mall:product:remove', 'F', NULL, NULL, NULL, 1, 0, 1, 1, '#', 203, 4, NULL),
(228, 'ProductStatus', '商品上架/下架', 'mall:product:status', 'F', NULL, NULL, NULL, 1, 0, 1, 1, '#', 203, 5, NULL),
(229, 'ProductExport', '商品导出', 'mall:product:export', 'F', NULL, NULL, NULL, 1, 0, 1, 1, '#', 203, 6, NULL);

-- 商品规格管理按钮
INSERT INTO `menus` (`id`, `name`, `title`, `permission_code`, `menu_type`, `path`, `component`, `query`, `is_frame`, `is_cache`, `visible`, `status`, `icon`, `parent_id`, `order_num`, `remark`) VALUES
(230, 'ProductSkuQuery', '规格查询', 'mall:product:sku:query', 'F', NULL, NULL, NULL, 1, 0, 1, 1, '#', 204, 1, NULL),
(231, 'ProductSkuAdd', '规格新增', 'mall:product:sku:add', 'F', NULL, NULL, NULL, 1, 0, 1, 1, '#', 204, 2, NULL),
(232, 'ProductSkuEdit', '规格修改', 'mall:product:sku:edit', 'F', NULL, NULL, NULL, 1, 0, 1, 1, '#', 204, 3, NULL),
(233, 'ProductSkuDelete', '规格删除', 'mall:product:sku:remove', 'F', NULL, NULL, NULL, 1, 0, 1, 1, '#', 204, 4, NULL),
(234, 'ProductSkuBatchStock', '批量更新库存', 'mall:product:sku:batch:stock', 'F', NULL, NULL, NULL, 1, 0, 1, 1, '#', 204, 5, NULL);


-- 订单管理按钮
INSERT INTO `menus` (`id`, `name`, `title`, `permission_code`, `menu_type`, `path`, `component`, `query`, `is_frame`, `is_cache`, `visible`, `status`, `icon`, `parent_id`, `order_num`, `remark`) VALUES
(239, 'OrderQuery', '订单查询', 'mall:order:query', 'F', NULL, NULL, NULL, 1, 0, 1, 1, '#', 207, 1, NULL),
(240, 'OrderDetail', '订单详情', 'mall:order:detail', 'F', NULL, NULL, NULL, 1, 0, 1, 1, '#', 207, 2, NULL),
(241, 'OrderShip', '订单发货', 'mall:order:ship', 'F', NULL, NULL, NULL, 1, 0, 1, 1, '#', 207, 3, NULL),
(242, 'OrderCancel', '取消订单', 'mall:order:cancel', 'F', NULL, NULL, NULL, 1, 0, 1, 1, '#', 207, 4, NULL),
(243, 'OrderExport', '订单导出', 'mall:order:export', 'F', NULL, NULL, NULL, 1, 0, 1, 1, '#', 207, 5, NULL);

-- 小程序用户管理按钮
INSERT INTO `menus` (`id`, `name`, `title`, `permission_code`, `menu_type`, `path`, `component`, `query`, `is_frame`, `is_cache`, `visible`, `status`, `icon`, `parent_id`, `order_num`, `remark`) VALUES
(244, 'MiniappUserQuery', '用户查询', 'mall:miniapp:user:query', 'F', NULL, NULL, NULL, 1, 0, 1, 1, '#', 209, 1, NULL),
(245, 'MiniappUserEdit', '用户修改', 'mall:miniapp:user:edit', 'F', NULL, NULL, NULL, 1, 0, 1, 1, '#', 209, 2, NULL),
(246, 'MiniappUserStatus', '启用/禁用', 'mall:miniapp:user:status', 'F', NULL, NULL, NULL, 1, 0, 1, 1, '#', 209, 3, NULL),
(247, 'MiniappUserBalance', '调整余额', 'mall:miniapp:user:balance', 'F', NULL, NULL, NULL, 1, 0, 1, 1, '#', 209, 4, NULL),
(248, 'MiniappUserPoints', '调整积分', 'mall:miniapp:user:points', 'F', NULL, NULL, NULL, 1, 0, 1, 1, '#', 209, 5, NULL);

-- 轮播图管理按钮
INSERT INTO `menus` (`id`, `name`, `title`, `permission_code`, `menu_type`, `path`, `component`, `query`, `is_frame`, `is_cache`, `visible`, `status`, `icon`, `parent_id`, `order_num`, `remark`) VALUES
(249, 'BannerQuery', '轮播图查询', 'mall:banner:query', 'F', NULL, NULL, NULL, 1, 0, 1, 1, '#', 211, 1, NULL),
(250, 'BannerAdd', '轮播图新增', 'mall:banner:add', 'F', NULL, NULL, NULL, 1, 0, 1, 1, '#', 211, 2, NULL),
(251, 'BannerEdit', '轮播图修改', 'mall:banner:edit', 'F', NULL, NULL, NULL, 1, 0, 1, 1, '#', 211, 3, NULL),
(252, 'BannerDelete', '轮播图删除', 'mall:banner:remove', 'F', NULL, NULL, NULL, 1, 0, 1, 1, '#', 211, 4, NULL),
(253, 'BannerSort', '轮播图排序', 'mall:banner:sort', 'F', NULL, NULL, NULL, 1, 0, 1, 1, '#', 211, 5, NULL);

-- 数据统计按钮
INSERT INTO `menus` (`id`, `name`, `title`, `permission_code`, `menu_type`, `path`, `component`, `query`, `is_frame`, `is_cache`, `visible`, `status`, `icon`, `parent_id`, `order_num`, `remark`) VALUES
(254, 'StatisticsQuery', '统计查询', 'mall:statistics:query', 'F', NULL, NULL, NULL, 1, 0, 1, 1, '#', 213, 1, NULL);

-- 库存管理按钮
INSERT INTO `menus` (`id`, `name`, `title`, `permission_code`, `menu_type`, `path`, `component`, `query`, `is_frame`, `is_cache`, `visible`, `status`, `icon`, `parent_id`, `order_num`, `remark`) VALUES
(255, 'InventoryQuery', '库存查询', 'mall:inventory:query', 'F', NULL, NULL, NULL, 1, 0, 1, 1, '#', 215, 1, NULL),
(256, 'InventoryAdjust', '库存调整', 'mall:inventory:adjust', 'F', NULL, NULL, NULL, 1, 0, 1, 1, '#', 215, 2, NULL),
(257, 'InventoryWarning', '库存预警', 'mall:inventory:warning', 'F', NULL, NULL, NULL, 1, 0, 1, 1, '#', 215, 3, NULL);
