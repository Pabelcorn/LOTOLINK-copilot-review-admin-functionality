import { Controller, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';

@Controller('health')
export class HealthController {
  constructor(
    @InjectConnection() private readonly connection: Connection,
  ) {}

  @Get()
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'lotolink-backend',
      version: '1.0.0',
      uptime: process.uptime(),
    };
  }

  @Get('ready')
  async ready() {
    // Check database connectivity
    let databaseStatus = 'ok';
    try {
      await this.connection.query('SELECT 1');
    } catch (error) {
      databaseStatus = 'error';
    }

    const isReady = databaseStatus === 'ok';

    return {
      status: isReady ? 'ready' : 'not_ready',
      timestamp: new Date().toISOString(),
      checks: {
        database: databaseStatus,
      },
    };
  }
}
