import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateCourseDto {
  @ApiProperty({
    example: 'Curso de NestJS Completo',
    description: 'Título do curso',
  })
  @IsString({ message: 'O título deve ser uma string' })
  @IsNotEmpty({ message: 'O título é obrigatório' })
  title: string;

  @ApiProperty({
    example: 'Aprenda NestJS do zero ao avançado com Docker e Prisma',
    description: 'Descrição detalhada',
  })
  @IsString({ message: 'A descrição deve ser uma string' })
  @IsNotEmpty({ message: 'A descrição é obrigatória' })
  description: string;

  @ApiProperty({
    example: 'uuid-do-instrutor-123',
    description: 'ID do instrutor (vindo do Postgres)',
  })
  @IsUUID('4', { message: 'O ID do instrutor deve ser um UUID v4 válido' })
  @IsNotEmpty({ message: 'O ID do instrutor é obrigatório' })
  instructorId: string;
}
