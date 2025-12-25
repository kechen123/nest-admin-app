import { Entity, Column } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { BaseEntity } from "../../common/entities/base.entity";

@Entity("banners")
export class Banner extends BaseEntity {
  @ApiProperty({ description: "标题", example: "春季新品上市" })
  @Column({ length: 100 })
  title: string;

  @ApiProperty({ description: "图片URL" })
  @Column({ length: 500 })
  image: string;

  @ApiProperty({ description: "跳转类型: 0-无, 1-商品, 2-分类, 3-链接", example: 1, default: 0 })
  @Column({ name: "link_type", type: "tinyint", default: 0 })
  linkType: number;

  @ApiProperty({ description: "跳转值（商品ID/分类ID/链接URL）", required: false })
  @Column({ name: "link_value", length: 500, nullable: true })
  linkValue?: string;

  @ApiProperty({ description: "排序值", example: 0, default: 0 })
  @Column({ name: "sort_order", default: 0 })
  sortOrder: number;

  @ApiProperty({ description: "状态: 0-禁用, 1-启用", example: 1, default: 1 })
  @Column({ type: "tinyint", default: 1 })
  status: number;
}

