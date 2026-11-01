import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

export interface Requester {
  id: string;
  role: string;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const userExists = await this.prisma.client.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (userExists) {
      throw new ConflictException('E-mail já cadastrado');
    }

    return this.prisma.client.user.create({
      data: {
        name: createUserDto.name,
        email: createUserDto.email,
        password: await bcrypt.hash(createUserDto.password, 12),
        role: Role.STUDENT,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async findAll() {
    return this.prisma.client.user.findMany({
      select: { id: true, name: true, email: true, role: true },
    });
  }

  async findOne(id: string, requester: Requester) {
    this.assertCanAccessUser(id, requester);
    const user = await this.prisma.client.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto, requester: Requester) {
    this.assertCanAccessUser(id, requester);
    return this.prisma.client.user.update({
      where: { id },
      data: updateUserDto,
      select: { id: true, name: true, email: true, role: true },
    });
  }

  async remove(id: string, requester: Requester) {
    this.assertCanAccessUser(id, requester);
    await this.prisma.client.user.delete({ where: { id } });
    return { message: 'Usuário removido com sucesso' };
  }

  async migrateLegacyPassword(userId: string, password: string) {
    await this.prisma.client.user.update({
      where: { id: userId },
      data: { password: await bcrypt.hash(password, 12) },
    });
  }

  private assertCanAccessUser(targetId: string, requester: Requester) {
    if (requester.id !== targetId && requester.role !== Role.ADMIN) {
      throw new ForbiddenException(
        'Você não tem permissão para acessar este usuário',
      );
    }
  }
}
