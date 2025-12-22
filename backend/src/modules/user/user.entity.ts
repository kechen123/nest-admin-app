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
  @Column({ length: 255, nullable: true })
  avatar?: string;

  @ApiProperty({ description: "角色", example: "admin", default: "user" })
  @Column({ length: 20, default: "user" })
  role: string;

  @ApiProperty({ description: "状态", example: true, default: true })
  @Column({ default: true })
  status: boolean;

  @ManyToMany(() => Role)
  @JoinTable({
    name: "user_roles",
    joinColumn: { name: "user_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "role_id", referencedColumnName: "id" },
  })
  roles?: Role[];
}
