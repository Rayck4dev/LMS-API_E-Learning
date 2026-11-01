import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Model } from 'mongoose';
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
import { UpdateProgressDto } from './dto/update-progress.dto';

export interface EnrollmentRequester {
  id: string;
  role: string;
}

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
    this.strategies = { FREE: this.freeStrategy, PAID: this.paidStrategy };
  }

  async create(
    createEnrollmentDto: CreateEnrollmentDto,
    requester: EnrollmentRequester,
  ) {
    if (requester.role !== 'STUDENT') {
      throw new ForbiddenException('Somente estudantes podem se matricular');
    }

    const student = await this.prisma.client.user.findUnique({
      where: { id: requester.id },
      select: { id: true, role: true },
    });
    if (!student || student.role !== 'STUDENT') {
      throw new ForbiddenException('A conta não possui perfil de estudante');
    }

    const { courseId } = createEnrollmentDto;
    await this.coursesService.findOne(courseId);

    const existingEnrollment = await this.enrollmentModel.findOne({
      studentId: student.id,
      courseId,
    });
    if (existingEnrollment) {
      throw new ConflictException('Aluno já está matriculado neste curso');
    }

    await this.strategies.FREE.processEnrollment(student.id, courseId);

    try {
      const enrollment = new this.enrollmentModel({
        studentId: student.id,
        courseId,
      });
      const savedEnrollment = await enrollment.save();
      this.eventEmitter.emit('enrollment.created', {
        userId: student.id,
        courseId,
      });
      return savedEnrollment;
    } catch (error) {
      if ((error as { code?: number }).code === 11000) {
        throw new ConflictException('Aluno já está matriculado neste curso');
      }
      throw error;
    }
  }

  async findAll(requester: EnrollmentRequester) {
    if (requester.role !== 'ADMIN') {
      throw new ForbiddenException('Apenas administradores podem listar todas');
    }
    return this.enrollmentModel.find().exec();
  }

  async findByStudent(studentId: string, requester: EnrollmentRequester) {
    if (
      requester.role !== 'ADMIN' &&
      (requester.id !== studentId || requester.role !== 'STUDENT')
    ) {
      throw new ForbiddenException('Você só pode consultar suas matrículas');
    }
    const student = await this.prisma.client.user.findUnique({
      where: { id: studentId },
      select: { id: true },
    });
    if (!student) throw new NotFoundException('Aluno não encontrado');
    return this.enrollmentModel.find({ studentId }).exec();
  }

  async findByCourse(courseId: string, requester: EnrollmentRequester) {
    const course = await this.coursesService.findOne(courseId);
    const isAdmin = requester.role === 'ADMIN';
    const isCourseInstructor =
      requester.role === 'INSTRUCTOR' && course.instructorId === requester.id;

    if (!isAdmin && !isCourseInstructor) {
      throw new ForbiddenException(
        'Instrutores só podem consultar matrículas dos próprios cursos',
      );
    }

    return this.enrollmentModel.find({ courseId }).exec();
  }

  async remove(id: string, requester: EnrollmentRequester) {
    if (!id) throw new BadRequestException('ID da matrícula é obrigatório');
    const enrollment = await this.enrollmentModel.findById(id).exec();
    if (!enrollment) throw new NotFoundException('Matrícula não encontrada');
    if (
      requester.role !== 'ADMIN' &&
      (requester.id !== enrollment.studentId || requester.role !== 'STUDENT')
    ) {
      throw new ForbiddenException('Você só pode cancelar suas matrículas');
    }
    await this.enrollmentModel.findByIdAndDelete(id).exec();
    return { message: 'Matrícula cancelada com sucesso' };
  }

  async updateProgress(
    id: string,
    updateProgressDto: UpdateProgressDto,
    requester: EnrollmentRequester,
  ) {
    const enrollment = await this.enrollmentModel.findById(id).exec();
    if (!enrollment) throw new NotFoundException('Matrícula não encontrada');
    if (
      requester.role !== 'ADMIN' &&
      (requester.id !== enrollment.studentId || requester.role !== 'STUDENT')
    ) {
      throw new ForbiddenException('Você só pode atualizar seu próprio progresso');
    }

    const progressPercent = updateProgressDto.progressPercent;
    return this.enrollmentModel
      .findByIdAndUpdate(
        id,
        {
          progressPercent,
          status: progressPercent === 100 ? 'COMPLETED' : 'ACTIVE',
        },
        { new: true, runValidators: true },
      )
      .exec();
  }
}
