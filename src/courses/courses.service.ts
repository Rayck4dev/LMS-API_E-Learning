import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type { Cache } from 'cache-manager';
import { Course, CourseDocument } from './schemas/course.schema';
import { CreateCourseDto } from './dto/create-course.dto';
import { ListCoursesDto } from './dto/list-courses.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

export interface CourseRequester {
  id: string;
  role: string;
}

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(
    createCourseDto: CreateCourseDto,
    requester: CourseRequester,
  ): Promise<Course> {
    const createdCourse = new this.courseModel({
      title: createCourseDto.title,
      description: createCourseDto.description,
      instructorId: requester.id,
    });
    const savedCourse = await createdCourse.save();
    await this.clearCoursesCache();
    return savedCourse;
  }

  async findAll(filters: ListCoursesDto = {}): Promise<Course[]> {
    const query: Record<string, unknown> = {};
    if (filters.search) {
      const safeSearch = filters.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.title = { $regex: safeSearch, $options: 'i' };
    }
    if (filters.instructorId) query.instructorId = filters.instructorId;

    let coursesQuery = this.courseModel.find(query);
    if (filters.page !== undefined || filters.limit !== undefined) {
      const page = filters.page ?? 1;
      const limit = filters.limit ?? 20;
      coursesQuery = coursesQuery.skip((page - 1) * limit).limit(limit);
    }
    return coursesQuery.exec();
  }

  async findOne(id: string): Promise<Course> {
    const course = await this.courseModel.findById(id).exec();
    if (!course) throw new NotFoundException(`Curso com ID ${id} não encontrado`);
    return course;
  }

  async update(
    id: string,
    updateCourseDto: UpdateCourseDto,
    requester: CourseRequester,
  ): Promise<Course> {
    const course = await this.findOne(id);
    this.assertCanManage(course, requester);
    const updatedCourse = await this.courseModel
      .findByIdAndUpdate(id, updateCourseDto, { new: true, runValidators: true })
      .exec();
    if (!updatedCourse) throw new NotFoundException('Curso não encontrado');
    await this.clearCoursesCache();
    return updatedCourse;
  }

  async remove(id: string, requester: CourseRequester): Promise<Course> {
    const course = await this.findOne(id);
    this.assertCanManage(course, requester);
    const deletedCourse = await this.courseModel.findByIdAndDelete(id).exec();
    if (!deletedCourse) throw new NotFoundException('Curso não encontrado');
    await this.clearCoursesCache();
    return deletedCourse;
  }

  private assertCanManage(course: Course, requester: CourseRequester) {
    if (requester.role !== 'ADMIN' && course.instructorId !== requester.id) {
      throw new ForbiddenException('Este curso pertence a outro instrutor');
    }
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
