import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'chave-secreta-lms-api',
    });
  }

  async validate(payload: any) {
    // Esse retorno é o que se torna o 'req.user' no RolesGuard!
    return { id: payload.sub, email: payload.email, role: payload.role };
  }
}
