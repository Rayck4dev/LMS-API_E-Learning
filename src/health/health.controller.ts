import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import {
  HealthCheckService,
  HealthCheck,
  MongooseHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';
import { PrismaService } from '../prisma/prisma.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Health Check')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private mongooseHealth: MongooseHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
    private prisma: PrismaService,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({
    summary: 'Verifica a saúde da API e dos serviços conectados',
  })
  check() {
    return this.health.check([
      async () => {
        try {
          await this.prisma.client.$queryRaw`SELECT 1`;
          return { database_postgres: { status: 'up' } };
        } catch (error) {
          throw new ServiceUnavailableException({
            database_postgres: { status: 'down', message: error.message },
          });
        }
      },

      () => this.mongooseHealth.pingCheck('database_mongodb'),

      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),

      () =>
        this.disk.checkStorage('storage_disk', {
          path: '/',
          thresholdPercent: 0.9,
        }),
    ]);
  }
}
