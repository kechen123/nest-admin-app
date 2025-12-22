import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { BaseEntity } from "../../common/entities/base.entity";

@Entity("permissions")
export class Permission extends BaseEntity {
  @ApiProperty({ description: "权限名称", example: "创建用户" })
  @Column({ length: 50 })
  name: string;

  @ApiProperty({ description: "权限代码", example: "user:create" })
  @Column({ unique: true, length: 100 })
  code: string;

  @ApiProperty({ description: "类型", example: "button", enum: ["menu", "button", "api"] })
  @Column({ length: 20, default: "api" })
  type: "menu" | "button" | "api";

  @ApiProperty({ description: "父级权限ID", example: 1, required: false })
  @Column({ name: "parent_id", nullable: true })
  parentId?: number;

  @ManyToOne(() => Permission, (permission) => permission.children, { nullable: true, onDelete: "CASCADE", createForeignKeyConstraints: false })
  @JoinColumn({ name: "parent_id" })
  parent?: Permission;

  @OneToMany(() => Permission, (permission) => permission.parent, { cascade: true })
  children?: Permission[];

  @ApiProperty({ description: "路由路径", example: "/user", required: false })
  @Column({ length: 200, nullable: true })
  path?: string;

  @ApiProperty({ description: "图标", example: "User", required: false })
  @Column({ length: 50, nullable: true })
  icon?: string;

  @ApiProperty({ description: "排序", example: 0, default: 0 })
  @Column({ default: 0 })
  sort: number;
}
