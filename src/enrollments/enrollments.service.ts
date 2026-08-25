import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Enrollment,
  EnrollmentDocument,
} from '../courses/schemas/enrollment.schema';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CoursesService } from '../courses/courses.service';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectModel(Enrollment.name)
    private enrollmentModel: Model<EnrollmentDocument>,
    private readonly prisma: PrismaService,
    private readonly coursesService: CoursesService,
  ) {}

  async create(createEnrollmentDto: CreateEnrollmentDto) {
    const { studentId, courseId } = createEnrollmentDto;

    if (!studentId || !courseId) {
      throw new BadRequestException('studentId e courseId são obrigatórios');
    }

    const student = await this.prisma.client.user.findUnique({
      where: { id: studentId },
    });
    if (!student) {
      throw new NotFoundException('Aluno não encontrado no banco de dados');
    }

    const course = await this.coursesService.findOne(courseId);
    if (!course) {
      throw new NotFoundException('Curso não encontrado');
    }

    const existingEnrollment = await this.enrollmentModel.findOne({
      studentId,
      courseId,
    });
    if (existingEnrollment) {
      throw new ConflictException('Aluno já está matriculado neste curso');
    }

    const enrollment = new this.enrollmentModel({ studentId, courseId });
    return enrollment.save();
  }

  async findAll() {
    return this.enrollmentModel.find().exec();
  }

  async findByStudent(studentId: string) {
    return this.enrollmentModel.find({ studentId }).exec();
  }

  async remove(id: string) {
    const deleted = await this.enrollmentModel.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException('Matrícula não encontrada');
    return { message: 'Matrícula cancelada com sucesso' };
  }
}
