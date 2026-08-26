import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AgreementStatus, Prisma } from '../../generated/prisma';
import { AuthenticatedUser } from '../auth/auth.types';
import { UserRole } from '../auth/roles';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAgreementInput, UpdateAgreementInput } from './agreements.types';

@Injectable()
export class AgreementsService {
  constructor(private readonly prisma: PrismaService) {}

  private toAgreement(agreement: {
    id: string;
    title: string;
    clientName: string;
    amount: Prisma.Decimal;
    currency: string;
    status: AgreementStatus;
    notes: string | null;
    ownerId: string | null;
    agentId: string | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      ...agreement,
      amount: Number(agreement.amount),
    };
  }

  findAll(actor: AuthenticatedUser) {
    return this.prisma.agreement
      .findMany({
        where: this.visibilityWhere(actor),
        orderBy: { createdAt: 'desc' },
      })
      .then((agreements) => agreements.map((agreement) => this.toAgreement(agreement)));
  }

  async findOne(id: string, actor: AuthenticatedUser) {
    const agreement = await this.prisma.agreement.findFirst({
      where: { id, ...this.visibilityWhere(actor) },
    });
    if (!agreement) {
      throw new NotFoundException(`Agreement ${id} not found`);
    }
    return this.toAgreement(agreement);
  }

  async create(input: CreateAgreementInput, actor: AuthenticatedUser) {
    this.assertCanWrite(actor);

    const owner = await this.resolveClient(input.ownerId, input.clientName);

    return this.prisma.agreement
      .create({
        data: {
          title: input.title,
          clientName: owner.clientName,
          amount: new Prisma.Decimal(input.amount),
          currency: input.currency ?? 'USD',
          status: (input.status as AgreementStatus) ?? AgreementStatus.draft,
          notes: input.notes,
          ownerId: owner.ownerId,
          agentId: actor.role === UserRole.AGENT ? actor.id : owner.agentId,
        },
      })
      .then((agreement) => this.toAgreement(agreement));
  }

  async update(id: string, input: UpdateAgreementInput, actor: AuthenticatedUser) {
    this.assertCanWrite(actor);
    const existing = await this.findOne(id, actor);

    if (actor.role === UserRole.AGENT && existing.agentId && existing.agentId !== actor.id) {
      throw new ForbiddenException('Agents can only update agreements they created');
    }

    const owner = await this.resolveClient(
      input.ownerId ?? existing.ownerId,
      input.clientName ?? existing.clientName,
    );

    return this.prisma.agreement
      .update({
        where: { id },
        data: {
          title: input.title,
          clientName: input.clientName ?? owner.clientName,
          amount:
            typeof input.amount === 'number' ? new Prisma.Decimal(input.amount) : undefined,
          currency: input.currency,
          status: input.status as AgreementStatus | undefined,
          notes: input.notes,
          ownerId: input.ownerId === undefined ? undefined : owner.ownerId,
        },
      })
      .then((agreement) => this.toAgreement(agreement));
  }

  async remove(id: string, actor: AuthenticatedUser) {
    if (actor.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can delete agreements');
    }

    await this.findOne(id, actor);
    await this.prisma.agreement.delete({ where: { id } });
    return true;
  }

  private visibilityWhere(actor: AuthenticatedUser): Prisma.AgreementWhereInput {
    if (actor.role === UserRole.CLIENT) {
      return { ownerId: actor.id };
    }

    return {};
  }

  private assertCanWrite(actor: AuthenticatedUser) {
    if (actor.role !== UserRole.ADMIN && actor.role !== UserRole.AGENT) {
      throw new ForbiddenException('You cannot create or update agreements');
    }
  }

  private async resolveClient(ownerId: string | null | undefined, clientName: string) {
    if (!ownerId) {
      return { ownerId: null, clientName, agentId: undefined };
    }

    const owner = await this.prisma.user.findUnique({ where: { id: ownerId } });
    if (!owner || owner.role !== UserRole.CLIENT) {
      throw new BadRequestException('Agreements must be assigned to a CLIENT user');
    }

    return {
      ownerId: owner.id,
      clientName: clientName.trim() || owner.name,
      agentId: undefined as string | undefined,
    };
  }
}
