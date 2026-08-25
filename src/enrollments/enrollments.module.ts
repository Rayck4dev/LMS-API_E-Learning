import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EnrollmentsService } from './enrollments.service';
import { EnrollmentsController } from './enrollments.controller';
import {
  Enrollment,
  EnrollmentSchema,
} from '../courses/schemas/enrollment.schema';
import { CoursesModule } from '../courses/courses.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Enrollment.name, schema: EnrollmentSchema },
    ]),
    CoursesModule,
  ],
  controllers: [EnrollmentsController],
  providers: [EnrollmentsService],
})
export class EnrollmentsModule {}
