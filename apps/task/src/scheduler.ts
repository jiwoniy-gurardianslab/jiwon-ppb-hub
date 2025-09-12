// ====================================
// 7. 스케줄러 전용 메인 파일
// ====================================
// scheduler.ts
import { NestFactory } from '@nestjs/core';
import { BatchModule } from './batch.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Scheduler');

  try {
    const app = await NestFactory.create(BatchModule);

    logger.log('🚀 배치 스케줄러 시작');
    logger.log('📅 등록된 스케줄:');
    logger.log('  - 일일 배치: 매일 02:00 (Asia/Seoul)');
    logger.log('  - 주간 배치: 매주 월요일 03:00 (Asia/Seoul)');
    logger.log('  - 월간 배치: 매월 1일 04:00 (Asia/Seoul)');

    // 애플리케이션 종료 시그널 처리
    process.on('SIGTERM', async () => {
      logger.log('SIGTERM 수신, 애플리케이션 종료 중...');
      await app.close();
    });

    process.on('SIGINT', async () => {
      logger.log('SIGINT 수신, 애플리케이션 종료 중...');
      await app.close();
    });

    // 애플리케이션 실행 (종료되지 않도록)
    await app.init();
  } catch (error) {
    logger.error('스케줄러 시작 실패:', error);
    process.exit(1);
  }
}

bootstrap();
