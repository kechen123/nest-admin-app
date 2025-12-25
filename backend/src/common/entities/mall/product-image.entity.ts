import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { BaseEntity } from "../base.entity";
import { Product } from "./product.entity";

@Entity("product_images")
export class ProductImage extends BaseEntity {
  @ApiProperty({ description: "商品ID" })
  @Column({ name: "product_id" })
  productId: number;

  @ManyToOne(() => Product, (product) => product.images)
  @JoinColumn({ name: "product_id" })
  product?: Product;

  @ApiProperty({ description: "图片URL" })
  @Column({ length: 500 })
  url: string;

  @ApiProperty({ description: "排序值", example: 0, default: 0 })
  @Column({ name: "sort_order", default: 0 })
  sortOrder: number;
}

