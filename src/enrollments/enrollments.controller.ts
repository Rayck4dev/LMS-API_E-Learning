import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { EnrollmentsService, EnrollmentRequester } from './enrollments.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';

type AuthenticatedRequest = Request & { user: EnrollmentRequester };

@ApiTags('Enrollments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Matricula o estudante autenticado em um curso' })
  @ApiHeader({ name: 'idempotency-key', required: true })
  @ApiResponse({ status: 201, description: 'Matrícula efetuada com sucesso.' })
  create(
    @Body() createEnrollmentDto: CreateEnrollmentDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.enrollmentsService.create(createEnrollmentDto, request.user);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Lista todas as matrículas (apenas ADMIN)' })
  findAll(@Req() request: AuthenticatedRequest) {
    return this.enrollmentsService.findAll(request.user);
  }

  @Get('student/:studentId')
  @ApiOperation({ summary: 'Lista matrículas próprias ou de qualquer aluno como ADMIN' })
  findByStudent(
    @Param('studentId') studentId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.enrollmentsService.findByStudent(studentId, request.user);
  }

  @Get('course/:courseId')
  @ApiOperation({
    summary: 'Lista matrículas do curso próprio do instrutor ou qualquer curso como ADMIN',
  })
  findByCourse(
    @Param('courseId') courseId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.enrollmentsService.findByCourse(courseId, request.user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancela matrícula própria ou qualquer matrícula como ADMIN' })
  remove(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return this.enrollmentsService.remove(id, request.user);
  }

  @Patch(':id/progress')
  @ApiOperation({ summary: 'Atualiza o progresso da própria matrícula (0 a 100%)' })
  updateProgress(
    @Param('id') id: string,
    @Body() updateProgressDto: UpdateProgressDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.enrollmentsService.updateProgress(
      id,
      updateProgressDto,
      request.user,
    );
  }
}
