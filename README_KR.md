Nestia Global Response Wrapper 타입 안전성 개선 제안
NestJS 글로벌 인터셉터와 Nestia의 타입 안전성을 동시에 확보하기 위한 기능 요청

📋 문제 요약
현재 상황: Nestia 사용 시 글로벌 응답 래퍼 인터셉터 적용 시 타입 불일치 발생
영향: 타입 안전성 포기(as any 사용) 또는 코드 중복 발생
제안: Nestia 설정에서 글로벌 응답 래퍼 타입 지정 기능 추가

🚨 문제 상황
현재 Nestia를 사용하면서 글로벌 인터셉터를 통한 응답 래핑 시 타입 안전성 문제가 발생하고 있습니다. 이는 매우 일반적인 패턴임에도 불구하고 Nestia에서 깔끔하게 지원되지 않아 개발자 경험을 저해하고 있습니다.

핵심 문제점
컨트롤러 반환 타입: ResponseSampleDto

실제 응답 타입: SampleResponseInterface<ResponseSampleDto> (인터셉터 적용 후)

타입 불일치로 인한 as any 사용 필요

📁 프로젝트 구조
text
src/
├── samples/
│   ├── samples.controller.ts    # 문제가 발생하는 컨트롤러
│   ├── samples.service.ts       # 서비스 로직
│   └── dto/
│       └── create-sample.dto.ts
├── interceptors/
│   ├── sample-response.interface.ts    # 표준 응답 타입 정의
│   └── sample-response.interceptor.ts  # 글로벌 인터셉터
├── main.ts                      # 글로벌 인터셉터 등록
└── app.module.ts
🔧 설치 및 실행
bash
# 의존성 설치
npm install

# TypeScript 패치 설치 (Nestia 필수)
npm run prepare

# 프로젝트 빌드
npm run build

# 개발 서버 실행
npm run start:dev

# Swagger 문서 생성
npm run nestia
📋 현재 구현된 해결 방법들과 문제점
1. as any 타입 캐스팅 사용
   typescript
   @TypedRoute.Get('with-return-any')
   sampleWithReturnAny(
   @TypedBody() createSampleDto: CreateSampleDto
   ): SampleResponseInterface<ResponseSampleDto> {
   return this.samplesService.sample(createSampleDto) as any;
   }
   ❌ 문제점:

타입 안전성 완전 포기: 컴파일 타임 타입 체크 우회

런타임 오류 위험: 실제 타입과 선언된 타입의 불일치

코드 가독성 저하: 개발 의도가 명확하지 않음

유지보수성 악화: 타입 변경 시 문제 발견 어려움

2. 서비스 레이어에서 직접 래핑
   typescript
   sampleWrapped(createSampleDto: CreateSampleDto): SampleResponseInterface<ResponseSampleDto> {
   const result = {
   name: createSampleDto.name,
   title: createSampleDto.title,
   description: createSampleDto.description,
   age: createSampleDto.age
   };
   return createSampleResponse(result, '', 200);
   }
   ❌ 문제점:

코드 중복: 모든 서비스 메서드에서 반복적인 래핑 작업

일관성 문제: 개발자가 실수로 래핑을 빼먹을 가능성

비즈니스 로직 오염: 순수한 비즈니스 로직과 응답 형식이 혼재

유지보수 부담: 응답 형식 변경 시 모든 서비스 수정 필요

3. 글로벌 인터셉터 + 타입 불일치
   typescript
   @Injectable()
   export class GlobalResponseInterceptor<T> implements NestInterceptor<T, SampleResponseInterface<T>> {
   intercept(context: ExecutionContext, next: CallHandler): Observable<SampleResponseInterface<T>> {
   return next.handle().pipe(
   map((data) => ({
   data: data,
   message: this.getDefaultMessage(statusCode),
   statusCode: statusCode,
   })),
   );
   }
   }
   ❌ 문제점:

타입 시스템과 실제 동작 불일치: 컨트롤러 반환 타입과 실제 응답 타입이 다름

Swagger 문서 부정확성: Nestia가 생성하는 문서와 실제 응답 구조 불일치

개발자 혼란: 예상 타입과 실제 타입의 차이로 인한 디버깅 어려움

🎯 기대하는 해결책
Nestia 설정에서 글로벌 응답 래퍼 타입을 지정할 수 있는 기능을 제안합니다:

typescript
// nestia.config.ts
const config: INestiaConfig = {
input: "src/**/*.controller.ts",
output: "src/api",
swagger: {
// ...
},
// 🆕 제안하는 새로운 설정
globalResponseWrapper: {
type: "SampleResponseInterface<T>",
path: "./interceptors/sample-response.interface.ts"
}
};
✅ 이렇게 설정하면:
컨트롤러에서는 원본 타입 반환: ResponseSampleDto

Nestia가 자동으로 래퍼 타입 적용: SampleResponseInterface<ResponseSampleDto>

Swagger 문서 정확성 보장: 실제 응답 구조와 문서 일치

타입 안전성 유지: as any 사용 불필요

🧪 테스트 방법
API 엔드포인트 테스트
bash
# 기본 샘플 생성 (타입 불일치 문제 발생)
curl -X 'POST' \
'http://localhost:3000/api/samples' \
-H 'accept: application/json' \
-H 'Content-Type: application/json' \
-d '{
"name": "test",
"title": "test",
"description": "test",
"age": 10
}'

# as any 사용 예제
curl -X 'GET' \
'http://localhost:3000/api/samples/with-return-any?name=kim&title=title&description=desc&age=10' \
-H 'accept: application/json'

# 서비스에서 래핑한 예제
curl -X 'GET' \
'http://localhost:3000/api/samples/wrapped?name=test&title=test&description=test&age=111' \
-H 'accept: application/json'

🔍 환경 정보
Node.js: 24.x

NestJS: 11.x

Nestia: 7.x

TypeScript: 5.x

🤝 Nestia 커뮤니티에 드리는 제안
안녕하세요, Nestia 개발팀 및 커뮤니티 여러분.

먼저 훌륭한 라이브러리를 개발해 주셔서 감사합니다. Nestia의 타입 안전성과 성능 향상은 정말 인상적입니다.

현재 상황 문의
글로벌 응답 래퍼 패턴 사용 시 타입 안전성 문제에 대해 다음과 같이 문의드립니다:

기존 해결책 확인: 혹시 현재 이런 문제를 해결할 수 있는 방법이 이미 존재한다면 안내 부탁드립니다.

향후 지원 계획: 만약 아직 지원되지 않는다면, 향후 이런 기능을 제공할 계획이 있으신지 궁금합니다.

설계 방향 논의: 제안한 방식 외에 더 나은 접근 방법이 있다면 함께 논의하고 싶습니다.

제안하는 해결책
다음과 같은 설정 옵션 추가를 제안드립니다:

typescript
// nestia.config.ts
const config: INestiaConfig = {
// ... 기존 설정
globalResponseWrapper: {
type: "SampleResponseInterface<T>",
path: "./interceptors/sample-response.interface.ts"
}
};
이 기능이 구현된다면:

컨트롤러에서는 원본 타입 반환 가능

Nestia가 자동으로 래퍼 타입 적용

Swagger 문서 정확성 보장

as any 사용 불필요

🎯 왜 이 기능이 중요한가?
일반적인 패턴: 대부분의 REST API에서 표준 응답 형식 사용

타입 안전성: Nestia의 핵심 가치인 타입 안전성과 부합

개발자 경험: 번거로운 우회 방법 없이 직관적인 개발 가능

유지보수성: 일관된 응답 형식과 깔끔한 코드 구조

🎯 마무리
이 제안이 Nestia 커뮤니티와 생태계 발전에 도움이 되기를 바랍니다.

글로벌 응답 래퍼 패턴은 실제 프로덕션 환경에서 매우 일반적으로 사용되는 패턴이며, 이를 타입 안전하게 지원한다면 많은 개발자들이 혜택을 받을 것으로 생각합니다.

현재 상황에서는 타입 안전성을 포기하거나 코드 중복을 감수해야 하는 상황입니다. Nestia의 철학에 맞는 깔끔한 해결책이 제공된다면 많은 개발자들이 혜택을 받을 것으로 생각합니다.

피드백이나 추가 논의가 필요하시면 언제든 연락 주시기 바랍니다.

감사합니다.