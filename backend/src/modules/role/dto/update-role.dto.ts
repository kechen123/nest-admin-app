import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional, IsArray, IsInt, MinLength, MaxLength, IsIn } from "class-validator";

export class UpdateRoleDto {
  @ApiProperty({ description: "角色名称", required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name?: string;

  @ApiProperty({ description: "角色代码", required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  code?: string;

  @ApiProperty({ description: "数据范围: 1-全部数据, 2-自定义数据, 3-本部门数据, 4-本部门及以下数据, 5-仅本人数据", required: false })
  @IsOptional()
  @IsString()
  @IsIn(["1", "2", "3", "4", "5"])
  dataScope?: string;

  @ApiProperty({ description: "显示顺序", required: false })
  @IsOptional()
  @IsInt()
  orderNum?: number;

  @ApiProperty({ description: "状态: 0-禁用, 1-正常", required: false })
  @IsOptional()
  @IsInt()
  @IsIn([0, 1])
  status?: number;

  @ApiProperty({ description: "备注", required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  remark?: string;

  @ApiProperty({ description: "权限ID数组", required: false, type: [Number] })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  permissions?: number[];

  @ApiProperty({ description: "菜单ID数组", required: false, type: [Number] })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  menuIds?: number[];
}
