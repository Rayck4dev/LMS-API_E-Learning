import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EnrollmentsService } from './enrollments.service';
import { EnrollmentsController } from './enrollments.controller';
import {
  Enrollment,
  EnrollmentSchema,
} from '../courses/schemas/enrollment.schema';
import { PrismaModule } from '../prisma/prisma.module';
import { CoursesModule } from '../courses/courses.module';
import { FreeEnrollmentStrategy } from './strategies/free-enrollment.strategy';
import { PaidEnrollmentStrategy } from './strategies/paid-enrollment.strategy';
import { EnrollmentListener } from './listeners/enrollment.listener';
import { RolesGuard } from '../common/guards/roles.guard';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Enrollment.name, schema: EnrollmentSchema },
    ]),
    PrismaModule,
    CoursesModule,
  ],
  controllers: [EnrollmentsController],
  providers: [
    EnrollmentsService,
    FreeEnrollmentStrategy,
    PaidEnrollmentStrategy,
    EnrollmentListener,
    RolesGuard,
  ],
})
export class EnrollmentsModule {}
