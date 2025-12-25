import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../../../common/dto/pagination.dto';

export class QueryOrderDto extends PaginationDto {
  @ApiProperty({ description: '订单号（模糊查询）', required: false })
  @IsString()
  @IsOptional()
  orderNo?: string;

  @ApiProperty({ description: '用户ID', required: false })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  userId?: number;

  @ApiProperty({ description: '订单状态: 0-待付款, 1-待发货, 2-待收货, 3-已完成, 4-已取消', required: false })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(4)
  @IsOptional()
  status?: number;

  @ApiProperty({ description: '支付方式: 0-未支付, 1-微信支付, 2-余额支付', required: false })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(2)
  @IsOptional()
  payType?: number;
}

