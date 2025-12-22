# 数据库初始化说明

## 文件说明

- `init.sql` - 完整的数据库初始化脚本，包含表结构和初始数据
- `init-db.js` - 自动化初始化脚本（推荐使用）
- `generate-password.js` - 密码哈希生成工具
- `check-parent-id.js` - 检查权限表 parent_id 的工具
- `test-password.js` - 测试密码哈希的工具

## 快速开始（推荐）

### 方法一：使用自动化脚本（推荐）

这是最简单快捷的方式，脚本会自动：

1. 创建数据库
2. 执行初始化 SQL
3. 查询并显示实际的数据库信息

**前提条件：**

- 已启动 MySQL 容器（`docker-compose up -d`）
- 已配置 `.env` 文件（或使用默认配置）

**执行步骤：**

```bash
# 1. 启动 MySQL 容器（如果尚未启动）
cd backend
docker-compose up -d

# 2. 等待 MySQL 启动完成（约10秒）
sleep 10  # Linux/Mac
# 或
Start-Sleep -Seconds 10  # PowerShell

# 3. 执行初始化脚本
pnpm run db:init
# 或
npm run db:init
```

**输出示例：**

```text
正在初始化数据库 kechen-admin...

数据库初始化完成！

数据库信息:
  数据库名: kechen-admin
  默认管理员账号: admin
  默认管理员密码: admin123

⚠️  请在生产环境中修改默认密码！
```

## 其他初始化方法

### 方法二：使用 MySQL 命令行

**Bash/Linux/Mac:**

```bash
# 1. 确保数据库已创建
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS myapp_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 2. 执行初始化脚本
mysql -u root -p myapp_db < database/init.sql
```

**PowerShell (Windows):**

```powershell
# 1. 确保数据库已创建
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS myapp_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 2. 执行初始化脚本
Get-Content database/init.sql | mysql -u root -p myapp_db
```

### 方法三：使用 Docker Compose

**Bash/Linux/Mac:**

```bash
# 1. 启动 MySQL 容器
cd backend
docker-compose up -d

# 2. 等待 MySQL 启动完成（约10秒）
sleep 10

# 3. 执行初始化脚本
docker exec -i myapp-mysql mysql -uroot -proot myapp_db < database/init.sql
```

**PowerShell (Windows):**

```powershell
# 1. 启动 MySQL 容器
cd backend
docker-compose up -d

# 2. 等待 MySQL 启动完成（约10秒）
Start-Sleep -Seconds 10

# 3. 执行初始化脚本
Get-Content database/init.sql | docker exec -i myapp-mysql mysql -uroot -proot myapp_db
```

### 方法四：使用 MySQL Workbench 或其他客户端

1. 连接到 MySQL 数据库
2. 创建数据库（如果不存在）：`CREATE DATABASE IF NOT EXISTS myapp_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
3. 选择 `myapp_db` 数据库
4. 打开 `database/init.sql` 文件
5. 执行整个脚本

## 环境变量配置

初始化脚本会从 `.env` 文件中读取以下配置：

```bash
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=root
DB_DATABASE=myapp_db
```

如果未配置，将使用默认值：

- 数据库名：`myapp_db`
- 用户名：`root`
- 密码：`root`

## 默认数据

### 默认管理员账号

- **用户名**: `admin`
- **密码**: `admin123`
- **邮箱**: `admin@example.com`
- **角色**: `super_admin`（超级管理员）

⚠️ **重要**: 请在生产环境中立即修改默认密码！

### 默认角色

1. **超级管理员** (`super_admin`) - 拥有所有权限
2. **普通用户** (`user`) - 基础用户角色
3. **编辑者** (`editor`) - 内容编辑角色

### 默认权限结构

```text
用户管理 (user)
├── 用户列表 (user:list)
├── 创建用户 (user:create)
├── 编辑用户 (user:edit)
├── 删除用户 (user:delete)
└── 查看用户详情 (user:view)

角色管理 (role)
├── 角色列表 (role:list)
├── 创建角色 (role:create)
├── 编辑角色 (role:edit)
├── 删除角色 (role:delete)
└── 分配权限 (role:assign)

权限管理 (permission)
├── 权限列表 (permission:list)
├── 创建权限 (permission:create)
├── 编辑权限 (permission:edit)
└── 删除权限 (permission:delete)

系统设置 (system)
├── 菜单管理 (menu:manage)
└── 系统配置 (system:config)
```

## 工具脚本

### 生成密码哈希

如果需要生成新的密码哈希值：

```bash
pnpm run db:generate-password <your-password>
# 或
node database/generate-password.js <your-password>
```

**示例：**

```bash
node database/generate-password.js admin123
```

输出：

```text
密码哈希值:
$2b$10$CyOrL4KfwIoJGYbFoVAPguVvhakw3jHnoNuZA2YxoRXsCl5LzrDN2

可以在 SQL 脚本中使用此哈希值替换默认密码。
```

### 检查权限表 parent_id

检查权限表中的 parent_id 是否正确：

```bash
node database/check-parent-id.js
```

### 测试密码哈希

验证密码哈希是否正确：

```bash
node database/test-password.js
```

## 密码说明

脚本中使用的密码哈希值对应明文密码 `admin123`，使用 bcrypt 算法加密（salt rounds: 10）。

**当前使用的哈希值：**

```text
$2b$10$CyOrL4KfwIoJGYbFoVAPguVvhakw3jHnoNuZA2YxoRXsCl5LzrDN2
```

如果需要生成新的密码哈希，可以使用 `generate-password.js` 工具脚本。

## 表结构说明

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

## 注意事项

1. **外键约束**: 删除用户或角色时会自动删除关联数据（CASCADE）
2. **字符集**: 使用 `utf8mb4` 支持完整的 Unicode 字符（包括 emoji）
3. **索引**: 已为常用查询字段添加索引，提升查询性能
4. **时间戳**: 使用 MySQL 的 `TIMESTAMP` 类型自动管理创建和更新时间
5. **密码安全**: 默认密码仅用于开发环境，生产环境必须修改

## 常见问题

### Q: 初始化失败，提示无法连接到数据库

**A:** 确保 MySQL 容器已启动，并且等待足够的时间让 MySQL 完全启动（通常需要 10-15 秒）。

### Q: 如何修改默认管理员密码？

**A:**

1. 使用 `generate-password.js` 生成新密码的哈希值
2. 在 `init.sql` 文件中找到管理员用户的 INSERT 语句
3. 替换密码哈希值
4. 重新执行初始化脚本

### Q: 如何重置数据库？

**A:**

1. 删除数据库：`DROP DATABASE myapp_db;`
2. 重新执行初始化脚本

### Q: parent_id 检查工具显示有无效记录？

**A:** 检查 `init.sql` 中的权限插入顺序，确保父级权限先于子级权限插入。

## 后续开发

执行初始化脚本后，需要：

1. 更新 TypeORM 实体类以匹配新的表结构
2. 实现角色和权限的业务逻辑
3. 添加基于角色的权限控制（RBAC）中间件
4. 更新前端权限控制逻辑
