import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course, CourseDocument } from './schemas/course.schema';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
  ) {}

  async create(createCourseDto: CreateCourseDto): Promise<Course> {
    const createdCourse = new this.courseModel(createCourseDto);
    return createdCourse.save();
  }

  async findAll(): Promise<Course[]> {
    return this.courseModel.find().exec();
  }
  async findOne(id: string): Promise<Course> {
    const course = await this.courseModel.findById(id).exec();
    if (!course) {
      throw new NotFoundException(`Curso com ID ${id} não encontrado`);
    }
    return course;
  }

  async update(id: string, updateCourseDto: UpdateCourseDto): Promise<Course> {
    const existingCourse = await this.courseModel
      .findByIdAndUpdate(id, updateCourseDto, { new: true })
      .exec();
    if (!existingCourse) {
      throw new NotFoundException(`Curso com ID ${id} não encontrado`);
    }
    return existingCourse;
  }

  async remove(id: string): Promise<Course> {
    const deletedCourse = await this.courseModel.findByIdAndDelete(id).exec();
    if (!deletedCourse) {
      throw new NotFoundException(`Curso com ID ${id} não encontrado`);
    }
    return deletedCourse;
  }
}
