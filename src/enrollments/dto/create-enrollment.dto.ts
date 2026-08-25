import { ApiProperty } from '@nestjs/swagger';

export class CreateEnrollmentDto {
  @ApiProperty({
    example: 'ID_DO_ALUNO_POSTGRES',
    description: 'ID do aluno cadastrado no PostgreSQL',
  })
  studentId: string;

  @ApiProperty({
    example: 'ID_DO_CURSO_MONGO',
    description: 'ID do curso cadastrado no MongoDB',
  })
  courseId: string;
}
