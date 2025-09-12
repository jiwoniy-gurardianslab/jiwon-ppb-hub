
// ====================================
// 2. 공통 배치 로직 서비스
// ====================================
// batch-core.service.ts
import { Injectable, Logger } from '@nestjs/common';

export interface BatchOptions {
  type: 'daily' | 'weekly' | 'monthly';
  date?: string;
  dryRun?: boolean;
}

export interface BatchResult {
  success: boolean;
  processedCount: number;
  errorCount: number;
  duration: number;
  errors?: any[];
}

@Injectable()
export class BatchCoreService {
  private readonly logger = new Logger(BatchCoreService.name);

  async executeBatch(options: BatchOptions): Promise<BatchResult> {
    const startTime = Date.now();
    let processedCount = 0;
    let errorCount = 0;
    const errors: any[] = [];

    this.logger.log(
      `배치 작업 시작: ${options.type}, 날짜: ${options.date || 'today'}, DryRun: ${options.dryRun || false}`
    );

    try {
      switch (options.type) {
        case 'daily':
          ({ processedCount, errorCount } = await this.runDailyBatch(options));
          break;
        case 'weekly':
          ({ processedCount, errorCount } = await this.runWeeklyBatch(options));
          break;
        case 'monthly':
          ({ processedCount, errorCount } = await this.runMonthlyBatch(options));
          break;
        default:
          throw new Error(`지원하지 않는 배치 타입: ${options.type}`);
      }

      const duration = Date.now() - startTime;
      const result: BatchResult = {
        success: errorCount === 0,
        processedCount,
        errorCount,
        duration,
        errors: errors.length > 0 ? errors : undefined
      };

      this.logger.log(`배치 작업 완료: 처리 ${processedCount}건, 오류 ${errorCount}건, 소요시간 ${duration}ms`);
      return result;

    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`배치 작업 실패: ${error.message}`, error.stack);
      
      return {
        success: false,
        processedCount,
        errorCount: errorCount + 1,
        duration,
        errors: [...errors, error],
      };
    }
  }

  private async runDailyBatch(
    options: BatchOptions,
  ): Promise<{ processedCount: number; errorCount: number }> {
    this.logger.log('일일 배치 로직 실행 중...');
    // 실제 배치 로직 구현
    let processedCount = 0;
    let errorCount = 0;

    try {
      // 1. 데이터 조회
      const data = await this.fetchDailyData(options.date);
      // 2. 청크 단위로 처리
      const batchSize = 1000;
      for (let i = 0; i < data.length; i += batchSize) {
        const chunk = data.slice(i, i + batchSize);
        try {
          if (!options.dryRun) {
            await this.processDailyChunk(chunk);
          }
          processedCount += chunk.length;
          this.logger.log(
            `일일 배치 진행률: ${Math.min(i + batchSize, data.length)}/${data.length}`
          );
        } catch (error) {
          this.logger.error(`청크 처리 오류: ${error.message}`);
          errorCount += chunk.length;
        }
      }
    } catch (error) {
      this.logger.error(`일일 배치 데이터 조회 오류: ${error.message}`);
      throw error;
    }

    return { processedCount, errorCount };
  }

  private async runWeeklyBatch(
    options: BatchOptions,
  ): Promise<{ processedCount: number; errorCount: number }> {
    this.logger.log('주간 배치 로직 실행 중...');
    // 주간 배치 로직 구현
    let processedCount = 0;
    let errorCount = 0;

    try {
      const data = await this.fetchWeeklyData(options.date);
      for (const item of data) {
        try {
          if (!options.dryRun) {
            await this.processWeeklyItem(item);
          }
          processedCount++;
        } catch (error) {
          this.logger.error(`주간 배치 아이템 처리 오류: ${error.message}`);
          errorCount++;
        }
      }
    } catch (error) {
      this.logger.error(`주간 배치 오류: ${error.message}`);
      throw error;
    }

    return { processedCount, errorCount };
  }

  private async runMonthlyBatch(
    options: BatchOptions,
  ): Promise<{ processedCount: number; errorCount: number }> {
    this.logger.log('월간 배치 로직 실행 중...');
    // 월간 배치 로직 구현
    let processedCount = 0;
    let errorCount = 0;

    try {
      const data = await this.fetchMonthlyData(options.date);
      
      // 병렬 처리 (최대 5개 동시 처리)
      const concurrency = 5;
      for (let i = 0; i < data.length; i += concurrency) {
        const chunk = data.slice(i, i + concurrency);
        const promises = chunk.map(async (item) => {
          try {
            if (!options.dryRun) {
              await this.processMonthlyItem(item);
            }
            return { success: true };
          } catch (error) {
            this.logger.error(`월간 배치 아이템 처리 오류: ${error.message}`);
            return { success: false, error };
          }
        });

        const results = await Promise.all(promises);
        processedCount += results.filter(r => r.success).length;
        errorCount += results.filter(r => !r.success).length;

        this.logger.log(`월간 배치 진행률: ${Math.min(i + concurrency, data.length)}/${data.length}`);
      }

    } catch (error) {
      this.logger.error(`월간 배치 오류: ${error.message}`);
      throw error;
    }

    return { processedCount, errorCount };
  }

  // 데이터 조회 메서드들
  private async fetchDailyData(date?: string): Promise<any[]> {
    // DB에서 일일 데이터 조회
    this.logger.log(`일일 데이터 조회: ${date || 'today'}`);
    return Array.from({ length: 5000 }, (_, i) => ({ id: i, type: 'daily' }));
  }

  private async fetchWeeklyData(date?: string): Promise<any[]> {
    // DB에서 주간 데이터 조회
    this.logger.log(`주간 데이터 조회: ${date || 'this week'}`);
    return Array.from({ length: 1000 }, (_, i) => ({ id: i, type: 'weekly' }));
  }

  private async fetchMonthlyData(date?: string): Promise<any[]> {
    // DB에서 월간 데이터 조회
    this.logger.log(`월간 데이터 조회: ${date || 'this month'}`);
    return Array.from({ length: 500 }, (_, i) => ({ id: i, type: 'monthly' }));
  }

  // 데이터 처리 메서드들
  private async processDailyChunk(chunk: any[]): Promise<void> {
    // 일일 배치 청크 처리
    await new Promise(resolve => setTimeout(resolve, 100)); // 실제 처리 시뮬레이션
  }

  private async processWeeklyItem(item: any): Promise<void> {
    // 주간 배치 아이템 처리
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  private async processMonthlyItem(item: any): Promise<void> {
    // 월간 배치 아이템 처리
    await new Promise(resolve => setTimeout(resolve, 200));
  }
}