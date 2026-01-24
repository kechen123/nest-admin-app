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
const memoryStorage = multer.memoryStorage;

// 确保上传目录存在
const uploadDir = "./uploads/images";
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true });
}

// 确保头像上传目录存在
const avatarDir = "./uploads/images/avatar";
if (!existsSync(avatarDir)) {
  mkdirSync(avatarDir, { recursive: true });
}

@ApiTags("文件上传")
@Controller("upload")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth("JWT-auth")
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post("image")
  @ApiOperation({ 
    summary: "上传图片（本地存储）",
    description: "支持上传 jpg、png、gif、webp 格式的图片，最大 20MB。文件存储在服务器本地。需要 JWT 认证。"
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
        fileSize: 20 * 1024 * 1024, // 20MB
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

  @Post("avatar")
  @ApiOperation({ 
    summary: "上传头像（本地存储）",
    description: "支持上传 jpg、png、gif、webp 格式的头像图片，最大 20MB。文件存储在服务器本地 uploads/images/avatar/ 目录。需要 JWT 认证。"
  })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
          description: "头像图片文件",
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
        destination: "./uploads/images/avatar",
        filename: (req, file, cb) => {
          // 生成唯一文件名
          const uniqueName = `${crypto.randomUUID()}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      limits: {
        fileSize: 20 * 1024 * 1024, // 20MB
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
  async uploadAvatar(@UploadedFile() file: any, @Req() req: any) {
    if (!file) {
      throw new BadRequestException("请选择要上传的文件");
    }

    return this.uploadService.uploadAvatar(file, req);
  }

  @Post("avatar/cos")
  @ApiOperation({ 
    summary: "上传头像到腾讯云COS",
    description: "支持上传 jpg、png、gif、webp 格式的头像图片，最大 20MB。文件上传到腾讯云对象存储（COS）的 avatar 目录。\n\n**使用前请确保已配置以下环境变量：**\n- COS_SECRET_ID: 腾讯云SecretId\n- COS_SECRET_KEY: 腾讯云SecretKey\n- COS_BUCKET: 存储桶名称\n- COS_REGION: 地域（如：ap-beijing）\n- COS_DOMAIN: 自定义域名（可选）\n\n**适用场景：**\n- 生产环境头像存储\n- 需要CDN加速的场景\n- 小程序头像上传\n\n需要 JWT 认证。"
  })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
          description: "头像图片文件",
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
  @ApiResponse({
    status: 500,
    description: "COS配置错误或上传失败",
  })
  @UseInterceptors(
    FileInterceptor("file", {
      storage: memoryStorage(), // 使用内存存储，以便获取文件流上传到COS
      limits: {
        fileSize: 20 * 1024 * 1024, // 20MB
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
  async uploadAvatarToCos(@UploadedFile() file: any, @Req() req: any) {
    if (!file) {
      throw new BadRequestException("请选择要上传的文件");
    }

    return this.uploadService.uploadAvatarToCos(file, req);
  }

  @Post("image/cos")
  @ApiOperation({ 
    summary: "上传图片到腾讯云COS",
    description: "支持上传 jpg、png、gif、webp 格式的图片，最大 20MB。文件上传到腾讯云对象存储（COS）。\n\n**使用前请确保已配置以下环境变量：**\n- COS_SECRET_ID: 腾讯云SecretId\n- COS_SECRET_KEY: 腾讯云SecretKey\n- COS_BUCKET: 存储桶名称\n- COS_REGION: 地域（如：ap-beijing）\n- COS_DOMAIN: 自定义域名（可选）\n\n**适用场景：**\n- 生产环境图片存储\n- 需要CDN加速的场景\n- 小程序图片上传\n\n需要 JWT 认证。"
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
  @ApiResponse({
    status: 500,
    description: "COS配置错误或上传失败",
  })
  @UseInterceptors(
    FileInterceptor("file", {
      storage: memoryStorage(), // 使用内存存储，以便获取文件流上传到COS
      limits: {
        fileSize: 20 * 1024 * 1024, // 20MB
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
  async uploadImageToCos(@UploadedFile() file: any, @Req() req: any) {
    if (!file) {
      throw new BadRequestException("请选择要上传的文件");
    }

    return this.uploadService.uploadImageToCos(file, req);
  }
}
