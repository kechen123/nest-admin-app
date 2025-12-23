import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, MaxLength, MinLength, IsIn } from 'class-validator';

export class UpdatePostDto {
  @ApiProperty({ description: '岗位编码', required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  code?: string;

  @ApiProperty({ description: '岗位名称', required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @ApiProperty({ description: '显示顺序', required: false })
  @IsOptional()
  @IsInt()
  orderNum?: number;

  @ApiProperty({ description: '状态: 0-停用, 1-正常', required: false })
  @IsOptional()
  @IsInt()
  @IsIn([0, 1])
  status?: number;

  @ApiProperty({ description: '备注', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  remark?: string;
}

