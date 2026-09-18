import { Injectable } from '@nestjs/common';
import { EnrollmentStrategy } from './enrollment-strategy.interface';

@Injectable()
export class PaidEnrollmentStrategy implements EnrollmentStrategy {
  async processEnrollment(userId: string, courseId: string) {
    return {
      status: 'WAITING_PAYMENT',
      message: `Aguardando confirmação de pagamento para liberar o curso ${courseId}`,
    };
  }
}
