import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserInput, UpdateUserInput } from './users.types';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }
    return user;
  }

  create(input: CreateUserInput) {
    return this.prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        role: input.role ?? 'operator',
        avatarUrl: input.avatarUrl,
      },
    });
  }

  async update(id: string, input: UpdateUserInput) {
    await this.findOne(id);

    return this.prisma.user.update({
      where: { id },
      data: {
        name: input.name,
        email: input.email,
        role: input.role,
        avatarUrl: input.avatarUrl,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.user.delete({ where: { id } });
    return true;
  }
}
