import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Enrollments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post()
  @ApiOperation({
    summary: 'Realiza a matrícula de um aluno em um curso',
    description:
      'Cria um novo registro de matrícula associando o ID do aluno (PostgreSQL) ao ID do curso (MongoDB). Requisição protegida e idempotente.',
  })
  @ApiHeader({
    name: 'idempotency-key',
    description: 'Chave única para garantir a idempotência da requisição',
    required: true,
    schema: { type: 'string', default: 'enrollment-key-123' },
  })
  @ApiResponse({ status: 201, description: 'Matrícula efetuada com sucesso.' })
  @ApiResponse({
    status: 400,
    description: 'Dados de entrada inválidos ou inexistentes.',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado. Token JWT ausente ou inválido.',
  })
  @ApiResponse({
    status: 409,
    description:
      'Conflito. Operação já processada (Idempotência) ou aluno já matriculado.',
  })
  create(@Body() createEnrollmentDto: CreateEnrollmentDto) {
    return this.enrollmentsService.create(createEnrollmentDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Lista todas as matrículas cadastradas',
    description:
      'Retorna uma listagem completa de todas as matrículas realizadas no sistema.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de matrículas retornada com sucesso.',
  })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  findAll() {
    return this.enrollmentsService.findAll();
  }

  @Get('student/:studentId')
  @ApiOperation({
    summary: 'Busca as matrículas de um aluno específico',
    description:
      'Retorna a lista de cursos em que o aluno informado pelo UUID está matriculado.',
  })
  @ApiResponse({
    status: 200,
    description: 'Matrículas do aluno encontradas com sucesso.',
  })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({
    status: 404,
    description: 'Aluno não encontrado ou sem matrículas.',
  })
  findByStudent(@Param('studentId') studentId: string) {
    return this.enrollmentsService.findByStudent(studentId);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Cancela uma matrícula existente',
    description:
      'Remove o registro da matrícula correspondente ao ID informado.',
  })
  @ApiResponse({ status: 200, description: 'Matrícula cancelada com sucesso.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 404, description: 'Matrícula não encontrada.' })
  remove(@Param('id') id: string) {
    return this.enrollmentsService.remove(id);
  }
}
