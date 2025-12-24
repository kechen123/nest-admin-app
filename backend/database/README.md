# 数据库初始化说明

## 📋 文件说明

- `init.sql` - 完整的数据库初始化脚本，包含表结构和初始数据
- `init-db.js` - 自动化初始化脚本（推荐使用）
- `generate-password.js` - 密码哈希生成工具
- `check-parent-id.js` - 检查权限表 parent_id 的工具
- `test-password.js` - 测试密码哈希的工具

## 🚀 快速开始

### 方法一：使用自动化脚本（推荐）

这是最简单快捷的方式，脚本会自动：

1. 从 `backend/.env` 文件读取配置
2. 创建数据库
3. 执行初始化 SQL
4. 配置 MySQL 外部连接权限
5. 查询并显示实际的数据库信息

## 🎯 两种运行模式

### 模式一：Docker 容器内运行（完整 Docker 环境）

**适用场景**：所有服务都在 Docker 容器中运行

**执行步骤**：

```bash
# 1. 在项目根目录启动所有服务
npm run dev:up

# 2. 等待 MySQL 启动完成（约 20-30 秒）

# 3. 在容器内执行初始化
npm run backend:init-db
```

**特点**：
- 脚本自动检测 Docker 环境
- 使用 Docker 服务名 `mysql` 连接数据库
- 配置从 `backend/.env` 读取，但 `DB_HOST` 会被自动设置为 `mysql`

### 模式二：本地运行（独立运行模式）

**适用场景**：后端在本地运行，MySQL 在 Docker 容器中

**执行步骤**：

```bash
# 1. 在项目根目录启动 MySQL 容器
npm run mysql:start

# 2. 等待 MySQL 启动完成（约 10-20 秒）

# 3. 在 backend 目录执行初始化
cd backend
npm run db:init
```

**特点**：
- 脚本检测到本地环境
- 使用 `docker exec` 执行 MySQL 命令
- 所有配置从 `backend/.env` 文件读取
- 支持 Windows、Linux、Mac 跨平台

## ⚙️ 环境变量配置

初始化脚本会从 `backend/.env` 文件中读取以下配置：

```env
# 数据库配置
DB_HOST=localhost          # Docker 模式: mysql, 本地模式: localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password  # 请修改为安全密码
DB_DATABASE=myapp_db       # 数据库名称

# 应用配置（可选）
NODE_ENV=development
PORT=3000
JWT_SECRET=dev-secret-key
CORS_ORIGIN=http://localhost:4000
```

**配置优先级**：
1. 系统环境变量（docker-compose env_file）
2. `.env` 文件
3. 默认值

**默认值**：
- 数据库名：`myapp_db`
- 用户名：`root`
- 密码：`root`
- 端口：`3306`
- 主机：`localhost`（本地模式）或 `mysql`（Docker 模式）

## 📝 配置说明

### Docker 模式配置

在 Docker 模式下，`docker-compose.dev.yml` 会自动：
- 将 `DB_HOST` 设置为 `mysql`（容器服务名）
- 从 `backend/.env` 读取其他配置

**重要提示**：
- MySQL 容器的 root 密码是在首次启动时设置的
- 如果修改了 `backend/.env` 中的 `DB_PASSWORD`，必须删除数据卷并重新初始化

### 本地模式配置

在本地模式下，所有配置都从 `backend/.env` 文件读取：

**重要提示**：
- 确保 `DB_PASSWORD` 与 MySQL 容器启动时使用的密码一致
- 如果密码不匹配，脚本会提供详细的解决方案

## 🔧 常见问题

### Q: 初始化失败，提示密码不一致

**A:** 这通常是因为 MySQL 容器的密码与 `.env` 文件中的配置不一致。

**解决方案**：

**方案 1：删除数据卷并重新初始化（推荐）**

```bash
# 在项目根目录
npm run mysql:stop
docker volume rm yl_mysql_data
npm run mysql:start
# 等待 MySQL 启动后
cd backend
npm run db:init
```

**方案 2：修改 .env 文件使用当前密码**

```bash
# 编辑 backend/.env，将 DB_PASSWORD 改为 MySQL 容器的实际密码
# 然后重新运行
cd backend
npm run db:init
```

### Q: 如何修改默认管理员密码？

**A:**

1. 使用 `generate-password.js` 生成新密码的哈希值：
   ```bash
   cd backend
   node database/generate-password.js <your-password>
   ```

2. 在 `init.sql` 文件中找到管理员用户的 INSERT 语句

3. 替换密码哈希值

4. 重新执行初始化脚本

### Q: 如何重置数据库？

**A:**

1. 删除数据库：
   ```bash
   # 在本地模式
   docker exec yl-mysql-dev mysql -uroot -p<password> -e "DROP DATABASE IF EXISTS myapp_db;"
   
   # 或在 Docker 模式
   docker exec yl-backend-dev mysql -hmysql -uroot -p<password> -e "DROP DATABASE IF EXISTS myapp_db;"
   ```

2. 重新执行初始化脚本

### Q: 脚本如何检测运行环境？

**A:** 脚本通过以下方式检测：

1. 检查是否存在 `/.dockerenv` 文件（Docker 容器标志）
2. 检查 `DB_HOST` 是否为 `mysql`（Docker 服务名）
3. 检查 `DB_HOST` 是否为容器名
4. 检查环境变量配置

### Q: Windows PowerShell 支持吗？

**A:** 完全支持！脚本已经针对 Windows PowerShell 进行了优化：
- 使用系统临时目录（兼容 Windows）
- 正确处理引号和转义
- 使用 `docker exec -i` 通过 stdin 传递 SQL

## 📊 默认数据

### 默认管理员账号

- **用户名**: `admin`
- **密码**: `admin123`
- **邮箱**: `admin@company.com`
- **角色**: `super_admin`（超级管理员）

⚠️ **重要**: 请在生产环境中立即修改默认密码！

### 默认角色

1. **超级管理员** (`super_admin`) - 拥有所有权限
2. **系统管理员** (`admin`) - 系统管理权限
3. **部门管理员** (`dept_admin`) - 管理本部门及下属部门
4. **项目经理** (`project_manager`) - 管理本项目组
5. **开发工程师** (`developer`) - 开发人员角色
6. **测试工程师** (`tester`) - 测试人员角色
7. **产品经理** (`product_manager`) - 产品人员角色
8. **普通用户** (`user`) - 普通用户，只有查看权限

## 🛠️ 工具脚本

### 生成密码哈希

```bash
cd backend
node database/generate-password.js <your-password>
```

**示例**：

```bash
node database/generate-password.js admin123
```

输出：

```
密码哈希值:
$2b$10$CyOrL4KfwIoJGYbFoVAPguVvhakw3jHnoNuZA2YxoRXsCl5LzrDN2

可以在 SQL 脚本中使用此哈希值替换默认密码。
```

### 检查权限表 parent_id

```bash
cd backend
node database/check-parent-id.js
```

### 测试密码哈希

```bash
cd backend
node database/test-password.js
```

## 📖 表结构说明

### users (用户表)

- 存储用户基本信息
- `is_admin` 字段用于快速判断是否为管理员（兼容旧代码）
- `role` 字段存储角色代码

### roles (角色表)

- 存储角色信息
- 角色代码用于程序中的权限判断

### permissions (权限表)

- 支持三级权限结构（菜单、按钮、API）
- `parent_id` 为 NULL 表示顶级权限
- `type` 字段区分权限类型：`menu`（菜单）、`button`（按钮）、`api`（接口）

### user_roles (用户角色关联表)

- 多对多关系：一个用户可以有多个角色
- 使用 CASCADE 级联删除

### role_permissions (角色权限关联表)

- 多对多关系：一个角色可以有多个权限
- 使用 CASCADE 级联删除

### menus (菜单管理表)

- 存储前端菜单结构
- 支持多级菜单（通过 `parent_id` 关联）
- 与权限表通过 `permission_code` 关联

## ⚠️ 注意事项

1. **外键约束**: 删除用户或角色时会自动删除关联数据（CASCADE）
2. **字符集**: 使用 `utf8mb4` 支持完整的 Unicode 字符（包括 emoji）
3. **索引**: 已为常用查询字段添加索引，提升查询性能
4. **时间戳**: 使用 MySQL 的 `TIMESTAMP` 类型自动管理创建和更新时间
5. **密码安全**: 默认密码仅用于开发环境，生产环境必须修改
6. **MySQL 版本**: 脚本兼容 MySQL 8.0+，使用 `--ssl-mode=DISABLED` 选项

## 🔄 后续开发

执行初始化脚本后，需要：

1. 更新 TypeORM 实体类以匹配新的表结构
2. 实现角色和权限的业务逻辑
3. 添加基于角色的权限控制（RBAC）中间件
4. 更新前端权限控制逻辑

## 📞 更多帮助

- 查看项目根目录的 [README.md](../../README.md) 获取完整项目说明
- 查看 [SETUP.md](../../SETUP.md) 获取详细初始化步骤
- 查看 [DOCKER.md](../../DOCKER.md) 获取 Docker 使用说明
