import { Controller, Get, Post, Param, Query, Body } from '@nestjs/common';

@Controller('health')
export class HealthController {
  constructor(
    private readonly batchLogService: BatchLogService,
    private readonly scheduledBatchService: ScheduledBatchService,
    private readonly batchCoreService: BatchCoreService
  ) {}

  @Get()
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'batch-service',
      version: '1.0.0'
    };
  }

  @Get('batch/status')
  async getBatchStatus() {
    const runningBatches = await this.batchLogService.getRunningBatches();
    const recentHistory = await this.batchLogService.getBatchHistory(undefined, 10);

    return {
      runningBatches: runningBatches.length,
      recentExecutions: recentHistory,
      schedulerStatus: 'active' // 실제로는 스케줄러 상태 체크
    };
  }

  @Get('batch/history')
  async getBatchHistory(
    @Query('type') type?: string,
    @Query('limit') limit?: string
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 50;
    return await this.batchLogService.getBatchHistory(type, limitNum);
  }

  @Post('batch/run/:type')
  async runBatch(
    @Param('type') type: 'daily' | 'weekly' | 'monthly',
    @Body() body?: { date?: string; dryRun?: boolean }
  ) {
    const { date, dryRun = false } = body || {};

    try {
      const result = await this.batchCoreService.executeBatch({
        type,
        date,
        dryRun
      });

      return {
        success: true,
        message: `${type} 배치가 성공적으로 실행되었습니다`,
        result
      };
    } catch (error) {
      return {
        success: false,
        message: `${type} 배치 실행 중 오류가 발생했습니다`,
        error: error.message
      };
    }
  }

  @Post('batch/schedule/:type')
  async runScheduledBatch(@Param('type') type: 'daily' | 'weekly' | 'monthly') {
    try {
      const result = await this.scheduledBatchService.runScheduledBatch(type);
      return {
        success: true,
        message: `${type} 스케줄 배치가 수동으로 실행되었습니다`,
        result
      };
    } catch (error) {
      return {
        success: false,
        message: `${type} 스케줄 배치 실행 중 오류가 발생했습니다`,
        error: error.message
      };
    }
  }
}