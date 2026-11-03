import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

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
}
