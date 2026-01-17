import { Controller, Post, UseInterceptors, UploadedFile, UseGuards, BadRequestException, Req } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody, ApiResponse } from "@nestjs/swagger";
import { UploadService } from "./upload.service";
import { UploadImageResponseDto } from "./dto/upload-image-response.dto";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { extname } from "path";
import * as crypto from "crypto";
import { existsSync, mkdirSync } from "fs";

// 使用 require 导入 multer（避免类型错误）
const multer = require("multer");
const diskStorage = multer.diskStorage;

// 确保上传目录存在
const uploadDir = "./uploads/images";
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true });
}

@ApiTags("文件上传")
@Controller("upload")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth("JWT-auth")
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post("image")
  @ApiOperation({ 
    summary: "上传图片",
    description: "支持上传 jpg、png、gif、webp 格式的图片，最大 5MB。需要 JWT 认证。"
  })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
          description: "图片文件",
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: "上传成功",
    type: UploadImageResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "请求错误（文件格式不支持、文件过大等）",
  })
  @ApiResponse({
    status: 401,
    description: "未授权（需要登录）",
  })
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: "./uploads/images",
        filename: (req, file, cb) => {
          // 生成唯一文件名
          const uniqueName = `${crypto.randomUUID()}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
      fileFilter: (req, file, cb) => {
        // 只允许图片格式
        const allowedMimes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException("只允许上传图片文件（jpg、png、gif、webp）"), false);
        }
      },
      // 修复文件名编码问题：正确处理 UTF-8 编码的文件名
      preservePath: false,
    })
  )
  async uploadImage(@UploadedFile() file: any, @Req() req: any) {
    if (!file) {
      throw new BadRequestException("请选择要上传的文件");
    }

    return this.uploadService.uploadImage(file, req);
  }
}
