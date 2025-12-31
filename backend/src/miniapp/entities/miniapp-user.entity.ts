import { Entity, Column, OneToMany } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { BaseEntity } from "../../common/entities/base.entity";
import { Address } from "./address.entity";
import { CartItem } from "./cart-item.entity";
import { Order } from "./order.entity";

@Entity("miniapp_users")
export class MiniappUser extends BaseEntity {
  @ApiProperty({ description: "微信openid", example: "oUpF8uMuAJO_M2pxb1Q9zNjWeS6o" })
  @Column({ unique: true, length: 100 })
  openid: string;

  @ApiProperty({ description: "微信unionid", required: false })
  @Column({ length: 100, nullable: true })
  unionid?: string;

  @ApiProperty({ description: "微信昵称", required: false })
  @Column({ length: 100, nullable: true })
  nickname?: string;

  @ApiProperty({ description: "微信头像", required: false })
  @Column({ length: 500, nullable: true })
  avatar?: string;

  @ApiProperty({ description: "手机号", required: false })
  @Column({ length: 20, nullable: true })
  phone?: string;

  @Column({ length: 255, nullable: true, select: false })
  password?: string;

  @ApiProperty({ description: "性别: 0-未知, 1-男, 2-女", example: 0, default: 0 })
  @Column({ type: "tinyint", default: 0 })
  gender: number;

  @ApiProperty({ description: "账户余额（元）", example: 0, default: 0 })
  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  balance: number;

  @ApiProperty({ description: "积分", example: 0, default: 0 })
  @Column({ type: "int", default: 0 })
  points: number;

  @ApiProperty({ description: "会员等级: 0-普通, 1-银卡, 2-金卡, 3-钻石", example: 0, default: 0 })
  @Column({ name: "member_level", type: "tinyint", default: 0 })
  memberLevel: number;

  @ApiProperty({ description: "累计消费金额（元）", example: 0, default: 0 })
  @Column({ name: "total_consumption", type: "decimal", precision: 10, scale: 2, default: 0 })
  totalConsumption: number;

  @ApiProperty({ description: "状态: 0-禁用, 1-正常", example: 1, default: 1 })
  @Column({ type: "tinyint", default: 1 })
  status: number;

  @OneToMany(() => Address, (address) => address.user)
  addresses?: Address[];

  @OneToMany(() => CartItem, (cartItem) => cartItem.user)
  cartItems?: CartItem[];

  @OneToMany(() => Order, (order) => order.user)
  orders?: Order[];
}

