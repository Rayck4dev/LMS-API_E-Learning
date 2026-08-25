import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ProblemDetailsFilter } from './common/filters/problem-details.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new ProblemDetailsFilter());

  const config = new DocumentBuilder()
    .setTitle('LMS Platform API')
    .setDescription('API da Plataforma de Cursos Online (E-Learning)')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
