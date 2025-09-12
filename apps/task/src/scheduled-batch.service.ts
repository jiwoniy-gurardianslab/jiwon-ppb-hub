// ====================================
// 4. 스케줄링 기반 배치 서비스
// ====================================
// scheduled-batch.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { BatchCoreService } from './batch-core.service';

@Injectable()
export class ScheduledBatchService {
  private readonly logger = new Logger(ScheduledBatchService.name);

  constructor(private readonly batchCoreService: BatchCoreService) {}

  // 매일 새벽 2시에 일일 배치 실행
  @Cron('0 2 * * *', {
    name: 'daily-batch',
    timeZone: 'Asia/Seoul'
  })
  async handleDailyBatch() {
    this.logger.log('📅 스케줄된 일일 배치 시작');

    try {
      const result = await this.batchCoreService.executeBatch({
        type: 'daily'
      });

      if (result.success) {
        this.logger.log('✅ 스케줄된 일일 배치 완료');
      } else {
        this.logger.error('❌ 스케줄된 일일 배치 실패');
        // 알림 서비스 호출 등
        await this.sendFailureNotification('daily', result);
      }
    } catch (error) {
      this.logger.error('스케줄된 일일 배치 오류:', error);
      await this.sendErrorNotification('daily', error);
    }
  }

  // 매주 월요일 새벽 3시에 주간 배치 실행
  @Cron('0 3 * * 1', {
    name: 'weekly-batch',
    timeZone: 'Asia/Seoul'
  })
  async handleWeeklyBatch() {
    this.logger.log('📅 스케줄된 주간 배치 시작');
    
    try {
      const result = await this.batchCoreService.executeBatch({
        type: 'weekly'
      });

      if (result.success) {
        this.logger.log('✅ 스케줄된 주간 배치 완료');
      } else {
        this.logger.error('❌ 스케줄된 주간 배치 실패');
        await this.sendFailureNotification('weekly', result);
      }
    } catch (error) {
      this.logger.error('스케줄된 주간 배치 오류:', error);
      await this.sendErrorNotification('weekly', error);
    }
  }

  // 매월 1일 새벽 4시에 월간 배치 실행
  @Cron('0 4 1 * *', {
    name: 'monthly-batch',
    timeZone: 'Asia/Seoul'
  })
  async handleMonthlyBatch() {
    this.logger.log('📅 스케줄된 월간 배치 시작');
    
    try {
      const result = await this.batchCoreService.executeBatch({
        type: 'monthly'
      });

      if (result.success) {
        this.logger.log('✅ 스케줄된 월간 배치 완료');
      } else {
        this.logger.error('❌ 스케줄된 월간 배치 실패');
        await this.sendFailureNotification('monthly', result);
      }
    } catch (error) {
      this.logger.error('스케줄된 월간 배치 오류:', error);
      await this.sendErrorNotification('monthly', error);
    }
  }

  // 수동으로 스케줄 실행 (개발/테스트용)
  async runScheduledBatch(type: 'daily' | 'weekly' | 'monthly'): Promise<BatchResult> {
    this.logger.log(`🔧 수동 스케줄 배치 실행: ${type}`);
    
    return await this.batchCoreService.executeBatch({
      type,
      dryRun: false
    });
  }

  private async sendFailureNotification(batchType: string, result: BatchResult): Promise<void> {
    // 실패 알림 발송 (이메일, 슬랙 등)
    this.logger.log(`📧 실패 알림 발송: ${batchType}, 오류 ${result.errorCount}건`);
  }

  private async sendErrorNotification(batchType: string, error: any): Promise<void> {
    // 에러 알림 발송
    this.logger.log(`🚨 에러 알림 발송: ${batchType}, ${error.message}`);
  }
}
