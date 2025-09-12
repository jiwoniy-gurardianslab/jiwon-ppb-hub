import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PpbOrmInitService } from './orm.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, PpbOrmInitService],
})
export class AppModule {}
