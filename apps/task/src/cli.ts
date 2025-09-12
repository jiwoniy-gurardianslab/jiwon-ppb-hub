import { CommandFactory } from 'nest-commander';
import { BatchModule } from './batch.module';

async function bootstrap() {
  await CommandFactory.run(BatchModule, ['warn', 'error']);
}

bootstrap();
