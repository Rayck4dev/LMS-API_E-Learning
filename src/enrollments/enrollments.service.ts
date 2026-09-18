import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  Enrollment,
  EnrollmentDocument,
} from '../courses/schemas/enrollment.schema';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CoursesService } from '../courses/courses.service';
import { FreeEnrollmentStrategy } from './strategies/free-enrollment.strategy';
import { PaidEnrollmentStrategy } from './strategies/paid-enrollment.strategy';
import { EnrollmentStrategy } from './strategies/enrollment-strategy.interface';

@Injectable()
export class EnrollmentsService {
  private strategies: Record<string, EnrollmentStrategy>;

  constructor(
    @InjectModel(Enrollment.name)
    private enrollmentModel: Model<EnrollmentDocument>,
    private readonly prisma: PrismaService,
    private readonly coursesService: CoursesService,
    private readonly eventEmitter: EventEmitter2,
    private readonly freeStrategy: FreeEnrollmentStrategy,
    private readonly paidStrategy: PaidEnrollmentStrategy,
  ) {
    this.strategies = {
      FREE: this.freeStrategy,
      PAID: this.paidStrategy,
    };
  }

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

    const strategyType = 'FREE';
    const strategy = this.strategies[strategyType];
    await strategy.processEnrollment(studentId, courseId);

    const enrollment = new this.enrollmentModel({ studentId, courseId });
    const savedEnrollment = await enrollment.save();

    this.eventEmitter.emit('enrollment.created', { studentId, courseId });

    return savedEnrollment;
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
