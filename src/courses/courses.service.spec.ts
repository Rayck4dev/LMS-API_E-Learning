import { Test, TestingModule } from '@nestjs/testing';
import { CoursesService } from './courses.service';
import { getModelToken } from '@nestjs/mongoose';
import { Course } from './schemas/course.schema';

describe('CoursesService', () => {
  let service: CoursesService;

  // Mock de classe para simular o construtor do Mongoose
  class MockCourseModel {
    constructor(private dto: any) {
      Object.assign(this, dto);
    }
    save = jest
      .fn()
      .mockImplementation(() => Promise.resolve({ id: 'course-1', ...this }));

    static find = jest.fn().mockReturnValue({
      exec: jest
        .fn()
        .mockResolvedValue([
          { title: 'NestJS Course', instructorId: 'inst-1' },
        ]),
    });
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesService,
        {
          provide: getModelToken(Course.name),
          useValue: MockCourseModel,
        },
      ],
    }).compile();

    service = module.get<CoursesService>(CoursesService);
  });

  it('deve criar um curso com sucesso', async () => {
    const dto = {
      title: 'NestJS Course',
      description: 'Curso de NestJS',
      instructorId: 'inst-1',
    };
    const result = await service.create(dto);

    expect(result).toHaveProperty('id', 'course-1');
    expect(result.title).toBe('NestJS Course');
  });

  it('deve retornar uma lista de cursos', async () => {
    const courses = await service.findAll();
    expect(courses.length).toBeGreaterThan(0);
  });
});
