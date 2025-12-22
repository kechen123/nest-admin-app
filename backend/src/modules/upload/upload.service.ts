import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UploadService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * 上传图片
   */
  uploadImage(file: any, req?: any) {
    const filePath = `/uploads/images/${file.filename}`;
    
    // 优先使用请求的 origin，如果没有则返回相对路径（前端会自动处理）
    let fullUrl = filePath;
    if (req?.protocol && req?.get('host')) {
      const protocol = req.protocol || 'http';
      const host = req.get('host');
      fullUrl = `${protocol}://${host}${filePath}`;
    }

    return {
      url: fullUrl,
      path: filePath,
      filename: file.filename,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    };
  }
}

