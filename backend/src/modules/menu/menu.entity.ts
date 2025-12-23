import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { BaseEntity } from "../../common/entities/base.entity";

@Entity("menus")
export class Menu extends BaseEntity {
  @ApiProperty({ description: "菜单名称", example: "用户管理" })
  @Column({ length: 50 })
  name: string;

  @ApiProperty({ description: "菜单标题", example: "用户管理" })
  @Column({ length: 50 })
  title: string;

  @ApiProperty({ description: "路由路径", example: "/user", required: false })
  @Column({ length: 200, nullable: true })
  path?: string;

  @ApiProperty({ description: "图标", example: "User", required: false })
  @Column({ length: 50, nullable: true })
  icon?: string;

  @ApiProperty({ description: "父菜单ID", example: null, required: false })
  @Column({ name: "parent_id", nullable: true })
  parentId?: number;

  @ManyToOne(() => Menu, (menu) => menu.children, { nullable: true, onDelete: "CASCADE", createForeignKeyConstraints: false })
  @JoinColumn({ name: "parent_id" })
  parent?: Menu;

  @OneToMany(() => Menu, (menu) => menu.parent, { cascade: true })
  children?: Menu[];

  @ApiProperty({ description: "组件路径", example: "Layout", required: false })
  @Column({ length: 200, nullable: true })
  component?: string;

  @ApiProperty({ description: "排序", example: 0, default: 0 })
  // #region agent log
  // Log: sort field definition - checking if column name mapping exists
  // #endregion
  @Column({ name: "order_num", default: 0 })
  sort: number;

  @ApiProperty({ description: "状态: 0-禁用, 1-启用", example: 1, default: 1 })
  @Column({ type: "tinyint", default: 1 })
  status: number;

  @ApiProperty({ description: "关联的权限代码", example: "user", required: false })
  @Column({ name: "permission_code", length: 100, nullable: true })
  permissionCode?: string;

  @ApiProperty({ description: "菜单类型: M-目录, C-菜单, F-按钮", example: "C", default: "C" })
  @Column({ name: "menu_type", type: "char", length: 1, default: "C" })
  menuType: string;

  @ApiProperty({ description: "是否外部链接: 0-否, 1-是", example: 0, default: 0 })
  @Column({ name: "is_frame", type: "tinyint", default: 0 })
  isExternal: number;

  @ApiProperty({ description: "显示状态: 0-隐藏, 1-显示", example: 1, default: 1 })
  @Column({ type: "tinyint", default: 1 })
  visible: number;

  @ApiProperty({ description: "是否缓存: 0-缓存, 1-不缓存", example: 0, default: 0 })
  @Column({ name: "is_cache", type: "tinyint", default: 0 })
  isCache: number;

  @ApiProperty({ description: "路由参数", example: "", required: false })
  @Column({ length: 255, nullable: true })
  query?: string;

  @ApiProperty({ description: "备注", required: false })
  @Column({ length: 500, nullable: true })
  remark?: string;
}
