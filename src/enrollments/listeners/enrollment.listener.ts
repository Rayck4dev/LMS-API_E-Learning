import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class EnrollmentListener {
  @OnEvent('enrollment.created')
  handleSendWelcomeEmail(payload: { userId: string; courseId: string }) {
    console.log(
      `[OBSERVER - EMAIL] Disparando e-mail de boas-vindas para o usuário ${payload.userId}`,
    );
  }

  @OnEvent('enrollment.created')
  handleAnalytics(payload: { userId: string; courseId: string }) {
    console.log(
      `[OBSERVER - ANALYTICS] Registrando métrica do curso ${payload.courseId}`,
    );
  }
}
