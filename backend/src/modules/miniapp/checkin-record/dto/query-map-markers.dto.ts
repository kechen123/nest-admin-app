import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryMapMarkersDto {
  @ApiProperty({ 
    description: '中心点纬度（用于位置范围查询）。如果提供此参数，必须同时提供 longitude 和 radius', 
    example: 39.908823, 
    required: false 
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiProperty({ 
    description: '中心点经度（用于位置范围查询）。如果提供此参数，必须同时提供 latitude 和 radius', 
    example: 116.397470, 
    required: false 
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  longitude?: number;

  @ApiProperty({ 
    description: '查询半径（公里）。范围：0.1 - 1000 公里。如果提供了 latitude 和 longitude，则只返回该范围内的点位', 
    example: 10, 
    default: 10, 
    required: false 
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0.1)
  @Max(1000)
  @IsOptional()
  radius?: number = 10;

  @ApiProperty({ 
    description: `是否包含公开的打卡。
- true（默认）：包含公开数据。如果用户已登录，也会包含用户自己和绑定用户的私密点位数据
- false：只返回用户和绑定用户的打卡记录（需要登录）`, 
    example: true, 
    default: true, 
    required: false 
  })
  @Type(() => Boolean)
  @IsOptional()
  includePublic?: boolean = true;
}
