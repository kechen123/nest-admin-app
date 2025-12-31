import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsIn, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @ApiProperty({ description: '商品ID' })
  @IsInt()
  productId: number;

  @ApiProperty({ description: 'SKU ID' })
  @IsInt()
  skuId: number;

  @ApiProperty({ description: '商品名称' })
  @IsString()
  productName: string;

  @ApiProperty({ description: '规格名称', required: false })
  @IsOptional()
  @IsString()
  specValues?: string;

  @ApiProperty({ description: '商品价格' })
  @IsNumber()
  price: number;

  @ApiProperty({ description: '购买数量' })
  @IsInt()
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({ description: '收货地址ID', required: false })
  @IsOptional()
  @IsInt()
  addressId?: number;

  @ApiProperty({ description: '订单商品项数组（直接购买）', required: false, type: [OrderItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items?: OrderItemDto[];

  @ApiProperty({ description: '购物车项ID数组（从购物车下单）', required: false })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
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

  @ApiProperty({ description: '支付方式: 1-微信支付, 2-余额支付', required: false, example: 1 })
  @IsOptional()
  @IsInt()
  @IsIn([1, 2])
  payType?: number;
}

