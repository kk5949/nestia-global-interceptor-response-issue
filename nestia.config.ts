import { INestiaConfig } from "@nestia/sdk";

const config: INestiaConfig = {
    // auth controller만 포함
    input: "src/**/*.controller.ts",
    output: "src/api",
    swagger: {
        output: "swagger.json",
        security: {
            // Basic 인증 설정
            basic: {
                type: "http",
                scheme: "basic"
            },
            // Bearer JWT 토큰 인증 설정
            bearer: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT"
            }
        },
        servers: [
            {
                url: "http://localhost:3000/api",
                description: "개발 환경"
            }
        ],
        info: {
            title: "Nestia response example",
            description: "",
            version: "1.0.0"
        }
    }
};

export default config;