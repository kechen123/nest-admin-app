import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsOptional, IsInt, Min, Max } from "class-validator";

export class CreateBannerDto {
  @ApiProperty({ description: "标题", example: "春季新品上市" })
  @IsString()
  @IsNotEmpty({ message: "标题不能为空" })
  title: string;

  @ApiProperty({ description: "图片URL" })
  @IsString()
  @IsNotEmpty({ message: "图片URL不能为空" })
  image: string;

  @ApiProperty({ description: "跳转类型: 0-无, 1-商品, 2-分类, 3-链接", example: 1, default: 0 })
  @IsInt()
  @Min(0)
  @Max(3)
  @IsOptional()
  linkType?: number;

  @ApiProperty({ description: "跳转值（商品ID/分类ID/链接URL）", required: false })
  @IsString()
  @IsOptional()
  linkValue?: string;

  @ApiProperty({ description: "排序值", example: 0, default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number;

  @ApiProperty({ description: "状态: 0-禁用, 1-启用", example: 1, default: 1 })
  @IsInt()
  @Min(0)
  @Max(1)
  @IsOptional()
  status?: number;
}

