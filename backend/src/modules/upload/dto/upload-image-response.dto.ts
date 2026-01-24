import { ApiProperty } from '@nestjs/swagger';

/**
 * 上传图片响应 DTO
 * 
 * 适用于：
 * - 本地存储接口：/api/upload/image
 * - COS上传接口：/api/upload/image/cos
 */
export class UploadImageResponseDto {
  @ApiProperty({
    description: '图片完整URL（本地存储返回服务器URL，COS上传返回COS URL）',
    example: 'https://examplebucket-1250000000.cos.ap-beijing.myqcloud.com/images/abc123.jpg',
  })
  url: string;

  @ApiProperty({
    description: '图片路径（本地存储返回相对路径，COS上传返回COS对象键）',
    example: 'images/abc123.jpg',
  })
  path: string;

  @ApiProperty({
    description: '文件名',
    example: 'abc123.jpg',
  })
  filename: string;

  @ApiProperty({
    description: '原始文件名',
    example: 'photo.jpg',
  })
  originalname: string;

  @ApiProperty({
    description: '文件MIME类型',
    example: 'image/jpeg',
  })
  mimetype: string;

  @ApiProperty({
    description: '文件大小（字节）',
    example: 102400,
  })
  size: number;
}
