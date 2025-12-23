import { Entity, Column, ManyToMany, JoinTable } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { BaseEntity } from "../../common/entities/base.entity";
import { Permission } from "../permission/permission.entity";
import { Menu } from "../menu/menu.entity";

@Entity("roles")
export class Role extends BaseEntity {
  @ApiProperty({ description: "角色名称", example: "管理员" })
  @Column({ unique: true, length: 50 })
  name: string;

  @ApiProperty({ description: "角色代码", example: "admin" })
  @Column({ unique: true, length: 50 })
  code: string;

  @ApiProperty({ description: "数据范围: 1-全部数据, 2-自定义数据, 3-本部门数据, 4-本部门及以下数据, 5-仅本人数据", example: "1", default: "1" })
  @Column({ name: "data_scope", length: 20, default: "1" })
  dataScope: string;

  @ApiProperty({ description: "显示顺序", example: 0, default: 0 })
  @Column({ name: "order_num", default: 0 })
  orderNum: number;

  @ApiProperty({ description: "状态: 0-禁用, 1-正常", example: 1, default: 1 })
  @Column({ type: "tinyint", default: 1 })
  status: number;

  @ApiProperty({ description: "备注", example: "拥有所有权限", required: false })
  @Column({ name: "remark", length: 500, nullable: true })
  remark?: string;

  @ManyToMany(() => Permission)
  @JoinTable({
    name: "role_permissions",
    joinColumn: { name: "role_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "permission_id", referencedColumnName: "id" },
  })
  permissions?: Permission[];

  @ManyToMany(() => Menu)
  @JoinTable({
    name: "role_menus",
    joinColumn: { name: "role_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "menu_id", referencedColumnName: "id" },
  })
  menus?: Menu[];
}
