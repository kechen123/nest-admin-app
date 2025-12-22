import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { BaseEntity } from "../../common/entities/base.entity";
import { DictType } from "./dict-type.entity";

@Entity("dict_data")
export class DictData extends BaseEntity {
  @ApiProperty({ description: "字典排序", example: 0, default: 0 })
  @Column({ name: "dict_sort", default: 0 })
  dictSort: number;

  @ApiProperty({ description: "字典标签", example: "男" })
  @Column({ name: "dict_label", length: 100 })
  dictLabel: string;

  @ApiProperty({ description: "字典键值", example: "1" })
  @Column({ name: "dict_value", length: 100 })
  dictValue: string;

  @ApiProperty({ description: "字典类型", example: "sys_user_sex" })
  @Column({ name: "dict_type", length: 100 })
  dictType: string;

  @ApiProperty({ description: "样式属性", required: false })
  @Column({ name: "css_class", length: 100, nullable: true })
  cssClass?: string;

  @ApiProperty({ description: "表格回显样式", required: false })
  @Column({ name: "list_class", length: 100, nullable: true })
  listClass?: string;

  @ApiProperty({ description: "是否默认: 0-否, 1-是", example: 0, default: 0 })
  @Column({ name: "is_default", type: "tinyint", default: 0 })
  isDefault: number;

  @ApiProperty({ description: "状态: 0-停用, 1-正常", example: 1, default: 1 })
  @Column({ type: "tinyint", default: 1 })
  status: number;

  @ApiProperty({ description: "备注", required: false })
  @Column({ length: 500, nullable: true })
  remark?: string;

  @ApiProperty({ description: "创建人", required: false })
  @Column({ name: "created_by", nullable: true })
  createdBy?: number;

  @ApiProperty({ description: "更新人", required: false })
  @Column({ name: "updated_by", nullable: true })
  updatedBy?: number;

  @ManyToOne(() => DictType, (dictType) => dictType.dictDataList, { createForeignKeyConstraints: false })
  @JoinColumn({ name: "dict_type", referencedColumnName: "dictType" })
  dictTypeEntity?: DictType;
}

