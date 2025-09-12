// ====================================
// 8. 배치 실행 로그 엔티티 및 서비스
// ====================================
// batch-execution-log.entity.ts
export interface BatchExecutionLog {
  id?: number;
  batchType: string;
  startTime: Date;
  endTime?: Date;
  status: 'RUNNING' | 'SUCCESS' | 'FAILED';
  processedCount: number;
  errorCount: number;
  errorDetails?: string;
  triggeredBy: 'SCHEDULER' | 'MANUAL' | 'API';
  executionId: string; // UUID
}
