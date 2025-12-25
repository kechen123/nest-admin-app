import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { BaseEntity } from "../base.entity";
import { Category } from "./category.entity";
import { ProductSku } from "./product-sku.entity";
import { ProductImage } from "./product-image.entity";

@Entity("products")
export class Product extends BaseEntity {
  @ApiProperty({ description: "商品名称", example: "iPhone 15 Pro Max" })
  @Column({ length: 200 })
  name: string;

  @ApiProperty({ description: "商品副标题", required: false })
  @Column({ name: "subtitle", length: 200, nullable: true })
  subtitle?: string;

  @ApiProperty({ description: "分类ID" })
  @Column({ name: "category_id" })
  categoryId: number;

  @ManyToOne(() => Category)
  @JoinColumn({ name: "category_id" })
  category?: Category;

  @ApiProperty({ description: "商品主图", required: false })
  @Column({ name: "main_image", length: 500, nullable: true })
  mainImage?: string;

  @ApiProperty({ description: "商品详情（富文本）", required: false })
  @Column({ type: "text", nullable: true })
  detail?: string;

  @ApiProperty({ description: "最低价格（从SKU中计算）", example: 0, default: 0 })
  @Column({ name: "min_price", type: "decimal", precision: 10, scale: 2, default: 0 })
  minPrice: number;

  @ApiProperty({ description: "最高价格（从SKU中计算）", example: 0, default: 0 })
  @Column({ name: "max_price", type: "decimal", precision: 10, scale: 2, default: 0 })
  maxPrice: number;

  @ApiProperty({ description: "销量", example: 0, default: 0 })
  @Column({ type: "int", default: 0 })
  sales: number;

  @ApiProperty({ description: "库存（所有SKU库存总和）", example: 0, default: 0 })
  @Column({ type: "int", default: 0 })
  stock: number;

  @ApiProperty({ description: "排序值", example: 0, default: 0 })
  @Column({ name: "sort_order", default: 0 })
  sortOrder: number;

  @ApiProperty({ description: "是否推荐: 0-否, 1-是", example: 0, default: 0 })
  @Column({ name: "is_recommend", type: "tinyint", default: 0 })
  isRecommend: number;

  @ApiProperty({ description: "是否新品: 0-否, 1-是", example: 0, default: 0 })
  @Column({ name: "is_new", type: "tinyint", default: 0 })
  isNew: number;

  @ApiProperty({ description: "状态: 0-下架, 1-上架", example: 1, default: 1 })
  @Column({ type: "tinyint", default: 1 })
  status: number;

  @OneToMany(() => ProductSku, (sku) => sku.product)
  skus?: ProductSku[];

  @OneToMany(() => ProductImage, (image) => image.product)
  images?: ProductImage[];
}
