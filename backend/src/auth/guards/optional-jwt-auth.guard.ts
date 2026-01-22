import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  // 重写 canActivate 方法，使其在 token 缺失时不会抛出错误
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    // 尝试激活，如果失败（没有 token 或 token 无效），返回 true 允许继续
    const result = super.canActivate(context);
    
    if (result instanceof Promise) {
      return result.catch(() => true);
    }
    
    if (result instanceof Observable) {
      return result.pipe(
        map(() => true),
        catchError(() => of(true))
      );
    }
    
    return result;
  }

  // 重写 handleRequest 方法，在验证失败时返回 null 而不是抛出错误
  handleRequest(err: any, user: any, info: any) {
    // 如果有错误或没有用户，返回 null（而不是抛出错误）
    if (err || !user) {
      return null;
    }
    return user;
  }
}
