import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class AddCartDto {
  @ApiProperty({ description: '商品ID', example: 1 })
  @IsInt()
  productId: number;

  @ApiProperty({ description: 'SKU ID', example: 1 })
  @IsInt()
  skuId: number;

  @ApiProperty({ description: '商品数量', example: 1, default: 1 })
  @IsInt()
  @Min(1)
  quantity: number;
}

