// ====================================
// 5. 공통 모듈
// ====================================
// batch.module.ts
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { HealthController } from './health.controller';
import { BatchCoreService } from './batch-core.service';
import { BatchCommand } from './batch.command';
import { ScheduledBatchService } from './scheduled-batch.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [HealthController],
  providers: [BatchCoreService, BatchCommand, ScheduledBatchService],
  exports: [BatchCoreService],
})
export class BatchModule {}
