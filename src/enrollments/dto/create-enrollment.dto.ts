import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty } from 'class-validator';

export class CreateEnrollmentDto {
  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'ID do curso no MongoDB; o aluno vem do token autenticado',
  })
  @IsMongoId()
  @IsNotEmpty()
  courseId: string;
}
