import { Injectable, NotFoundException } from '@nestjs/common';
import { AgreementStatus, Prisma } from '../../generated/prisma';
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
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      ...agreement,
      amount: Number(agreement.amount),
    };
  }

  findAll() {
    return this.prisma.agreement.findMany({ orderBy: { createdAt: 'desc' } }).then((agreements) =>
      agreements.map((agreement) => this.toAgreement(agreement)),
    );
  }

  async findOne(id: string) {
    const agreement = await this.prisma.agreement.findUnique({ where: { id } });
    if (!agreement) {
      throw new NotFoundException(`Agreement ${id} not found`);
    }
    return this.toAgreement(agreement);
  }

  create(input: CreateAgreementInput) {
    return this.prisma.agreement.create({
      data: {
        title: input.title,
        clientName: input.clientName,
        amount: new Prisma.Decimal(input.amount),
        currency: input.currency ?? 'USD',
        status: (input.status as AgreementStatus) ?? AgreementStatus.draft,
        notes: input.notes,
        ownerId: input.ownerId,
      },
    }).then((agreement) => this.toAgreement(agreement));
  }

  async update(id: string, input: UpdateAgreementInput) {
    await this.findOne(id);

    return this.prisma.agreement.update({
      where: { id },
      data: {
        title: input.title,
        clientName: input.clientName,
        amount:
          typeof input.amount === 'number'
            ? new Prisma.Decimal(input.amount)
            : undefined,
        currency: input.currency,
        status: input.status as AgreementStatus | undefined,
        notes: input.notes,
        ownerId: input.ownerId,
      },
    }).then((agreement) => this.toAgreement(agreement));
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.agreement.delete({ where: { id } });
    return true;
  }
}
