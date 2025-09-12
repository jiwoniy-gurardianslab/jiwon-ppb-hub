import { Injectable } from '@nestjs/common';

import { PpbOrmInitService } from './orm.service';

@Injectable()
export class AppService {
  constructor(private ormService: PpbOrmInitService) {
    this.ormService.getPrismaClient();
  }

  getHello(): string {
    return 'Hello World!';
  }
}
