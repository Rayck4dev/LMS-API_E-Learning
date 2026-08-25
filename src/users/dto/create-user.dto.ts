import { ApiProperty } from '@nestjs/swagger';

export enum Role {
  STUDENT = 'STUDENT',
  INSTRUCTOR = 'INSTRUCTOR',
  ADMIN = 'ADMIN',
}

export class CreateUserDto {
  @ApiProperty({ example: 'Ana Silva', description: 'Nome do usuário' })
  name: string;

  @ApiProperty({ example: 'ana@email.com', description: 'E-mail do usuário' })
  email: string;

  @ApiProperty({ example: '123456', description: 'Senha' })
  password: string;

  @ApiProperty({
    enum: Role,
    default: Role.STUDENT,
    description: 'Papel do usuário',
  })
  role?: Role;
}
