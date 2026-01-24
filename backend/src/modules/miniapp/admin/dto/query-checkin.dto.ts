import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../../../common/dto/pagination.dto';

export class QueryCheckinDto extends PaginationDto {
  @ApiProperty({ description: '用户昵称（模糊查询）', required: false })
  @IsOptional()
  @IsString()
  userNickname?: string;

  @ApiProperty({ description: '审核状态: 0-待审核, 1-已通过, 2-已拒绝', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  auditStatus?: number;

  @ApiProperty({ description: '状态: 0-已删除, 1-正常', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  status?: number;
}
