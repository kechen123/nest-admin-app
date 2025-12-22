import { Entity, Column, ManyToMany, JoinTable } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { BaseEntity } from "../../common/entities/base.entity";
import { Role } from "../role/role.entity";

@Entity("users")
export class User extends BaseEntity {
  @ApiProperty({ description: "用户名", example: "admin" })
  @Column({ unique: true, length: 50 })
  username: string;

  @ApiProperty({ description: "邮箱", example: "admin@example.com" })
  @Column({ unique: true, length: 100 })
  email: string;

  @Column({ length: 255, select: false })
  password: string;

  @ApiProperty({ description: "昵称", example: "管理员", required: false })
  @Column({ length: 50, nullable: true })
  nickname?: string;

  @ApiProperty({ description: "头像URL", required: false })
  @Column({ length: 500, nullable: true, default: '/avatar/default.jpg' })
  avatar?: string;

  @ApiProperty({ description: "手机号", required: false })
  @Column({ length: 20, nullable: true })
  phone?: string;

  @ApiProperty({ description: "性别: 0-未知, 1-男, 2-女", example: 0, default: 0 })
  @Column({ type: "tinyint", default: 0 })
  gender: number;

  @ApiProperty({ description: "部门ID", required: false })
  @Column({ name: "dept_id", nullable: true })
  deptId?: number;

  @ApiProperty({ description: "岗位ID", required: false })
  @Column({ name: "post_id", nullable: true })
  postId?: number;

  @ApiProperty({ description: "最后登录IP", required: false })
  @Column({ name: "login_ip", length: 50, nullable: true })
  loginIp?: string;

  @ApiProperty({ description: "最后登录时间", required: false })
  @Column({ name: "login_date", type: "datetime", nullable: true })
  loginDate?: Date;

  @ApiProperty({ description: "备注", required: false })
  @Column({ length: 500, nullable: true })
  remark?: string;

  @ApiProperty({ description: "状态: 0-禁用, 1-正常", example: 1, default: 1 })
  @Column({ type: "tinyint", default: 1 })
  status: number;

  @ApiProperty({ description: "是否管理员: 0-否, 1-是", example: 0, default: 0 })
  @Column({ name: "is_admin", type: "tinyint", default: 0 })
  isAdmin: number;

  @ApiProperty({ description: "删除标志: 0-正常, 1-删除", example: 0, default: 0 })
  @Column({ name: "del_flag", type: "tinyint", default: 0 })
  delFlag: number;

  @ApiProperty({ description: "创建人", required: false })
  @Column({ name: "created_by", nullable: true })
  createdBy?: number;

  @ApiProperty({ description: "更新人", required: false })
  @Column({ name: "updated_by", nullable: true })
  updatedBy?: number;

  @ApiProperty({ description: "角色", example: "admin", default: "user" })
  // 注意：role 字段不在数据库表中，而是通过 roles 关联获取
  // 如果需要使用，请通过 roles 关联查询
  role?: string;

  @ManyToMany(() => Role)
  @JoinTable({
    name: "user_roles",
    joinColumn: { name: "user_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "role_id", referencedColumnName: "id" },
  })
  roles?: Role[];
}
