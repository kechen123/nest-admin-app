import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class AuditCheckinDto {
  @ApiProperty({ description: '审核状态: 1-已通过, 2-已拒绝', example: 1 })
  @Type(() => Number)
  @IsInt()
  @IsIn([1, 2])
  auditStatus: number;

  @ApiProperty({ description: '审核备注', required: false, maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  auditRemark?: string;
}
