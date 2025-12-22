import { Entity, Column } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { BaseEntity } from "../../common/entities/base.entity";

@Entity("posts")
export class Post extends BaseEntity {
  @ApiProperty({ description: "岗位编码", example: "dev_manager" })
  @Column({ unique: true, length: 50 })
  code: string;

  @ApiProperty({ description: "岗位名称", example: "开发经理" })
  @Column({ length: 100 })
  name: string;

  @ApiProperty({ description: "显示顺序", example: 0, default: 0 })
  @Column({ name: "order_num", default: 0 })
  orderNum: number;

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
}

