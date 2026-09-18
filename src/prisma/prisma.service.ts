import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  public client: PrismaClient;

  constructor() {
    const dbUrl = process.env.DATABASE_URL;

    if (!dbUrl) {
      throw new Error('DATABASE_URL não definida no .env');
    }

    const parsedUrl = new URL(dbUrl);

    const pool = new Pool({
      host: parsedUrl.hostname || 'localhost',
      port: Number(parsedUrl.port) || 5432,
      user: parsedUrl.username || 'lms_user',
      password: parsedUrl.password || 'lms-postgres-acad',
      database: parsedUrl.pathname.replace('/', '') || 'lms_db',
    });

    const adapter = new PrismaPg(pool);
    this.client = new PrismaClient({ adapter });
  }

  async onModuleInit() {
    await this.client.$connect();
  }

  async onModuleDestroy() {
    await this.client.$disconnect();
  }
}
