import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { extname } from 'path';
import * as crypto from 'crypto';

// 使用 require 导入 COS SDK（避免类型错误）
const COS = require('cos-nodejs-sdk-v5');

@Injectable()
export class UploadService {
  private cosClient: any;

  constructor(private readonly configService: ConfigService) {
    // 初始化COS客户端
    const secretId = this.configService.get<string>('COS_SECRET_ID');
    const secretKey = this.configService.get<string>('COS_SECRET_KEY');
    
    if (secretId && secretKey) {
      this.cosClient = new COS({
        SecretId: secretId,
        SecretKey: secretKey,
      });
    }
  }

  /**
   * 修复文件名编码问题
   * multer 在处理 multipart/form-data 时，如果文件名包含中文等非 ASCII 字符，
   * 可能会因为编码问题导致乱码。此函数尝试修复编码问题。
   * 
   * 常见的乱码原因：
   * 1. 文件名被错误地以 latin1 编码解释，实际应该是 UTF-8
   * 2. 文件名使用了 RFC 5987 编码（filename*=UTF-8''...）
   */
  private fixFilenameEncoding(filename: string): string {
    if (!filename) return filename;
    
    try {
      // 方法1: 尝试将 latin1 编码的字符串转换为正确的 UTF-8
      // 如果文件名被错误地以 latin1 编码解释，我们需要将其转换回 UTF-8
      const buffer = Buffer.from(filename, 'latin1');
      const utf8Filename = buffer.toString('utf8');
      
      // 检查转换后的文件名是否包含有效的中文字符或常见的中文乱码模式
      // 如果包含中文字符，说明转换成功
      if (/[\u4e00-\u9fa5]/.test(utf8Filename)) {
        return utf8Filename;
      }
      
      // 方法2: 检查是否是 RFC 5987 编码格式 (filename*=UTF-8''...)
      // 虽然 multer 应该已经处理了，但为了保险起见也检查一下
      const rfc5987Match = filename.match(/^UTF-8''(.+)$/);
      if (rfc5987Match) {
        try {
          return decodeURIComponent(rfc5987Match[1]);
        } catch (e) {
          // 解码失败，继续使用其他方法
        }
      }
      
      // 方法3: 如果原始文件名看起来像乱码，尝试直接转换
      // 检查是否包含常见的乱码字符（latin1 编码的中文字符）
      if (/[åäöüÅÄÖÜ]/.test(filename) && !/[\u4e00-\u9fa5]/.test(filename)) {
        // 可能是 latin1 编码的中文，尝试转换
        return utf8Filename;
      }
    } catch (e) {
      // 如果转换失败，返回原始文件名
    }
    
    return filename;
  }

  /**
   * 上传图片（本地存储）
   */
  uploadImage(file: any, req?: any) {
    const filePath = `/uploads/images/${file.filename}`;
    
    // 修复文件名编码
    const originalname = this.fixFilenameEncoding(file.originalname);
    
    // 获取正确的域名
    // 优先级：环境变量 > Origin/Referer > X-Forwarded-Host > Host（过滤容器内部地址）> 相对路径
    let fullUrl = filePath;
    
    // 1. 优先使用环境变量配置的域名
    const appUrl = this.configService.get<string>('APP_URL');
    if (appUrl) {
      fullUrl = `${appUrl.replace(/\/$/, '')}${filePath}`;
    } else if (req) {
      // 2. 从 Origin 或 Referer 头获取域名（最准确，因为这是客户端实际访问的地址）
      // 但需要过滤掉微信小程序等特殊域名
      const origin = req.get('origin') || req.get('referer');
      if (origin) {
        try {
          const originUrl = new URL(origin);
          // 过滤掉微信小程序域名（servicewechat.com）和其他特殊域名
          const hostname = originUrl.hostname;
          const isSpecialDomain = hostname.includes('servicewechat.com') || 
                                 hostname.includes('weixin.qq.com') ||
                                 hostname.includes('localhost') ||
                                 hostname.includes('127.0.0.1');
          
          if (!isSpecialDomain) {
            fullUrl = `${originUrl.origin}${filePath}`;
          }
        } catch (e) {
          // URL 解析失败，继续使用其他方法
        }
      }
      
      // 如果还没有获取到有效域名，继续尝试其他方法
      if (fullUrl === filePath) {
        // 3. 从请求头获取 X-Forwarded-Host（适用于反向代理场景）
        const forwardedHost = req.get('x-forwarded-host');
        const forwardedProto = req.get('x-forwarded-proto') || req.protocol || 'http';
        
        if (forwardedHost) {
          fullUrl = `${forwardedProto}://${forwardedHost}${filePath}`;
        } else if (req.get('host')) {
          // 4. 使用 Host 头（需要检查是否是容器内部地址）
          const host = req.get('host');
          const protocol = req.protocol || 'http';
          
          // 如果 host 包含容器内部地址（如 backend:3000），则返回相对路径
          // 让前端自己拼接正确的域名
          if (host && !host.includes('backend:')) {
            fullUrl = `${protocol}://${host}${filePath}`;
          }
        }
      }
    }

    return {
      url: fullUrl,
      path: filePath,
      filename: file.filename,
      originalname: originalname,
      mimetype: file.mimetype,
      size: file.size,
    };
  }

  /**
   * 上传图片到腾讯云COS
   */
  async uploadImageToCos(file: any, req?: any): Promise<any> {
    // 修复文件名编码
    const originalname = this.fixFilenameEncoding(file.originalname);
    
    // 检查是否配置了COS
    const bucket = this.configService.get<string>('COS_BUCKET');
    const region = this.configService.get<string>('COS_REGION');
    const cosDomain = this.configService.get<string>('COS_DOMAIN'); // 可选：自定义域名
    
    if (!this.cosClient || !bucket || !region) {
      throw new InternalServerErrorException('COS配置未完成，请检查环境变量配置（COS_SECRET_ID、COS_SECRET_KEY、COS_BUCKET、COS_REGION）');
    }

    // 生成唯一文件名
    const fileExt = extname(originalname);
    const uniqueName = `${crypto.randomUUID()}${fileExt}`;
    
    // COS对象键（文件路径）
    const key = `images/${uniqueName}`;

    try {
      // 上传到COS
      const result = await new Promise<any>((resolve, reject) => {
        this.cosClient.putObject(
          {
            Bucket: bucket,
            Region: region,
            Key: key,
            Body: file.buffer, // 使用内存中的文件buffer
            onProgress: function(progressData) {
              // 可以在这里处理上传进度
              console.log('上传进度:', JSON.stringify(progressData));
            },
          },
          function(err, data) {
            if (err) {
              reject(err);
            } else {
              resolve(data);
            }
          }
        );
      });

      // 构建文件URL
      let fileUrl: string;
      if (cosDomain) {
        // 使用自定义域名
        fileUrl = `${cosDomain.replace(/\/$/, '')}/${key}`;
      } else {
        // 使用COS默认域名
        fileUrl = `https://${result.Location}`;
      }

      return {
        url: fileUrl,
        path: key,
        filename: uniqueName,
        originalname: originalname,
        mimetype: file.mimetype,
        size: file.size,
      };
    } catch (error) {
      console.error('COS上传失败:', error);
      throw new InternalServerErrorException(`图片上传失败: ${error.message || '未知错误'}`);
    }
  }
}

