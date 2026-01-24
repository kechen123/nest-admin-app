import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { MiniappUser } from '../miniapp-user/miniapp-user.entity';

@Entity('checkin_record')
export class CheckinRecord extends BaseEntity {
  @ApiProperty({ description: '用户ID' })
  @Column({ name: 'user_id' })
  userId: number;

  @ApiProperty({ description: '纬度', example: 39.908823 })
  @Column({ type: 'decimal', precision: 10, scale: 8 })
  latitude: number;

  @ApiProperty({ description: '经度', example: 116.397470 })
  @Column({ type: 'decimal', precision: 11, scale: 8 })
  longitude: number;

  @ApiProperty({ description: '地址描述', example: '北京市朝阳区xxx街道' })
  @Column({ length: 500 })
  address: string;

  @ApiProperty({ description: '打卡内容', required: false })
  @Column({ length: 1000, nullable: true })
  content?: string;

  @ApiProperty({ description: '图片列表（JSON数组）', required: false, type: [String] })
  @Column({ type: 'json', nullable: true })
  images?: string[];

  @ApiProperty({ description: '是否公开: 0-不公开, 1-公开', example: 0, default: 0 })
  @Column({ name: 'is_public', type: 'tinyint', default: 0 })
  isPublic: number;

  @ApiProperty({ description: '状态: 0-已删除, 1-正常', example: 1, default: 1 })
  @Column({ type: 'tinyint', default: 1 })
  status: number;

  @ApiProperty({ description: '审核状态: 0-待审核, 1-已通过, 2-已拒绝', example: 0, default: 0 })
  @Column({ name: 'audit_status', type: 'tinyint', default: 0 })
  auditStatus: number;

  @ApiProperty({ description: '审核备注', required: false })
  @Column({ name: 'audit_remark', length: 500, nullable: true })
  auditRemark?: string;

  @ApiProperty({ description: '审核时间', required: false })
  @Column({ name: 'audit_time', type: 'datetime', nullable: true })
  auditTime?: Date;

  @ApiProperty({ description: '审核人ID', required: false })
  @Column({ name: 'audit_by', nullable: true })
  auditBy?: number;

  // 关联关系
  @ManyToOne(() => MiniappUser, (user) => user.checkinRecords)
  @JoinColumn({ name: 'user_id' })
  user: MiniappUser;
}
