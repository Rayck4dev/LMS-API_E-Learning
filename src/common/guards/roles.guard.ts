import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Se a rota não exigir roles específicas, libera o acesso
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Se o JwtAuthGuard não tiver injetado o usuário
    if (!user) {
      throw new UnauthorizedException('Usuário não autenticado.');
    }

    // Se o usuário não tiver uma role definida no payload do token
    if (!user.role) {
      throw new ForbiddenException(
        'Acesso negado: Perfil do usuário não informado no token.',
      );
    }

    // Valida se a role do usuário está na lista de roles permitidas
    const hasRole = requiredRoles.includes(user.role);

    if (!hasRole) {
      throw new ForbiddenException(
        'Acesso negado: apenas instrutores podem criar cursos.',
      );
    }

    return true;
  }
}
