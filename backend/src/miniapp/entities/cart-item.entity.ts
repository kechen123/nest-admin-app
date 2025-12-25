import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { BaseEntity } from "../../common/entities/base.entity";
import { MiniappUser } from "./miniapp-user.entity";
import { ProductSku } from "./product-sku.entity";

@Entity("cart_items")
export class CartItem extends BaseEntity {
  @ApiProperty({ description: "用户ID" })
  @Column({ name: "user_id" })
  userId: number;

  @ManyToOne(() => MiniappUser, (user) => user.cartItems)
  @JoinColumn({ name: "user_id" })
  user?: MiniappUser;

  @ApiProperty({ description: "商品ID" })
  @Column({ name: "product_id" })
  productId: number;

  @ApiProperty({ description: "SKU ID" })
  @Column({ name: "sku_id" })
  skuId: number;

  @ManyToOne(() => ProductSku)
  @JoinColumn({ name: "sku_id" })
  sku?: ProductSku;

  @ApiProperty({ description: "商品数量", example: 1 })
  @Column({ type: "int", default: 1 })
  quantity: number;

  @ApiProperty({ description: "是否选中: 0-否, 1-是", example: 1, default: 1 })
  @Column({ name: "is_selected", type: "tinyint", default: 1 })
  isSelected: number;
}

