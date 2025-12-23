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

  @ApiProperty({ description: '菜单类型: M-目录, C-菜单, F-按钮', required: false })
  @IsOptional()
  @IsString()
  @IsIn(['M', 'C', 'F'])
  menuType?: string;

  @ApiProperty({ description: '显示状态: 0-隐藏, 1-显示', required: false })
  @IsOptional()
  @IsInt()
  @IsIn([0, 1])
  visible?: number;

  @ApiProperty({ description: '是否缓存: 0-缓存, 1-不缓存', required: false })
  @IsOptional()
  @IsInt()
  @IsIn([0, 1])
  isCache?: number;

  @ApiProperty({ description: '路由参数', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  query?: string;

  @ApiProperty({ description: '备注', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  remark?: string;
}

