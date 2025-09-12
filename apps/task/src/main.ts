import { NestFactory } from '@nestjs/core';

import { BatchModule } from './batch.module';

async function bootstrap() {
  const app = await NestFactory.create(BatchModule);

  // CORS 설정 (필요한 경우)
  app.enableCors();

  // Global prefix 설정
  app.setGlobalPrefix('api/v1');

  // HTTP API로 배치 작업을 수동 실행할 수 있는 컨트롤러 추가 가능
  await app.listen(3000);

  console.log('🚀 배치 서비스가 http://localhost:3000에서 실행 중입니다');
  console.log('📅 스케줄러도 함께 실행됩니다');
}
bootstrap();
