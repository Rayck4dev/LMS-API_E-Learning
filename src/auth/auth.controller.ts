import { Controller, Post, Body } from '@nestjs/common';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

    @ApiHeader({
    name: 'idempotency-key',
    description: 'Chave única para garantir a idempotência da requisição',
    required: true,
    schema: { type: 'string', default: 'minha-chave-123' },
  })
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
