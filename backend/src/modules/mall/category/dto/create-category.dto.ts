import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsOptional, IsInt, Min, Max } from "class-validator";

export class CreateCategoryDto {
  @ApiProperty({ description: "分类名称", example: "手机数码" })
  @IsString()
  @IsNotEmpty({ message: "分类名称不能为空" })
  name: string;

  @ApiProperty({ description: "分类图标", required: false })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiProperty({ description: "父分类ID", example: 0, default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  parentId?: number;

  @ApiProperty({ description: "显示顺序", example: 0, default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  orderNum?: number;

  @ApiProperty({ description: "状态: 0-禁用, 1-启用", example: 1, default: 1 })
  @IsInt()
  @Min(0)
  @Max(1)
  @IsOptional()
  status?: number;
}
