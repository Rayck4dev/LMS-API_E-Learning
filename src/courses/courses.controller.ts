import {
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

@ApiTags('courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('INSTRUCTOR', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cria um curso para o instrutor autenticado' })
  @ApiHeader({ name: 'idempotency-key', required: true })
  @ApiResponse({ status: 201, description: 'Curso criado com sucesso.' })
  create(
    @Body() createCourseDto: CreateCourseDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.coursesService.create(createCourseDto, request.user);
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(30_000)
  @ApiOperation({ summary: 'Lista cursos com busca, filtro e paginação opcionais' })
  findAll(@Query() filters: ListCoursesDto) {
    return this.coursesService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um curso por ID' })
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('INSTRUCTOR', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualiza um curso próprio (ou qualquer curso como ADMIN)' })
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
  @ApiOperation({ summary: 'Remove um curso próprio (ou qualquer curso como ADMIN)' })
  remove(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return this.coursesService.remove(id, request.user);
  }
}
