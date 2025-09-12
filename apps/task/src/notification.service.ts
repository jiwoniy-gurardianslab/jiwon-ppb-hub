import { Injectable, Logger } from '@nestjs/common';
import { BATCH_CONFIG } from './batch.config';

export interface NotificationPayload {
  batchType: string;
  status: 'SUCCESS' | 'FAILED' | 'ERROR';
  result?: BatchResult;
  error?: any;
  executionId: string;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  async sendBatchNotification(payload: NotificationPayload): Promise<void> {
    try {
      // 이메일 알림
      if (BATCH_CONFIG.notifications.email.enabled) {
        await this.sendEmailNotification(payload);
      }

      // 슬랙 알림
      if (BATCH_CONFIG.notifications.slack.enabled) {
        await this.sendSlackNotification(payload);
      }

    } catch (error) {
      this.logger.error('알림 발송 실패:', error);
    }
  }

  private async sendEmailNotification(payload: NotificationPayload): Promise<void> {
    const subject = `[배치 알림] ${payload.batchType.toUpperCase()} - ${payload.status}`;
    const message = this.generateEmailMessage(payload);

    // 실제 이메일 발송 로직 (nodemailer 등 사용)
    this.logger.log(`📧 이메일 알림 발송: ${subject}`);
    console.log(message);
  }

  private async sendSlackNotification(payload: NotificationPayload): Promise<void> {
    const message = this.generateSlackMessage(payload);

    try {
      // 실제 슬랙 웹훅 호출
      const response = await fetch(BATCH_CONFIG.notifications.slack.webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message)
      });

      if (response.ok) {
        this.logger.log('💬 슬랙 알림 발송 성공');
      } else {
        this.logger.error('슬랙 알림 발송 실패:', response.statusText);
      }
    } catch (error) {
      this.logger.error('슬랙 알림 발송 오류:', error);
    }
  }

  private generateEmailMessage(payload: NotificationPayload): string {
    const { batchType, status, result, error, executionId } = payload;
    const timestamp = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });

    let message = `
배치 작업 알림

🔸 배치 유형: ${batchType}
🔸 실행 ID: ${executionId}
🔸 상태: ${status}
🔸 실행 시간: ${timestamp}
    `;

    if (result) {
      message += `
🔸 처리 건수: ${result.processedCount}건
🔸 오류 건수: ${result.errorCount}건
🔸 소요 시간: ${result.duration}ms
      `;
    }

    if (error) {
      message += `
🔸 오류 메시지: ${error.message}
      `;
    }

    return message;
  }

  private generateSlackMessage(payload: NotificationPayload): any {
    const { batchType, status, result, error, executionId } = payload;
    const color = status === 'SUCCESS' ? 'good' : 'danger';
    const emoji = status === 'SUCCESS' ? '✅' : '❌';

    const fields = [
      { title: '배치 유형', value: batchType, short: true },
      { title: '실행 ID', value: executionId, short: true },
      { title: '상태', value: `${emoji} ${status}`, short: true },
    ];

    if (result) {
      fields.push(
        { title: '처리 건수', value: `${result.processedCount}건`, short: true },
        { title: '오류 건수', value: `${result.errorCount}건`, short: true },
        { title: '소요 시간', value: `${result.duration}ms`, short: true }
      );
    }

    return {
      attachments: [{
        color,
        title: `배치 작업 ${status}`,
        fields,
        footer: 'Batch Service',
        ts: Math.floor(Date.now() / 1000)
      }]
    };
  }
}