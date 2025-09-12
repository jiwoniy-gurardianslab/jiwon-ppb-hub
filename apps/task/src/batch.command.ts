// ====================================
// 3. 명령어 기반 배치 서비스
// ====================================
// batch.command.ts
import { Command, CommandRunner, Option } from 'nest-commander';

import { BatchCoreService } from './batch-core.service';

interface BatchCommandOptions {
  type?: 'daily' | 'weekly' | 'monthly';
  date?: string;
  dryRun?: boolean;
}

@Command({ 
  name: 'batch', 
  description: '배치 작업 실행',
  examples: [
    'batch --type daily',
    'batch --type weekly --date 2025-01-01',
    'batch --type monthly --dry-run'
  ]
})
export class BatchCommand extends CommandRunner {
  private readonly logger = new Logger(BatchCommand.name);

  constructor(private readonly batchCoreService: BatchCoreService) {
    super();
  }

  async run(
    passedParam: string[],
    options?: BatchCommandOptions,
  ): Promise<void> {
    const { type = 'daily', date, dryRun = false } = options || {};

    this.logger.log(`명령어 배치 실행 시작: ${type}`);

    try {
      const result = await this.batchCoreService.executeBatch({
        type,
        date,
        dryRun
      });

      if (result.success) {
        this.logger.log('✅ 배치 작업이 성공적으로 완료되었습니다');
        console.log(`📊 처리 결과: ${result.processedCount}건 처리, ${result.duration}ms 소요`);
      } else {
        this.logger.error('❌ 배치 작업이 실패했습니다');
        console.log(`📊 처리 결과: ${result.processedCount}건 처리, ${result.errorCount}건 오류`);
        process.exit(1);
      }

    } catch (error) {
      this.logger.error('명령어 배치 실행 실패:', error);
      process.exit(1);
    }
  }

  @Option({
    flags: '-t, --type <type>',
    description: '배치 타입 (daily, weekly, monthly)',
    choices: ['daily', 'weekly', 'monthly']
  })
  parseType(value: string): 'daily' | 'weekly' | 'monthly' {
    return value as 'daily' | 'weekly' | 'monthly';
  }

  @Option({
    flags: '-d, --date <date>',
    description: '실행 날짜 (YYYY-MM-DD 형식)',
  })
  parseDate(value: string): string {
    // 날짜 형식 검증
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      throw new Error('날짜는 YYYY-MM-DD 형식이어야 합니다');
    }
    return value;
  }

  @Option({
    flags: '--dry-run',
    description: '실제 처리 없이 테스트만 실행',
  })
  parseDryRun(): boolean {
    return true;
  }
}
