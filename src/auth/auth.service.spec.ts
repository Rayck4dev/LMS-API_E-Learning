import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';

describe('AuthService', () => {
  let service: AuthService;

  const mockPrismaService = {
    client: {
      user: {
        findUnique: jest.fn(),
      },
    },
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mocked_jwt_token'),
  };

  const mockUsersService = {
    migrateLegacyPassword: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('deve autenticar o usuário e retornar o token JWT', async () => {
    mockPrismaService.client.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'test@email.com',
      password: '123',
      role: 'STUDENT',
    });

    const result = await service.login({ email: 'test@email.com', password: '123' });

    expect(result).toHaveProperty('access_token', 'mocked_jwt_token');
    expect(result.user.email).toBe('test@email.com');
  });

  it('deve lançar UnauthorizedException se a senha for incorreta', async () => {
    mockPrismaService.client.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'test@email.com',
      password: '123',
    });

    await expect(
      service.login({ email: 'test@email.com', password: 'wrong' }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
