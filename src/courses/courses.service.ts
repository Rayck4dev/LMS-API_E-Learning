import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course, CourseDocument } from './schemas/course.schema';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(createCourseDto: CreateCourseDto): Promise<Course> {
    const createdCourse = new this.courseModel(createCourseDto);
    const savedCourse = await createdCourse.save();

    await this.clearCoursesCache();

    return savedCourse;
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

    await this.clearCoursesCache();

    return existingCourse;
  }

  async remove(id: string): Promise<Course> {
    const deletedCourse = await this.courseModel.findByIdAndDelete(id).exec();
    if (!deletedCourse) {
      throw new NotFoundException(`Curso com ID ${id} não encontrado`);
    }

    await this.clearCoursesCache();

    return deletedCourse;
  }

  private async clearCoursesCache() {
    try {
      await this.cacheManager.del('/courses');
      await this.cacheManager.del('courses');
    } catch (error) {
      console.error('Erro ao limpar cache do Redis:', error);
    }
  }
}
