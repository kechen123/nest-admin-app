import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class AdjustBalanceDto {
  @ApiProperty({ description: '调整金额（正数为增加，负数为减少）', example: 100.00 })
  @IsNumber()
  @Min(-999999.99)
  amount: number;

  @ApiProperty({ description: '备注', required: false })
  remark?: string;
}

