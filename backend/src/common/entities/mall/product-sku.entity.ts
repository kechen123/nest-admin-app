import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { BaseEntity } from "../base.entity";
import { Product } from "./product.entity";

@Entity("product_skus")
export class ProductSku extends BaseEntity {
  @ApiProperty({ description: "商品ID" })
  @Column({ name: "product_id" })
  productId: number;

  @ManyToOne(() => Product, (product) => product.skus)
  @JoinColumn({ name: "product_id" })
  product?: Product;

  @ApiProperty({ description: "SKU编码", example: "IPHONE15PM-256-BLACK" })
  @Column({ name: "sku_code", length: 100, unique: true })
  skuCode: string;

  @ApiProperty({ description: "规格名称", example: "256GB 深空黑色" })
  @Column({ name: "spec_name", length: 200 })
  specName: string;

  @ApiProperty({ description: "规格值（JSON格式）", example: '{"color":"黑色","storage":"256GB"}' })
  @Column({ name: "spec_values", type: "text" })
  specValues: string;

  @ApiProperty({ description: "价格（元）", example: 9999.00 })
  @Column({ type: "decimal", precision: 10, scale: 2 })
  price: number;

  @ApiProperty({ description: "原价（元）", required: false })
  @Column({ name: "original_price", type: "decimal", precision: 10, scale: 2, nullable: true })
  originalPrice?: number;

  @ApiProperty({ description: "库存", example: 100 })
  @Column({ type: "int", default: 0 })
  stock: number;

  @ApiProperty({ description: "销量", example: 0, default: 0 })
  @Column({ type: "int", default: 0 })
  sales: number;

  @ApiProperty({ description: "SKU图片", required: false })
  @Column({ length: 500, nullable: true })
  image?: string;

  @ApiProperty({ description: "状态: 0-禁用, 1-启用", example: 1, default: 1 })
  @Column({ type: "tinyint", default: 1 })
  status: number;
}

