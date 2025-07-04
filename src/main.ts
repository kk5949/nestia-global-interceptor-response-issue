import {NestFactory, Reflector} from '@nestjs/core';
import {AppModule} from './app.module';
import {SwaggerModule} from "@nestjs/swagger";
import {ClassSerializerInterceptor} from "@nestjs/common";
import {NestExpressApplication} from "@nestjs/platform-express";
import * as fs from "node:fs";
import {GlobalResponseInterceptor} from "./interceptors/sample-response.interceptor";
import * as path from "node:path";

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    const environment = 'development';

    const swaggerPath = path.join(process.cwd(), 'swagger.json');

    if (fs.existsSync(swaggerPath)) {
        try {
            const document = JSON.parse(fs.readFileSync(swaggerPath, 'utf8'));
            SwaggerModule.setup('api/docs', app, document);
            console.log('📚 Nestia Swagger 문서가 활성화되었습니다: /api/docs');
        } catch (error) {
            console.error('Swagger 설정 중 오류 발생:', error);
        }
    } else {
        console.warn('swagger.json 파일을 찾을 수 없습니다:', swaggerPath);
    }

    // 전역 인터셉터 등록
    app.useGlobalInterceptors(
        new GlobalResponseInterceptor(),
        new ClassSerializerInterceptor(app.get(Reflector))
    );

    app.setGlobalPrefix('api', {});

    await app.listen(process.env.PORT ?? 3000);
}

bootstrap().catch((error) => {
    console.error('애플리케이션 시작 실패:', error);
    process.exit(1);
});
