import { Entity, Column, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { UserCouple } from '../user-couple/user-couple.entity';
import { CheckinRecord } from '../checkin-record/checkin-record.entity';

@Entity('miniapp_user')
export class MiniappUser extends BaseEntity {
  @ApiProperty({ description: '微信openid', example: 'oUpF8uMuAJO_M2pxb1Q9zNjWeS6o' })
  @Column({ unique: true, length: 100 })
  openid: string;

  @ApiProperty({ description: '微信unionid', required: false })
  @Column({ length: 100, nullable: true })
  unionid?: string;

  @ApiProperty({ description: '昵称', required: false })
  @Column({ length: 50, nullable: true })
  nickname?: string;

  @ApiProperty({ description: '头像URL', required: false })
  @Column({ length: 500, nullable: true })
  avatar?: string;

  @ApiProperty({ description: '性别: 0-未知, 1-男, 2-女', example: 0, default: 0 })
  @Column({ type: 'tinyint', default: 0 })
  gender: number;

  @ApiProperty({ description: '手机号', required: false })
  @Column({ length: 20, nullable: true })
  phone?: string;

  @ApiProperty({ description: '状态: 0-禁用, 1-正常', example: 1, default: 1 })
  @Column({ type: 'tinyint', default: 1 })
  status: number;

  @ApiProperty({ description: '最后登录时间', required: false })
  @Column({ name: 'last_login_time', type: 'datetime', nullable: true })
  lastLoginTime?: Date;

  @ApiProperty({ description: '最后登录IP', required: false })
  @Column({ name: 'last_login_ip', length: 50, nullable: true })
  lastLoginIp?: string;

  // 关联关系
  @OneToMany(() => UserCouple, (couple) => couple.user)
  couples: UserCouple[];

  @OneToMany(() => UserCouple, (couple) => couple.partner)
  partnerCouples: UserCouple[];

  @OneToMany(() => CheckinRecord, (record) => record.user)
  checkinRecords: CheckinRecord[];
}
