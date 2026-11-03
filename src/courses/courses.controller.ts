import {
  HttpStatus,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiResponseOptions,
  ApiTags,
} from '@nestjs/swagger';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { Request } from 'express';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CourseRequester, CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { ListCoursesDto } from './dto/list-courses.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

type AuthenticatedRequest = Request & { user: CourseRequester };

const courseResponseSchema = {
  type: 'object',
  properties: {
    _id: { type: 'string', example: '6ae929e29b075a0377cbbfa5' },
    title: { type: 'string', example: 'Curso de NestJS Completo' },
    description: {
      type: 'string',
      example: 'Aprenda NestJS do zero ao avançado com Docker e Prisma',
    },
    instructorId: {
      type: 'string',
      format: 'uuid',
      example: 'c9b1c8bf-9eaa-4de0-8c6e-d877e2bbcbcc',
    },
    lessons: { type: 'array', items: { type: 'object' }, example: [] },
    createdAt: {
      type: 'string',
      format: 'date-time',
      example: '2026-11-02T20:00:00.000Z',
    },
    updatedAt: {
      type: 'string',
      format: 'date-time',
      example: '2026-11-02T20:00:00.000Z',
    },
    __v: { type: 'number', example: 0 },
  },
};

function problemResponse(
  status: number,
  description: string,
  detail: string,
  instance: string,
): ApiResponseOptions {
  return {
    status,
    description,
    content: {
      'application/problem+json': {
        schema: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              example: `https://httpstatuses.com/${status}`,
            },
            title: { type: 'string', example: HttpStatus[status] || 'Error' },
            status: { type: 'number', example: status },
            detail: { type: 'string', example: detail },
            instance: { type: 'string', example: instance },
            correlationId: {
              type: 'string',
              example: 'ab57cbd1-b749-4667-94e5-7f0e58817956',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              example: '2026-11-02T20:00:00.000Z',
            },
          },
        },
        example: {
          type: `https://httpstatuses.com/${status}`,
          title: HttpStatus[status] || 'Error',
          status,
          detail,
          instance,
          correlationId: 'ab57cbd1-b749-4667-94e5-7f0e58817956',
          timestamp: '2026-11-02T20:00:00.000Z',
        },
      },
    },
  };
}

@ApiTags('courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('INSTRUCTOR', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Cria um curso para o instrutor ou administrador autenticado',
    description:
      'Requer perfil INSTRUCTOR ou ADMIN. O instrutor é obtido do token JWT; envie somente título e descrição.',
  })
  @ApiHeader({
    name: 'idempotency-key',
    description: 'Chave obrigatória para identificar esta operação POST.',
    required: true,
    example: 'idemp-create-course-01',
  })
  @ApiResponse({
    status: 201,
    description: 'Curso criado com sucesso.',
    schema: courseResponseSchema,
  })
  @ApiResponse(
    problemResponse(
      HttpStatus.BAD_REQUEST,
      'Dados inválidos ou cabeçalho idempotency-key ausente.',
      'O cabeçalho "idempotency-key" é obrigatório para esta operação.',
      '/courses',
    ),
  )
  @ApiResponse(
    problemResponse(
      HttpStatus.UNAUTHORIZED,
      'Token JWT ausente ou inválido.',
      'Token de acesso ausente ou inválido.',
      '/courses',
    ),
  )
  @ApiResponse(
    problemResponse(
      HttpStatus.FORBIDDEN,
      'O usuário não possui perfil INSTRUCTOR ou ADMIN.',
      'Acesso negado: esta operação requer um dos seguintes perfis: INSTRUCTOR, ADMIN.',
      '/courses',
    ),
  )
  @ApiResponse(
    problemResponse(
      HttpStatus.INTERNAL_SERVER_ERROR,
      'Erro inesperado ao criar o curso.',
      'Erro interno do servidor',
      '/courses',
    ),
  )
  create(
    @Body() createCourseDto: CreateCourseDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.coursesService.create(createCourseDto, request.user);
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(30_000)
  @ApiOperation({
    summary: 'Lista cursos com busca, filtro e paginação opcionais',
    description:
      'Endpoint público. Aceita os filtros search, instructorId, page e limit.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de cursos.',
    schema: {
      type: 'array',
      items: courseResponseSchema,
    },
  })
  @ApiResponse(
    problemResponse(
      HttpStatus.BAD_REQUEST,
      'Um ou mais filtros da consulta são inválidos.',
      'Formato ou valor inválido para os parâmetros da consulta.',
      '/courses',
    ),
  )
  @ApiResponse(
    problemResponse(
      HttpStatus.INTERNAL_SERVER_ERROR,
      'Erro inesperado ao consultar os cursos.',
      'Erro interno do servidor',
      '/courses',
    ),
  )
  findAll(@Query() filters: ListCoursesDto) {
    return this.coursesService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Busca um curso por ID',
    description:
      'Endpoint público; o ID deve ser o identificador MongoDB do curso.',
  })
  @ApiResponse({
    status: 200,
    description: 'Curso encontrado.',
    schema: courseResponseSchema,
  })
  @ApiResponse(
    problemResponse(
      HttpStatus.NOT_FOUND,
      'Não existe curso com o ID informado.',
      'Curso não encontrado',
      '/courses/{id}',
    ),
  )
  @ApiResponse(
    problemResponse(
      HttpStatus.INTERNAL_SERVER_ERROR,
      'Erro inesperado ao consultar o curso.',
      'Erro interno do servidor',
      '/courses/{id}',
    ),
  )
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('INSTRUCTOR', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Atualiza um curso próprio (ou qualquer curso como ADMIN)',
    description:
      'Requer perfil INSTRUCTOR ou ADMIN. Instrutores só podem atualizar os próprios cursos; administradores podem atualizar qualquer curso. Informe somente title e/ou description.',
  })
  @ApiResponse({
    status: 200,
    description: 'Curso atualizado.',
    schema: courseResponseSchema,
  })
  @ApiResponse(
    problemResponse(
      HttpStatus.BAD_REQUEST,
      'Os campos enviados são inválidos.',
      'Formato ou valor inválido na solicitação.',
      '/courses/{id}',
    ),
  )
  @ApiResponse(
    problemResponse(
      HttpStatus.UNAUTHORIZED,
      'Token JWT ausente ou inválido.',
      'Token de acesso ausente ou inválido.',
      '/courses/{id}',
    ),
  )
  @ApiResponse(
    problemResponse(
      HttpStatus.FORBIDDEN,
      'Perfil sem permissão ou instrutor tentando alterar curso de outro instrutor.',
      'Este curso pertence a outro instrutor',
      '/courses/{id}',
    ),
  )
  @ApiResponse(
    problemResponse(
      HttpStatus.NOT_FOUND,
      'Não existe curso com o ID informado.',
      'Curso não encontrado',
      '/courses/{id}',
    ),
  )
  @ApiResponse(
    problemResponse(
      HttpStatus.INTERNAL_SERVER_ERROR,
      'Erro inesperado ao atualizar o curso.',
      'Erro interno do servidor',
      '/courses/{id}',
    ),
  )
  update(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.coursesService.update(id, updateCourseDto, request.user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('INSTRUCTOR', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Remove um curso próprio (ou qualquer curso como ADMIN)',
    description:
      'Requer perfil INSTRUCTOR ou ADMIN. Instrutores só podem remover os próprios cursos; administradores podem remover qualquer curso.',
  })
  @ApiResponse({
    status: 200,
    description: 'Curso removido. A resposta contém o documento removido.',
    schema: courseResponseSchema,
  })
  @ApiResponse(
    problemResponse(
      HttpStatus.UNAUTHORIZED,
      'Token JWT ausente ou inválido.',
      'Token de acesso ausente ou inválido.',
      '/courses/{id}',
    ),
  )
  @ApiResponse(
    problemResponse(
      HttpStatus.FORBIDDEN,
      'Perfil sem permissão ou instrutor tentando remover curso de outro instrutor.',
      'Este curso pertence a outro instrutor',
      '/courses/{id}',
    ),
  )
  @ApiResponse(
    problemResponse(
      HttpStatus.NOT_FOUND,
      'Não existe curso com o ID informado.',
      'Curso não encontrado',
      '/courses/{id}',
    ),
  )
  @ApiResponse(
    problemResponse(
      HttpStatus.INTERNAL_SERVER_ERROR,
      'Erro inesperado ao remover o curso.',
      'Erro interno do servidor',
      '/courses/{id}',
    ),
  )
  remove(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return this.coursesService.remove(id, request.user);
  }
}
