import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'ana@email.com', description: 'E-mail cadastrado do usuário' })
  email: string;

  @ApiProperty({ example: '123456', description: 'Senha do usuário' })
  password: string;
}