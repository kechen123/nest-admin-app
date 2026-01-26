import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { IResponse } from '../interfaces/response.interface';
import { Response } from 'express';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, IResponse<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<IResponse<T>> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse<Response>();
    const url = request.url;

    // 跳过静态文件请求（uploads 目录下的文件）
    // 静态文件应该直接返回原始内容，不应该被包装成 JSON 格式
    if (url && url.startsWith('/uploads')) {
      return next.handle();
    }

    // 设置响应头，确保中文字符正确编码
    response.setHeader('Content-Type', 'application/json; charset=utf-8');

    return next.handle().pipe(
      map((data) => ({
        code: 200,
        message: 'success',
        data,
        timestamp: Date.now(),
      })),
    );
  }
}
