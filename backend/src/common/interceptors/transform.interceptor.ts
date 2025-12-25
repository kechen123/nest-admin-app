import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IResponse } from '../interfaces/response.interface';

/**
 * 格式化日期时间
 * @param date Date 对象
 * @returns 格式化后的字符串 YYYY-MM-DD HH:mm:ss
 */
function formatDateTime(date: Date | null | undefined): string | null {
  if (!date) return null;
  if (!(date instanceof Date)) return null;
  if (isNaN(date.getTime())) return null;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * 递归处理对象中的 Date 字段
 * @param obj 要处理的对象
 * @returns 处理后的对象
 */
function transformDates(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  // 如果是 Date 对象，直接格式化
  if (obj instanceof Date) {
    return formatDateTime(obj);
  }

  // 如果是数组，递归处理每个元素
  if (Array.isArray(obj)) {
    return obj.map(item => transformDates(item));
  }

  // 如果是对象，递归处理每个属性
  if (typeof obj === 'object') {
    const result: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key];
        // 检查是否是 Date 对象
        if (value instanceof Date) {
          result[key] = formatDateTime(value);
        } else if (Array.isArray(value)) {
          result[key] = transformDates(value);
        } else if (value !== null && typeof value === 'object') {
          result[key] = transformDates(value);
        } else {
          result[key] = value;
        }
      }
    }
    return result;
  }

  // 其他类型直接返回
  return obj;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, IResponse<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<IResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        // 格式化响应数据中的所有 Date 字段
        const transformedData = transformDates(data);
        
        return {
          code: 200,
          message: 'success',
          data: transformedData,
          timestamp: Date.now(),
        };
      }),
    );
  }
}
