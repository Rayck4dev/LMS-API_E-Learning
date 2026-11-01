import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.prisma.client.user.findUnique({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('E-mail ou senha inválidos');
    }

    const isHashedPassword = /^\$2[aby]\$\d{2}\$/.test(user.password);
    const passwordMatches = isHashedPassword
      ? await bcrypt.compare(password, user.password)
      : user.password === password;

    if (!passwordMatches) {
      throw new UnauthorizedException('E-mail ou senha inválidos');
    }

    // Compatibilidade: senhas antigas em texto puro são atualizadas no primeiro login válido.
    if (!isHashedPassword) {
      await this.usersService.migrateLegacyPassword(user.id, password);
    }

    const payload = { sub: user.id, email: user.email, role: user.role };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}
