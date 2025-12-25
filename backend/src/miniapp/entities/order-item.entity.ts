import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { BaseEntity } from "../../common/entities/base.entity";
import { Order } from "./order.entity";
import { ProductSku } from "./product-sku.entity";

@Entity("order_items")
export class OrderItem extends BaseEntity {
  @ApiProperty({ description: "订单ID" })
  @Column({ name: "order_id" })
  orderId: number;

  @ManyToOne(() => Order, (order) => order.items)
  @JoinColumn({ name: "order_id" })
  order?: Order;

  @ApiProperty({ description: "商品ID" })
  @Column({ name: "product_id" })
  productId: number;

  @ApiProperty({ description: "商品名称", example: "iPhone 15 Pro Max" })
  @Column({ name: "product_name", length: 200 })
  productName: string;

  @ApiProperty({ description: "SKU ID" })
  @Column({ name: "sku_id" })
  skuId: number;

  @ManyToOne(() => ProductSku)
  @JoinColumn({ name: "sku_id" })
  sku?: ProductSku;

  @ApiProperty({ description: "规格名称", example: "256GB 深空黑色" })
  @Column({ name: "spec_name", length: 200 })
  specName: string;

  @ApiProperty({ description: "商品图片", required: false })
  @Column({ length: 500, nullable: true })
  image?: string;

  @ApiProperty({ description: "单价（元）", example: 9999.00 })
  @Column({ type: "decimal", precision: 10, scale: 2 })
  price: number;

  @ApiProperty({ description: "数量", example: 1 })
  @Column({ type: "int" })
  quantity: number;

  @ApiProperty({ description: "小计金额（元）", example: 9999.00 })
  @Column({ type: "decimal", precision: 10, scale: 2 })
  subtotal: number;
}

