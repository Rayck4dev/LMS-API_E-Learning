import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CourseDocument = Course & Document;

@Schema()
export class Lesson {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  videoUrl: string;

  @Prop()
  durationInMinutes: number;
}

const LessonSchema = SchemaFactory.createForClass(Lesson);

@Schema({ timestamps: true })
export class Course {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  instructorId: string;

  @Prop({ type: [LessonSchema], default: [] })
  lessons: Lesson[];
}

export const CourseSchema = SchemaFactory.createForClass(Course);
