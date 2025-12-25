import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min, Max } from 'class-validator';

export class UpdateOrderStatusDto {
  @ApiProperty({ description: '订单状态: 0-待付款, 1-待发货, 2-待收货, 3-已完成, 4-已取消' })
  @IsInt()
  @Min(0)
  @Max(4)
  status: number;
}

