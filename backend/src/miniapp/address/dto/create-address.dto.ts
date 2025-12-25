import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Length, IsOptional } from 'class-validator';

export class CreateAddressDto {
  @ApiProperty({ description: '收货人姓名', example: '张三' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  receiverName: string;

  @ApiProperty({ description: '收货人电话', example: '13800138000' })
  @IsString()
  @IsNotEmpty()
  @Length(11, 20)
  receiverPhone: string;

  @ApiProperty({ description: '省份', example: '广东省' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  province: string;

  @ApiProperty({ description: '城市', example: '深圳市' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  city: string;

  @ApiProperty({ description: '区县', example: '南山区' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  district: string;

  @ApiProperty({ description: '详细地址', example: '科技园南区' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  detailAddress: string;

  @ApiProperty({ description: '邮政编码', required: false })
  @IsOptional()
  @IsString()
  @Length(6, 10)
  postalCode?: string;

  @ApiProperty({ description: '是否默认地址: 0-否, 1-是', example: 0, default: 0 })
  @IsOptional()
  isDefault?: number;
}

