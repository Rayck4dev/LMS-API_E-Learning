import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  const reflector = {
    getAllAndOverride: jest.fn(),
  };
  let guard: RolesGuard;

  beforeEach(() => {
    reflector.getAllAndOverride.mockReset();
    guard = new RolesGuard(reflector as unknown as Reflector);
  });

  it('allows a user whose role is required', () => {
    reflector.getAllAndOverride.mockReturnValue(['INSTRUCTOR', 'ADMIN']);

    expect(guard.canActivate(createContext({ role: 'INSTRUCTOR' }))).toBe(true);
  });

  it('explains which roles are required when access is denied', () => {
    reflector.getAllAndOverride.mockReturnValue(['INSTRUCTOR', 'ADMIN']);

    expect(() => guard.canActivate(createContext({ role: 'STUDENT' }))).toThrow(
      new ForbiddenException(
        'Acesso negado: esta operação requer um dos seguintes perfis: INSTRUCTOR, ADMIN.',
      ),
    );
  });
});

function createContext(user: { role: string }): ExecutionContext {
  return {
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  } as unknown as ExecutionContext;
}
