import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma';
import { UserRole } from '../auth/roles';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserInput, UpdateUserInput } from './users.types';
import bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
  }

  findClients() {
    return this.prisma.user.findMany({
      where: { role: UserRole.CLIENT },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }
    return user;
  }

  async create(input: CreateUserInput, options?: { emailVerified?: boolean }) {
    try {
      return await this.prisma.user.create({
        data: {
          name: input.name.trim(),
          email: input.email.trim().toLowerCase(),
          role: input.role ?? UserRole.CLIENT,
          avatarUrl: input.avatarUrl,
          passwordHash: await bcrypt.hash(input.password, 10),
          emailVerifiedAt: options?.emailVerified === false ? null : new Date(),
        },
      });
    } catch (error) {
      this.rethrowUniqueEmail(error);
      throw error;
    }
  }

  async update(id: string, input: UpdateUserInput) {
    await this.findOne(id);

    try {
      return await this.prisma.user.update({
        where: { id },
        data: {
          name: input.name?.trim(),
          email: input.email?.trim().toLowerCase(),
          role: input.role,
          avatarUrl: input.avatarUrl,
          passwordHash: input.password
            ? await bcrypt.hash(input.password, 10)
            : undefined,
        },
      });
    } catch (error) {
      this.rethrowUniqueEmail(error);
      throw error;
    }
  }

  async remove(id: string, actorId: string) {
    if (id === actorId) {
      throw new ForbiddenException('You cannot delete your own account');
    }

    await this.findOne(id);
    await this.prisma.user.delete({ where: { id } });
    return true;
  }

  private rethrowUniqueEmail(error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException('A user with this email already exists');
    }
  }
}
