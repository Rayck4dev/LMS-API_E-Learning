import { Injectable } from '@nestjs/common';
import { EnrollmentStrategy } from './enrollment-strategy.interface';

@Injectable()
export class FreeEnrollmentStrategy implements EnrollmentStrategy {
  async processEnrollment(userId: string, courseId: string) {
    return {
      status: 'APPROVED',
      message: `Matrícula gratuita ativada com sucesso para o usuário ${userId}`,
    };
  }
}
