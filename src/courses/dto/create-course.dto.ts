import { ApiProperty } from '@nestjs/swagger';

export class CreateCourseDto {
  @ApiProperty({
    example: 'Curso de NestJS Completo',
    description: 'Título do curso',
  })
  title: string;

  @ApiProperty({
    example: 'Aprenda NestJS do zero ao avançado com Docker e Prisma',
    description: 'Descrição detalhada',
  })
  description: string;

  @ApiProperty({
    example: 'uuid-do-instrutor-123',
    description: 'ID do instrutor (vindo do Postgres)',
  })
  instructorId: string;
}
