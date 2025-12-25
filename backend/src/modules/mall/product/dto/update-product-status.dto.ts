import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min, Max } from 'class-validator';

export class UpdateProductStatusDto {
  @ApiProperty({ description: '状态: 0-下架, 1-上架' })
  @IsInt()
  @Min(0)
  @Max(1)
  status: number;
}

