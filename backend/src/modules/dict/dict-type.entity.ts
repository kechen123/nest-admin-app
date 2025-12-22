import { Entity, Column, OneToMany } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { BaseEntity } from "../../common/entities/base.entity";
import { DictData } from "./dict-data.entity";

@Entity("dict_types")
export class DictType extends BaseEntity {
  @ApiProperty({ description: "字典名称", example: "用户性别" })
  @Column({ name: "dict_name", length: 100 })
  dictName: string;

  @ApiProperty({ description: "字典类型", example: "sys_user_sex" })
  @Column({ name: "dict_type", unique: true, length: 100 })
  dictType: string;

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

  @OneToMany(() => DictData, (dictData) => dictData.dictType)
  dictDataList?: DictData[];
}

