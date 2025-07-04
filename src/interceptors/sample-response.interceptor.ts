// src/interceptors/global-response.interceptor.ts
import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {SampleResponseInterface} from "./sample-response.interface";

@Injectable()
export class GlobalResponseInterceptor<T> implements NestInterceptor<T, SampleResponseInterface<T>> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<SampleResponseInterface<T>> {
        return next.handle().pipe(
            map((data) => {
                const response = context.switchToHttp().getResponse();
                const statusCode = response.statusCode || 200;

                return {
                    data: data,
                    message: this.getDefaultMessage(statusCode),
                    statusCode: statusCode,
                };
            }),
        );
    }

    private getDefaultMessage(statusCode: number): string {
        switch (statusCode) {
            case 200:
            case 201:
                return '요청이 성공적으로 처리되었습니다.';
            default:
                return '요청이 처리되었습니다.';
        }
    }
}
