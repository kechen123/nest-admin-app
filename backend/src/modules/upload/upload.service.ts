import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UploadService {
  constructor(private readonly configService: ConfigService) {}

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
   * 上传图片
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
      const origin = req.get('origin') || req.get('referer');
      if (origin) {
        try {
          const originUrl = new URL(origin);
          fullUrl = `${originUrl.origin}${filePath}`;
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
}

