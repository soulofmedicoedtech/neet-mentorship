import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  getHealth(): { status: 'ok'; service: 'praxis-api'; timestamp: string } {
    return {
      status: 'ok',
      service: 'praxis-api',
      timestamp: new Date().toISOString(),
    };
  }
}
