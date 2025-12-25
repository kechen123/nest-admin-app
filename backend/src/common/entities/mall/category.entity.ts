import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { BaseEntity } from "../base.entity";
import { Product } from "./product.entity";

@Entity("categories")
export class Category extends BaseEntity {
  @ApiProperty({ description: "分类名称", example: "手机数码" })
  @Column({ length: 100 })
  name: string;

  @ApiProperty({ description: "分类图标", required: false })
  @Column({ length: 500, nullable: true })
  icon?: string;

  @ApiProperty({ description: "父分类ID", example: 0, default: 0 })
  @Column({ name: "parent_id", default: 0 })
  parentId: number;

  @ManyToOne(() => Category, (category) => category.children, { nullable: true, createForeignKeyConstraints: false })
  @JoinColumn({ name: "parent_id" })
  parent?: Category;

  @OneToMany(() => Category, (category) => category.parent)
  children?: Category[];

  @ApiProperty({ description: "显示顺序", example: 0, default: 0 })
  @Column({ name: "order_num", default: 0 })
  orderNum: number;

  @ApiProperty({ description: "状态: 0-禁用, 1-启用", example: 1, default: 1 })
  @Column({ type: "tinyint", default: 1 })
  status: number;

  @OneToMany(() => Product, (product) => product.category)
  products?: Product[];
}

