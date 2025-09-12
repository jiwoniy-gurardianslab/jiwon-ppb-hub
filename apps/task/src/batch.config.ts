// ====================================
// 9. 배치 설정 관리
// ====================================
// batch.config.ts
export interface BatchScheduleConfig {
  cron: string;
  enabled: boolean;
  timezone: string;
}

export interface BatchSizeConfig {
  chunkSize: number;
  concurrency: number;
  maxRetries: number;
}

export interface BatchConfig {
  schedules: {
    daily: BatchScheduleConfig;
    weekly: BatchScheduleConfig;
    monthly: BatchScheduleConfig;
  };
  batchSizes: {
    daily: BatchSizeConfig;
    weekly: BatchSizeConfig;
    monthly: BatchSizeConfig;
  };
  notifications: {
    email: {
      enabled: boolean;
      recipients: string[];
    };
    slack: {
      enabled: boolean;
      webhook: string;
    };
  };
}

export const BATCH_CONFIG: BatchConfig = {
  schedules: {
    daily: {
      cron: '0 2 * * *', // 매일 새벽 2시
      enabled: true,
      timezone: 'Asia/Seoul'
    },
    weekly: {
      cron: '0 3 * * 1', // 매주 월요일 새벽 3시
      enabled: true,
      timezone: 'Asia/Seoul'
    },
    monthly: {
      cron: '0 4 1 * *', // 매월 1일 새벽 4시
      enabled: true,
      timezone: 'Asia/Seoul'
    }
  },
  batchSizes: {
    daily: {
      chunkSize: 1000,
      concurrency: 3,
      maxRetries: 3
    },
    weekly: {
      chunkSize: 500,
      concurrency: 5,
      maxRetries: 2
    },
    monthly: {
      chunkSize: 100,
      concurrency: 10,
      maxRetries: 1
    }
  },
  notifications: {
    email: {
      enabled: false,
      recipients: ['admin@example.com']
    },
    slack: {
      enabled: false,
      webhook: 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK'
    }
  }
};