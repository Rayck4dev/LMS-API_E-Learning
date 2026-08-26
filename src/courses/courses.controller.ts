import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@ApiTags('courses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @Roles('INSTRUCTOR')
  @ApiOperation({ summary: 'Cria um novo curso (Apenas Instrutores)' })
  @ApiHeader({
    name: 'idempotency-key',
    description: 'Chave única para garantir a idempotência da requisição',
    required: true,
  })
  @ApiResponse({ status: 201, description: 'Curso criado com sucesso.' })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado: apenas instrutores podem criar cursos.',
  })
  create(@Body() createCourseDto: CreateCourseDto) {
    return this.coursesService.create(createCourseDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os cursos' })
  findAll() {
    return this.coursesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um curso por ID' })
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  @Patch(':id')
  @Roles('INSTRUCTOR')
  @ApiOperation({ summary: 'Atualiza um curso (Apenas Instrutores)' })
  update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
    return this.coursesService.update(id, updateCourseDto);
  }

  @Delete(':id')
  @Roles('INSTRUCTOR')
  @ApiOperation({ summary: 'Remove um curso (Apenas Instrutores)' })
  remove(@Param('id') id: string) {
    return this.coursesService.remove(id);
  }
}
