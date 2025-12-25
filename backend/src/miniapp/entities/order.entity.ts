import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { BaseEntity } from "../../common/entities/base.entity";
import { MiniappUser } from "./miniapp-user.entity";
import { OrderItem } from "./order-item.entity";

@Entity("orders")
export class Order extends BaseEntity {
  @ApiProperty({ description: "订单号", example: "202401011234567890" })
  @Column({ name: "order_no", unique: true, length: 50 })
  orderNo: string;

  @ApiProperty({ description: "用户ID" })
  @Column({ name: "user_id" })
  userId: number;

  @ManyToOne(() => MiniappUser, (user) => user.orders)
  @JoinColumn({ name: "user_id" })
  user?: MiniappUser;

  @ApiProperty({ description: "订单状态: 0-待付款, 1-待发货, 2-待收货, 3-已完成, 4-已取消", example: 0 })
  @Column({ type: "tinyint", default: 0 })
  status: number;

  @ApiProperty({ description: "商品总金额（元）", example: 9999.00 })
  @Column({ name: "total_amount", type: "decimal", precision: 10, scale: 2 })
  totalAmount: number;

  @ApiProperty({ description: "运费（元）", example: 0, default: 0 })
  @Column({ name: "shipping_fee", type: "decimal", precision: 10, scale: 2, default: 0 })
  shippingFee: number;

  @ApiProperty({ description: "优惠金额（元）", example: 0, default: 0 })
  @Column({ name: "discount_amount", type: "decimal", precision: 10, scale: 2, default: 0 })
  discountAmount: number;

  @ApiProperty({ description: "实付金额（元）", example: 9999.00 })
  @Column({ name: "pay_amount", type: "decimal", precision: 10, scale: 2 })
  payAmount: number;

  @ApiProperty({ description: "收货地址ID" })
  @Column({ name: "address_id" })
  addressId: number;

  @ApiProperty({ description: "收货人姓名", example: "张三" })
  @Column({ name: "receiver_name", length: 50 })
  receiverName: string;

  @ApiProperty({ description: "收货人电话", example: "13800138000" })
  @Column({ name: "receiver_phone", length: 20 })
  receiverPhone: string;

  @ApiProperty({ description: "收货地址", example: "广东省深圳市南山区科技园南区" })
  @Column({ name: "receiver_address", length: 500 })
  receiverAddress: string;

  @ApiProperty({ description: "订单备注", required: false })
  @Column({ length: 500, nullable: true })
  remark?: string;

  @ApiProperty({ description: "支付方式: 0-未支付, 1-微信支付, 2-余额支付", example: 0, default: 0 })
  @Column({ name: "pay_type", type: "tinyint", default: 0 })
  payType: number;

  @ApiProperty({ description: "支付时间", required: false })
  @Column({ name: "pay_time", type: "datetime", nullable: true })
  payTime?: Date;

  @ApiProperty({ description: "发货时间", required: false })
  @Column({ name: "ship_time", type: "datetime", nullable: true })
  shipTime?: Date;

  @ApiProperty({ description: "确认收货时间", required: false })
  @Column({ name: "confirm_time", type: "datetime", nullable: true })
  confirmTime?: Date;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
  items?: OrderItem[];
}

