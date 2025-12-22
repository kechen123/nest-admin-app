import { Entity, Column, ManyToMany, JoinTable } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { BaseEntity } from "../../common/entities/base.entity";
import { Permission } from "../permission/permission.entity";

@Entity("roles")
export class Role extends BaseEntity {
  @ApiProperty({ description: "角色名称", example: "管理员" })
  @Column({ unique: true, length: 50 })
  name: string;

  @ApiProperty({ description: "角色代码", example: "admin" })
  @Column({ unique: true, length: 50 })
  code: string;

  @ApiProperty({ description: "描述", example: "拥有所有权限", required: false })
  @Column({ length: 200, nullable: true })
  description?: string;

  @ManyToMany(() => Permission)
  @JoinTable({
    name: "role_permissions",
    joinColumn: { name: "role_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "permission_id", referencedColumnName: "id" },
  })
  permissions?: Permission[];
}
