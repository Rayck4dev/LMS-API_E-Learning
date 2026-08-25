import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

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
      data: createUserDto as any,
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

  async findOne(id: string) {
    const user = await this.prisma.client.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    return this.prisma.client.user.update({
      where: { id },
      data: updateUserDto as any,
      select: { id: true, name: true, email: true, role: true },
    });
  }

  async remove(id: string) {
    return this.prisma.client.user.delete({ where: { id } });
  }
}
