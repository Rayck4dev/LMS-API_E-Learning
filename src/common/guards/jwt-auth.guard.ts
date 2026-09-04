import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any) {
    // Se houver erro de validação ou o token não retornar um usuário, bloqueia com 401
    if (err || !user) {
      throw (
        err || new UnauthorizedException('Token de acesso ausente ou inválido.')
      );
    }
    return user;
  }
}
