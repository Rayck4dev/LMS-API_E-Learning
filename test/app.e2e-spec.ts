import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { ProblemDetailsFilter } from './../src/common/filters/problem-details.filter';

process.env.DATABASE_URL =
  'postgresql://lms_user:lms-postgres-acad@127.0.0.1:5432/lms_db?schema=public';
process.env.MONGO_URI =
  'mongodb://lms_admin:2OO-boot-mongoose@127.0.0.1:27017/lms?authSource=admin';

describe('LMS API - Fluxo Completo E2E', () => {
  let app: INestApplication;
  let createdStudentId: string;
  let createdCourseId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalFilters(new ProblemDetailsFilter());

    await app.init();
  }, 30000);

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  // 1. PostgreSQL - Usuário
  it('/users (POST) - Deve criar um Aluno no PostgreSQL', () => {
    return request(app.getHttpServer())
      .post('/users')
      .set('idempotency-key', `key-user-${Date.now()}`)
      .send({
        name: 'Aluno E2E',
        email: `aluno_${Date.now()}@email.com`,
        password: '123',
        role: 'STUDENT',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        createdStudentId = res.body.id;
      });
  });

  // 2. Auth - Login
  it('/auth/login (POST) - Deve realizar o login do Aluno', async () => {
    const email = `login_${Date.now()}@email.com`;

    await request(app.getHttpServer())
      .post('/users')
      .set('idempotency-key', `key-user-login-${Date.now()}`)
      .send({ name: 'Usuario Login', email, password: '123' });

    return request(app.getHttpServer())
      .post('/auth/login')
      .set('idempotency-key', `key-auth-${Date.now()}`)
      .send({ email, password: '123' })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('access_token');
      });
  });

  // 3. MongoDB - Curso
  it('/courses (POST) - Deve criar um Curso no MongoDB', () => {
    return request(app.getHttpServer())
      .post('/courses')
      .set('idempotency-key', `key-course-${Date.now()}`)
      .send({
        title: 'Curso de NestJS E2E',
        description: 'Testando fluxo MongoDB',
        instructorId: createdStudentId,
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('_id');
        createdCourseId = res.body._id;
      });
  });

  // 4. Integração MongoDB + Postgres - Matrícula
  it('/enrollments (POST) - Deve matricular o aluno no curso', () => {
    return request(app.getHttpServer())
      .post('/enrollments')
      .set('idempotency-key', `key-enrollment-${Date.now()}`)
      .send({
        studentId: createdStudentId,
        courseId: createdCourseId,
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('_id');
        expect(res.body.studentId).toBe(createdStudentId);
      });
  });
});
