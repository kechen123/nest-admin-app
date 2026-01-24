import { Entity, Column, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('invite_config')
export class InviteConfig extends BaseEntity {
  @ApiProperty({ description: '邀请标题', example: '邀请你共同记录美好时光' })
  @Column({ name: 'title', length: 200 })
  title: string;

  @ApiProperty({ description: '邀请图片URL', example: '/static/images/invite-share.png' })
  @Column({ name: 'image_url', length: 500 })
  imageUrl: string;

  @ApiProperty({ description: '是否启用: 0-未启用, 1-启用', example: 0, default: 0 })
  @Column({ name: 'is_enabled', type: 'tinyint', default: 0 })
  @Index()
  isEnabled: number;

  @ApiProperty({ description: '排序', example: 0, default: 0 })
  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @ApiProperty({ description: '备注', required: false })
  @Column({ name: 'remark', length: 500, nullable: true })
  remark?: string;
}
