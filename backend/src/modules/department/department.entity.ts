import { Entity, Column } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { BaseEntity } from "../../common/entities/base.entity";

@Entity("departments")
export class Department extends BaseEntity {
  @ApiProperty({ description: "部门名称", example: "研发部" })
  @Column({ length: 100 })
  name: string;

  @ApiProperty({ description: "父部门ID", example: 0, default: 0 })
  @Column({ name: "parent_id", default: 0 })
  parentId: number;

  @ApiProperty({ description: "祖级列表", required: false })
  @Column({ length: 500, nullable: true })
  ancestors?: string;

  @ApiProperty({ description: "负责人", required: false })
  @Column({ length: 50, nullable: true })
  leader?: string;

  @ApiProperty({ description: "联系电话", required: false })
  @Column({ length: 20, nullable: true })
  phone?: string;

  @ApiProperty({ description: "邮箱", required: false })
  @Column({ length: 100, nullable: true })
  email?: string;

  @ApiProperty({ description: "显示顺序", example: 0, default: 0 })
  @Column({ name: "order_num", default: 0 })
  orderNum: number;

  @ApiProperty({ description: "状态: 0-停用, 1-正常", example: 1, default: 1 })
  @Column({ type: "tinyint", default: 1 })
  status: number;

  @ApiProperty({ description: "删除标志: 0-正常, 1-删除", example: 0, default: 0 })
  @Column({ name: "del_flag", type: "tinyint", default: 0 })
  delFlag: number;

  @ApiProperty({ description: "备注", required: false })
  @Column({ length: 500, nullable: true })
  remark?: string;

  @ApiProperty({ description: "创建人", required: false })
  @Column({ name: "created_by", nullable: true })
  createdBy?: number;

  @ApiProperty({ description: "更新人", required: false })
  @Column({ name: "updated_by", nullable: true })
  updatedBy?: number;
}

