/**
 * @file: response.interceptor.ts
 * @description: Глобальный интерцептор для обёртки всех успешных API-ответов в единый формат
 * @dependencies: NestJS
 * @created: 2024-07-05
 */

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        const ctx = context.switchToHttp();
        const res = ctx.getResponse();
        // Если контроллер сам вернул success: false, не оборачиваем
        if (data && typeof data === 'object' && data.success === false) {
          return data
        }
        return {
          statusCode: res.statusCode,
          data,
        }
      })
    )
  }
} 