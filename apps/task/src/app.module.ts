import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { ScheduledBatchService } from './scheduled.service';
import { BatchService } from './task.service';
import { BatchCommand } from './batch.command';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [BatchService, ScheduledBatchService, BatchCommand],
})
export class AppModule {}
