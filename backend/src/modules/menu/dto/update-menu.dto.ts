import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, Min, MaxLength, IsIn } from 'class-validator';

export class UpdateMenuDto {
  @ApiProperty({ description: '菜单名称', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string;

  @ApiProperty({ description: '菜单标题', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  title?: string;

  @ApiProperty({ description: '路由路径', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  path?: string;

  @ApiProperty({ description: '图标', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string;

  @ApiProperty({ description: '父菜单ID', required: false })
  @IsOptional()
  @IsInt()
  parentId?: number;

  @ApiProperty({ description: '组件路径', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  component?: string;

  @ApiProperty({ description: '排序', required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  sort?: number;

  @ApiProperty({ description: '状态: 0-禁用, 1-启用', required: false })
  @IsOptional()
  @IsInt()
  @IsIn([0, 1])
  status?: number;

  @ApiProperty({ description: '关联的权限代码', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  permissionCode?: string;

  @ApiProperty({ description: '是否外部链接: 0-否, 1-是', required: false })
  @IsOptional()
  @IsInt()
  @IsIn([0, 1])
  isExternal?: number;
}

