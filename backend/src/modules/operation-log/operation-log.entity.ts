import { Entity, Column, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('operation_logs')
export class OperationLog {
  @ApiProperty({ description: 'ID' })
  @Column({ primary: true, generated: true })
  id: number;

  @ApiProperty({ description: '操作模块', required: false })
  @Column({ length: 100, nullable: true })
  title?: string;

  @ApiProperty({ description: '业务类型', required: false })
  @Column({ name: 'business_type', length: 50, nullable: true })
  businessType?: string;

  @ApiProperty({ description: '方法名称', required: false })
  @Column({ length: 100, nullable: true })
  method?: string;

  @ApiProperty({ description: '请求方式', required: false })
  @Column({ name: 'request_method', length: 10, nullable: true })
  requestMethod?: string;

  @ApiProperty({ description: '操作类别: 0-其它, 1-后台用户', default: 0 })
  @Column({ name: 'operator_type', type: 'tinyint', default: 0 })
  operatorType: number;

  @ApiProperty({ description: '操作人员ID', required: false })
  @Index()
  @Column({ name: 'user_id', nullable: true })
  userId?: number;

  @ApiProperty({ description: '操作人员账号', required: false })
  @Column({ length: 50, nullable: true })
  username?: string;

  @ApiProperty({ description: '请求URL', required: false })
  @Column({ name: 'oper_url', length: 500, nullable: true })
  operUrl?: string;

  @ApiProperty({ description: '操作IP', required: false })
  @Column({ name: 'oper_ip', length: 50, nullable: true })
  operIp?: string;

  @ApiProperty({ description: '操作地点', required: false })
  @Column({ name: 'oper_location', length: 255, nullable: true })
  operLocation?: string;

  @ApiProperty({ description: '请求参数', required: false })
  @Column({ name: 'oper_param', type: 'text', nullable: true })
  operParam?: string;

  @ApiProperty({ description: '返回参数', required: false })
  @Column({ name: 'json_result', type: 'text', nullable: true })
  jsonResult?: string;

  @ApiProperty({ description: '操作状态: 0-异常, 1-正常', default: 1 })
  @Index()
  @Column({ type: 'tinyint', default: 1 })
  status: number;

  @ApiProperty({ description: '错误消息', required: false })
  @Column({ name: 'error_msg', type: 'text', nullable: true })
  errorMsg?: string;

  @ApiProperty({ description: '操作时间' })
  @Index()
  @Column({ name: 'oper_time', type: 'datetime', nullable: true })
  operTime?: Date;
}

