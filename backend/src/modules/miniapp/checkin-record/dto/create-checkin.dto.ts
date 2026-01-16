import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsNotEmpty, IsOptional, IsArray, MaxLength } from 'class-validator';

export class CreateCheckinDto {
  @ApiProperty({ description: '纬度', example: 39.908823 })
  @IsNumber()
  @IsNotEmpty()
  latitude: number;

  @ApiProperty({ description: '经度', example: 116.397470 })
  @IsNumber()
  @IsNotEmpty()
  longitude: number;

  @ApiProperty({ description: '地址描述', example: '北京市朝阳区xxx街道' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  address: string;

  @ApiProperty({ description: '打卡内容', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  content?: string;

  @ApiProperty({ description: '图片列表', required: false, type: [String] })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  images?: string[];
}
