import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional, IsArray, MaxLength } from 'class-validator';

export class UpdateCheckinDto {
  @ApiProperty({ description: '纬度', required: false })
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiProperty({ description: '经度', required: false })
  @IsNumber()
  @IsOptional()
  longitude?: number;

  @ApiProperty({ description: '地址描述', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  address?: string;

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
