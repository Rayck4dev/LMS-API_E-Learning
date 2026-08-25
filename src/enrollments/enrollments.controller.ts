import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';

@ApiTags('enrollments')
@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @ApiHeader({
    name: 'idempotency-key',
    description: 'Chave única para garantir a idempotência da requisição',
    required: true,
    schema: { type: 'string', default: 'minha-chave-123' },
  })
  @Post()
  create(@Body() createEnrollmentDto: CreateEnrollmentDto) {
    return this.enrollmentsService.create(createEnrollmentDto);
  }

  @Get()
  findAll() {
    return this.enrollmentsService.findAll();
  }

  @Get('student/:studentId')
  findByStudent(@Param('studentId') studentId: string) {
    return this.enrollmentsService.findByStudent(studentId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.enrollmentsService.remove(id);
  }
}
