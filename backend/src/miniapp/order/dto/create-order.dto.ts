import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsIn } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({ description: '收货地址ID' })
  @IsInt()
  addressId: number;

  @ApiProperty({ description: '购物车项ID数组（从购物车下单）', required: false })
  @IsOptional()
  cartItemIds?: number[];

  @ApiProperty({ description: '商品ID（直接购买）', required: false })
  @IsOptional()
  @IsInt()
  productId?: number;

  @ApiProperty({ description: 'SKU ID（直接购买）', required: false })
  @IsOptional()
  @IsInt()
  skuId?: number;

  @ApiProperty({ description: '商品数量（直接购买）', required: false })
  @IsOptional()
  @IsInt()
  quantity?: number;

  @ApiProperty({ description: '订单备注', required: false })
  @IsOptional()
  @IsString()
  remark?: string;

  @ApiProperty({ description: '支付方式: 1-微信支付, 2-余额支付', example: 1 })
  @IsInt()
  @IsIn([1, 2])
  payType: number;
}

