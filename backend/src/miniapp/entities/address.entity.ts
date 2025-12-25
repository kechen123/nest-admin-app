import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { BaseEntity } from "../../common/entities/base.entity";
import { MiniappUser } from "./miniapp-user.entity";

@Entity("addresses")
export class Address extends BaseEntity {
  @ApiProperty({ description: "用户ID" })
  @Column({ name: "user_id" })
  userId: number;

  @ManyToOne(() => MiniappUser, (user) => user.addresses)
  @JoinColumn({ name: "user_id" })
  user?: MiniappUser;

  @ApiProperty({ description: "收货人姓名", example: "张三" })
  @Column({ name: "receiver_name", length: 50 })
  receiverName: string;

  @ApiProperty({ description: "收货人电话", example: "13800138000" })
  @Column({ name: "receiver_phone", length: 20 })
  receiverPhone: string;

  @ApiProperty({ description: "省份", example: "广东省" })
  @Column({ length: 50 })
  province: string;

  @ApiProperty({ description: "城市", example: "深圳市" })
  @Column({ length: 50 })
  city: string;

  @ApiProperty({ description: "区县", example: "南山区" })
  @Column({ length: 50 })
  district: string;

  @ApiProperty({ description: "详细地址", example: "科技园南区" })
  @Column({ name: "detail_address", length: 200 })
  detailAddress: string;

  @ApiProperty({ description: "邮政编码", required: false })
  @Column({ name: "postal_code", length: 10, nullable: true })
  postalCode?: string;

  @ApiProperty({ description: "是否默认地址: 0-否, 1-是", example: 0, default: 0 })
  @Column({ name: "is_default", type: "tinyint", default: 0 })
  isDefault: number;
}

