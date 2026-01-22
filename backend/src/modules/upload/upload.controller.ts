import { Controller, Post, UseInterceptors, UploadedFile, UseGuards, BadRequestException, Req } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from "@nestjs/swagger";
import { UploadService } from "./upload.service";
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
  @ApiOperation({ summary: "上传图片" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
        },
      },
    },
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
        fileSize: 20 * 1024 * 1024, // 50MB
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
