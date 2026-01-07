# 数据库设计

本文档介绍数据库设计和数据模型。

## 数据库信息

- **数据库类型**: MySQL
- **版本**: 5.7+ / 8.0+
- **字符集**: utf8mb4
- **排序规则**: utf8mb4_unicode_ci
- **时区**: +08:00

## 连接信息

### 开发环境

- **Host**: localhost（Docker 环境使用服务名 `mysql`）
- **Port**: 3306
- **Database**: 从环境变量 `DB_DATABASE` 读取
- **Username**: 从环境变量 `DB_USERNAME` 读取
- **Password**: 从环境变量 `DB_PASSWORD` 读取

### 生产环境

连接信息从环境变量读取，请勿在代码中硬编码。

## 基础实体

所有实体都继承自 `BaseEntity`，包含以下字段：

```typescript
export abstract class BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date
}
```

## 核心数据模型

### 用户表 (users)

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | INT | 主键，自增 |
| username | VARCHAR(50) | 用户名，唯一 |
| email | VARCHAR(100) | 邮箱，唯一 |
| password | VARCHAR(255) | 密码（bcrypt 加密） |
| nickname | VARCHAR(50) | 昵称 |
| avatar | VARCHAR(500) | 头像 URL |
| phone | VARCHAR(20) | 手机号 |
| gender | TINYINT | 性别：0-未知，1-男，2-女 |
| dept_id | INT | 部门 ID |
| post_id | INT | 岗位 ID |
| login_ip | VARCHAR(50) | 最后登录 IP |
| login_date | DATETIME | 最后登录时间 |
| status | TINYINT | 状态：0-禁用，1-正常 |
| is_admin | TINYINT | 是否管理员：0-否，1-是 |
| del_flag | TINYINT | 删除标志：0-正常，1-删除 |
| created_by | INT | 创建人 |
| updated_by | INT | 更新人 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |
| deleted_at | TIMESTAMP | 删除时间（软删除） |

**索引**：
- `idx_username` - 用户名索引
- `idx_email` - 邮箱索引
- `idx_status` - 状态索引
- `idx_dept_id` - 部门 ID 索引

**关系**：
- 多对多：用户 ↔ 角色（通过 `user_roles` 中间表）

### 角色表 (roles)

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | INT | 主键，自增 |
| role_code | VARCHAR(50) | 角色代码，唯一 |
| role_name | VARCHAR(100) | 角色名称 |
| status | TINYINT | 状态：0-停用，1-正常 |
| remark | VARCHAR(500) | 备注 |

**关系**：
- 多对多：角色 ↔ 用户
- 多对多：角色 ↔ 权限（通过 `role_permissions` 中间表）

### 权限表 (permissions)

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | INT | 主键，自增 |
| permission_code | VARCHAR(100) | 权限代码，唯一 |
| permission_name | VARCHAR(100) | 权限名称 |
| resource | VARCHAR(100) | 资源 |
| action | VARCHAR(50) | 操作 |
| status | TINYINT | 状态：0-停用，1-正常 |

### 部门表 (departments)

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | INT | 主键，自增 |
| name | VARCHAR(100) | 部门名称 |
| parent_id | INT | 父部门 ID |
| ancestors | VARCHAR(500) | 祖级列表 |
| leader | VARCHAR(50) | 负责人 |
| phone | VARCHAR(20) | 联系电话 |
| email | VARCHAR(100) | 邮箱 |
| order_num | INT | 显示顺序 |
| status | TINYINT | 状态：0-停用，1-正常 |

**关系**：
- 自关联：部门 ↔ 部门（父子关系）

### 菜单表 (menus)

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | INT | 主键，自增 |
| menu_name | VARCHAR(100) | 菜单名称 |
| parent_id | INT | 父菜单 ID |
| path | VARCHAR(200) | 路由路径 |
| component | VARCHAR(200) | 组件路径 |
| menu_type | VARCHAR(1) | 菜单类型：M-目录，C-菜单，F-按钮 |
| perms | VARCHAR(100) | 权限标识 |
| icon | VARCHAR(100) | 图标 |
| order_num | INT | 显示顺序 |
| status | TINYINT | 状态：0-停用，1-正常 |

### 字典类型表 (dict_types)

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | INT | 主键，自增 |
| dict_name | VARCHAR(100) | 字典名称 |
| dict_type | VARCHAR(100) | 字典类型，唯一 |
| status | TINYINT | 状态：0-停用，1-正常 |
| remark | VARCHAR(500) | 备注 |

**关系**：
- 一对多：字典类型 ↔ 字典数据

### 字典数据表 (dict_data)

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | INT | 主键，自增 |
| dict_type | VARCHAR(100) | 字典类型 |
| dict_label | VARCHAR(100) | 字典标签 |
| dict_value | VARCHAR(100) | 字典值 |
| dict_sort | INT | 排序 |
| status | TINYINT | 状态：0-停用，1-正常 |

### 登录日志表 (login_logs)

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | INT | 主键，自增 |
| username | VARCHAR(50) | 用户名 |
| ip | VARCHAR(50) | 登录 IP |
| location | VARCHAR(100) | 登录地点 |
| browser | VARCHAR(100) | 浏览器 |
| os | VARCHAR(100) | 操作系统 |
| status | TINYINT | 登录状态：0-失败，1-成功 |
| msg | VARCHAR(500) | 提示信息 |
| login_time | DATETIME | 登录时间 |

### 操作日志表 (operation_logs)

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | INT | 主键，自增 |
| username | VARCHAR(50) | 用户名 |
| method | VARCHAR(10) | 请求方法 |
| path | VARCHAR(200) | 请求路径 |
| ip | VARCHAR(50) | 操作 IP |
| location | VARCHAR(100) | 操作地点 |
| status | TINYINT | 操作状态：0-失败，1-成功 |
| error_msg | VARCHAR(500) | 错误信息 |
| operation_time | DATETIME | 操作时间 |

## 数据库初始化

### 使用初始化脚本

项目提供了数据库初始化脚本：

```bash
# 初始化数据库
npm run backend:init-db
```

脚本会：
1. 创建数据库（如果不存在）
2. 执行 `database/init.sql` 创建所有表
3. 插入初始数据（管理员账号、基础角色等）

### 手动初始化

```bash
# 连接数据库
mysql -h localhost -u root -p

# 创建数据库
CREATE DATABASE yl_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 执行初始化脚本
mysql -u root -p yl_db < database/init.sql
```

## 数据库操作

### 连接数据库

```bash
# 使用 Docker
npm run mysql:shell

# 或直接连接
mysql -h localhost -u root -p
```

### 备份数据库

```bash
# 导出数据
docker-compose -f docker-compose.dev.yml exec mysql mysqldump -u root -p yl_db > backup.sql

# 导出结构和数据
docker-compose -f docker-compose.dev.yml exec mysql mysqldump -u root -p --single-transaction yl_db > backup.sql
```

### 恢复数据库

```bash
# 导入数据
docker-compose -f docker-compose.dev.yml exec -T mysql mysql -u root -p yl_db < backup.sql
```

## TypeORM 实体开发

### 创建实体

```typescript
import { Entity, Column } from 'typeorm'
import { BaseEntity } from '../../common/entities/base.entity'

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true, length: 50 })
  username: string

  @Column({ unique: true, length: 100 })
  email: string

  @Column({ length: 255, select: false })
  password: string
}
```

### 关系定义

#### 多对多关系

```typescript
@ManyToMany(() => Role)
@JoinTable({
  name: 'user_roles',
  joinColumn: { name: 'user_id', referencedColumnName: 'id' },
  inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
})
roles: Role[]
```

#### 一对多关系

```typescript
@OneToMany(() => DictData, (dictData) => dictData.dictType)
dictDataList: DictData[]
```

#### 多对一关系

```typescript
@ManyToOne(() => Department, { nullable: true })
@JoinColumn({ name: 'dept_id' })
department: Department
```

## 索引优化

重要字段应添加索引以提高查询性能：

- **主键**：自动创建索引
- **唯一字段**：username、email 等
- **外键字段**：dept_id、post_id 等
- **查询条件字段**：status、del_flag 等
- **排序字段**：order_num 等

## 软删除

项目使用软删除机制，通过 `deleted_at` 字段标记删除：

```typescript
@DeleteDateColumn({ name: 'deleted_at', nullable: true })
deletedAt?: Date
```

查询时自动过滤已删除数据：

```typescript
// TypeORM 自动过滤 deleted_at 不为 null 的记录
const users = await userRepository.find()
```

## 数据安全

- **密码加密**：使用 bcrypt 加密存储
- **SQL 注入防护**：使用 TypeORM 参数化查询
- **数据验证**：使用 DTO 和 class-validator 验证
- **定期备份**：建议每天备份数据库
- **权限控制**：限制数据库访问权限

## 数据库迁移

项目使用 SQL 脚本管理数据库结构变更，不使用 TypeORM 的 synchronize：

1. 修改 `database/init.sql` 文件
2. 在开发环境测试
3. 生成迁移脚本（可选）
4. 在生产环境执行

## 下一步

- 查看 [项目结构](./structure.md) 了解实体文件位置
- 查看 [API 开发](./api.md) 了解如何使用实体
- 查看 [开发指南](./development.md) 了解开发规范

