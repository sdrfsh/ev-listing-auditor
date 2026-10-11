import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AppService, DatabaseStatus } from './app.service.js';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  @Get('health-check')
  async checkDatabase(): Promise<DatabaseStatus> {
    return this.appService.checkDatabase();
  }
}
