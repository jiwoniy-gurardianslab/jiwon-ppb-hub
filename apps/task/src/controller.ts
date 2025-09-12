@Controller('health')
export class HealthController {
  @Get()
  getHealth() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Get('batch/:type')
  async runBatch(@Param('type') type: string) {
    // 수동으로 배치 실행
  }
}