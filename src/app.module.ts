import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';

import { PrismaModule } from './prisma/prisma.module';
import { CoursesModule } from './courses/courses.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';

import { CorrelationIdMiddleware } from './common/middlewares/correlation-id.middleware';
import { IdempotencyInterceptor } from './common/interceptors/idempotency.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(
      process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lms',
    ),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    PrismaModule,
    CoursesModule,
    UsersModule,
    AuthModule,
    EnrollmentsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: IdempotencyInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
