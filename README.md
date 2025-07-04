Nestia Global Response Wrapper Type Safety Enhancement Proposal
Feature Request for Ensuring Type Safety with NestJS Global Interceptors and Nestia

📋 Problem Summary
Current Situation: Type mismatch occurs when applying global response wrapper interceptors with Nestia
Impact: Forced to abandon type safety (as any usage) or introduce code duplication
Proposal: Add global response wrapper type specification feature in Nestia configuration

🚨 Problem Description
Currently, when using Nestia with global interceptors for response wrapping, type safety issues arise. Despite this being a very common pattern, Nestia doesn't provide clean support for it, which degrades the developer experience.

Core Issues
Controller Return Type: ResponseSampleDto

Actual Response Type: SampleResponseInterface<ResponseSampleDto> (after interceptor application)

Type mismatch requiring as any usage

📁 Project Structure
text
src/
├── samples/
│   ├── samples.controller.ts    # Controller where the issue occurs
│   ├── samples.service.ts       # Service logic
│   └── dto/
│       └── create-sample.dto.ts
├── interceptors/
│   ├── sample-response.interface.ts    # Standard response type definition
│   └── sample-response.interceptor.ts  # Global interceptor
├── main.ts                      # Global interceptor registration
└── app.module.ts
🔧 Installation and Setup
bash
# Install dependencies
npm install

# Install TypeScript patches (Required for Nestia)
npm run prepare

# Build project
npm run build

# Start development server
npm run start:dev

# Generate Swagger documentation
npm run nestia
📋 Current Implementation Methods and Their Issues
1. Using as any Type Casting
   typescript
   @TypedRoute.Get('with-return-any')
   sampleWithReturnAny(
   @TypedBody() createSampleDto: CreateSampleDto
   ): SampleResponseInterface<ResponseSampleDto> {
   return this.samplesService.sample(createSampleDto) as any;
   }
   ❌ Issues:

Complete abandonment of type safety: Bypasses compile-time type checking

Runtime error risk: Mismatch between actual and declared types

Reduced code readability: Development intent is unclear

Poor maintainability: Difficult to detect issues when types change

2. Direct Wrapping in Service Layer
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
   ❌ Issues:

Code duplication: Repetitive wrapping work in all service methods

Consistency problems: Developers might forget to wrap responses

Business logic pollution: Pure business logic mixed with response formatting

Maintenance burden: All services need modification when response format changes

3. Global Interceptor + Type Mismatch
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
   ❌ Issues:

Type system and actual behavior mismatch: Controller return type differs from actual response type

Inaccurate Swagger documentation: Mismatch between Nestia-generated docs and actual response structure

Developer confusion: Debugging difficulties due to differences between expected and actual types

🎯 Expected Solution
We propose a feature to specify global response wrapper types in Nestia configuration:

typescript
// nestia.config.ts
const config: INestiaConfig = {
input: "src/**/*.controller.ts",
output: "src/api",
swagger: {
// ...
},
// 🆕 Proposed new configuration
globalResponseWrapper: {
type: "SampleResponseInterface<T>",
path: "./interceptors/sample-response.interface.ts"
}
};
✅ With this configuration:
Controllers return original types: ResponseSampleDto

Nestia automatically applies wrapper type: SampleResponseInterface<ResponseSampleDto>

Swagger documentation accuracy guaranteed: Actual response structure matches documentation

Type safety maintained: No need for as any usage

🧪 Testing Methods
API Endpoint Testing
bash
# Basic sample creation (type mismatch issue occurs)
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

# Example using as any
curl -X 'GET' \
'http://localhost:3000/api/samples/with-return-any?name=kim&title=title&description=desc&age=10' \
-H 'accept: application/json'

# Example wrapped in service
curl -X 'GET' \
'http://localhost:3000/api/samples/wrapped?name=test&title=test&description=test&age=111' \
-H 'accept: application/json'
🔍 Environment Information
Node.js: 24.x

NestJS: 11.x

Nestia: 7.x

TypeScript: 5.x

🤝 Proposal to Nestia Community
Hello Nestia development team and community members,

First, thank you for developing such an excellent library. Nestia's type safety and performance improvements are truly impressive.

Current Situation Inquiry
Regarding type safety issues when using global response wrapper patterns, we would like to inquire about the following:

Existing Solution Check: If there's already a way to solve this problem, please guide us.

Future Support Plans: If not currently supported, are there plans to provide this feature in the future?

Design Direction Discussion: If there are better approaches than our proposed method, we'd like to discuss them together.

Proposed Solution
We propose adding the following configuration option:

typescript
// nestia.config.ts
const config: INestiaConfig = {
// ... existing configuration
globalResponseWrapper: {
type: "SampleResponseInterface<T>",
path: "./interceptors/sample-response.interface.ts"
}
};
If this feature is implemented:

Controllers can return original types

Nestia automatically applies wrapper types

Swagger documentation accuracy is guaranteed

No need to use as any

🎯 Why This Feature Is Important
Common Pattern: Most REST APIs use standard response formats

Type Safety: Aligns with Nestia's core value of type safety

Developer Experience: Enables intuitive development without cumbersome workarounds

Maintainability: Consistent response format and clean code structure

🎯 Conclusion
We hope this proposal helps the development of the Nestia community and ecosystem.

Global response wrapper patterns are very commonly used in actual production environments, and providing type-safe support for this would benefit many developers.

In the current situation, we must either abandon type safety or accept code duplication. If a clean solution that aligns with Nestia's philosophy is provided, many developers would benefit from it.

Please feel free to contact us if you need feedback or additional discussion.

Thank you.

Translated by AI