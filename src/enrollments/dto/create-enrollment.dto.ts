import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateEnrollmentDto {
  @ApiProperty({
    example: 'ID_DO_ALUNO_POSTGRES',
    description: 'ID do aluno cadastrado no PostgreSQL',
  })
  @IsUUID('4', { message: 'O ID do aluno deve ser um UUID v4 válido' })
  @IsNotEmpty({ message: 'O ID do aluno é obrigatório' })
  studentId: string;

  @ApiProperty({
    example: 'ID_DO_CURSO_MONGO',
    description: 'ID do curso cadastrado no MongoDB',
  })
  @IsMongoId({
    message: 'O ID do curso deve ser um ObjectId válido do MongoDB',
  })
  @IsNotEmpty({ message: 'O ID do curso é obrigatório' })
  courseId: string;
}
