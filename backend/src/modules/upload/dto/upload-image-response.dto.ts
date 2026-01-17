import { ApiProperty } from '@nestjs/swagger';

/**
 * 上传图片响应 DTO
 */
export class UploadImageResponseDto {
  @ApiProperty({
    description: '图片完整URL',
    example: 'http://localhost:3000/uploads/images/abc123.jpg',
  })
  url: string;

  @ApiProperty({
    description: '图片相对路径',
    example: '/uploads/images/abc123.jpg',
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
