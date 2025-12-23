import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, MaxLength, MinLength, IsIn } from 'class-validator';

export class CreateDictDataDto {
  @ApiProperty({ description: '字典排序', example: 0, default: 0, required: false })
  @IsOptional()
  @IsInt()
  dictSort?: number;

  @ApiProperty({ description: '字典标签', example: '男' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  dictLabel: string;

  @ApiProperty({ description: '字典键值', example: '1' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  dictValue: string;

  @ApiProperty({ description: '字典类型', example: 'sys_user_sex' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  dictType: string;

  @ApiProperty({ description: '样式属性', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  cssClass?: string;

  @ApiProperty({ description: '表格回显样式', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  listClass?: string;

  @ApiProperty({ description: '是否默认: 0-否, 1-是', example: 0, default: 0, required: false })
  @IsOptional()
  @IsInt()
  @IsIn([0, 1])
  isDefault?: number;

  @ApiProperty({ description: '状态: 0-停用, 1-正常', example: 1, default: 1, required: false })
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

