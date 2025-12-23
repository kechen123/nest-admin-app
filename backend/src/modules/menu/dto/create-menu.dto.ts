import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  MaxLength,
  IsIn,
} from 'class-validator';

export class CreateMenuDto {
  @ApiProperty({ description: '菜单名称', example: '用户管理' })
  @IsString()
  @MaxLength(50)
  name: string;

  @ApiProperty({ description: '菜单标题', example: '用户管理' })
  @IsString()
  @MaxLength(50)
  title: string;

  @ApiProperty({ description: '路由路径', example: '/user', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  path?: string;

  @ApiProperty({ description: '图标', example: 'User', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string;

  @ApiProperty({ description: '父菜单ID', example: null, required: false })
  @IsOptional()
  @IsInt()
  parentId?: number;

  @ApiProperty({ description: '组件路径', example: 'Layout', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  component?: string;

  @ApiProperty({ description: '排序', example: 0, default: 0, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  sort?: number;

  @ApiProperty({ description: '状态: 0-禁用, 1-启用', example: 1, default: 1, required: false })
  @IsOptional()
  @IsInt()
  @IsIn([0, 1])
  status?: number;

  @ApiProperty({ description: '关联的权限代码', example: 'user', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  permissionCode?: string;

  @ApiProperty({ description: '是否外部链接: 0-否, 1-是', example: 0, default: 0, required: false })
  @IsOptional()
  @IsInt()
  @IsIn([0, 1])
  isExternal?: number;

  @ApiProperty({ description: '菜单类型: M-目录, C-菜单, F-按钮', example: 'C', default: 'C', required: false })
  @IsOptional()
  @IsString()
  @IsIn(['M', 'C', 'F'])
  menuType?: string;

  @ApiProperty({ description: '显示状态: 0-隐藏, 1-显示', example: 1, default: 1, required: false })
  @IsOptional()
  @IsInt()
  @IsIn([0, 1])
  visible?: number;

  @ApiProperty({ description: '是否缓存: 0-缓存, 1-不缓存', example: 0, default: 0, required: false })
  @IsOptional()
  @IsInt()
  @IsIn([0, 1])
  isCache?: number;

  @ApiProperty({ description: '路由参数', example: '', required: false })
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

