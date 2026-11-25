import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { createHash } from 'node:crypto';
import {
  AgreementStatus,
  IntegrationClient,
  PolicyKind,
  Prisma,
} from '../../generated/prisma';
import { UserRole } from '../auth/roles';
import { PrismaService } from '../prisma/prisma.service';
import { formatCuit, normalizeCuit } from './ar-formats';
import { CreatePolicyRequestDto } from './create-policy-request.dto';

const KIND_LABELS: Record<PolicyKind, string> = {
  [PolicyKind.OFERTA]: 'Oferta',
  [PolicyKind.ADJUDICACION]: 'Adjudicación',
};

type PolicyRequestWithAgreement = Prisma.PolicyRequestGetPayload<{
  include: { agreement: true };
}>;

@Injectable()
export class PolicyRequestsService {
  private readonly logger = new Logger(PolicyRequestsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(
    dto: CreatePolicyRequestDto,
    client: IntegrationClient,
    requestedKey?: string,
  ) {
    const idempotencyKey = requestedKey ?? dto.idempotencyKey ?? this.naturalKey(dto);

    const existing = await this.findByIdempotencyKey(client.id, idempotencyKey);
    if (existing) {
      return { duplicate: true as const, record: existing };
    }

    const ownerId = await this.resolveOwnerId(dto.applicant.ownerEmail);

    try {
      const record = await this.prisma.$transaction(async (tx) => {
        const agreement = await tx.agreement.create({
          data: {
            title: this.buildTitle(dto),
            clientName: dto.applicant.name,
            amount: new Prisma.Decimal(dto.policyAmount),
            currency: dto.currency ?? 'ARS',
            status: AgreementStatus.draft,
            notes: dto.tender.purpose,
            ownerId,
            agentId: client.agentId,
          },
        });

        return tx.policyRequest.create({
          data: {
            agreementId: agreement.id,
            integrationClientId: client.id,
            idempotencyKey,
            policyKind: dto.policyKind,
            policyFormat: dto.policyFormat,
            policyAmount: new Prisma.Decimal(dto.policyAmount),
            currency: dto.currency ?? 'ARS',
            applicantName: dto.applicant.name,
            applicantTaxId: formatCuit(dto.applicant.taxId),
            applicantAddress: dto.applicant.address,
            beneficiaryName: dto.beneficiary.name,
            beneficiaryTaxId: formatCuit(dto.beneficiary.taxId),
            beneficiaryAddress: dto.beneficiary.address,
            processCode: dto.tender.processCode,
            fileNumber: dto.tender.fileNumber,
            bidOpeningAt: dto.tender.bidOpeningAt,
            purpose: dto.tender.purpose,
            purchaseOrder: dto.tender.purchaseOrder,
            billingPeriod: dto.tender.billingPeriod,
            payload: JSON.parse(JSON.stringify(dto)) as Prisma.InputJsonValue,
          },
          include: { agreement: true },
        });
      });

      this.logger.log(
        `Policy request ${record.id} created by "${client.name}" for process ${record.processCode}`,
      );

      return { duplicate: false as const, record };
    } catch (error) {
      // A concurrent request with the same idempotency key won the race.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const record = await this.findByIdempotencyKey(client.id, idempotencyKey);
        if (record) {
          return { duplicate: true as const, record };
        }
      }

      throw error;
    }
  }

  toResponse(result: { duplicate: boolean; record: PolicyRequestWithAgreement }) {
    const { record } = result;

    return {
      policyRequestId: record.id,
      status: record.status,
      duplicate: result.duplicate,
      idempotencyKey: record.idempotencyKey,
      policy: {
        kind: record.policyKind,
        format: record.policyFormat,
        amount: Number(record.policyAmount),
        currency: record.currency,
        processCode: record.processCode,
        bidOpeningAt: record.bidOpeningAt,
      },
      agreement: {
        id: record.agreement.id,
        title: record.agreement.title,
        clientName: record.agreement.clientName,
        amount: Number(record.agreement.amount),
        currency: record.agreement.currency,
        status: record.agreement.status,
        ownerId: record.agreement.ownerId,
        agentId: record.agreement.agentId,
        createdAt: record.agreement.createdAt,
      },
      createdAt: record.createdAt,
    };
  }

  private findByIdempotencyKey(integrationClientId: string, idempotencyKey: string) {
    return this.prisma.policyRequest.findUnique({
      where: {
        integrationClientId_idempotencyKey: { integrationClientId, idempotencyKey },
      },
      include: { agreement: true },
    });
  }

  private async resolveOwnerId(ownerEmail?: string) {
    if (!ownerEmail) {
      return null;
    }

    const owner = await this.prisma.user.findUnique({ where: { email: ownerEmail } });
    if (!owner || owner.role !== UserRole.CLIENT) {
      throw new BadRequestException(
        'applicant.ownerEmail must match an existing CLIENT user',
      );
    }

    return owner.id;
  }

  private buildTitle(dto: CreatePolicyRequestDto) {
    return `Caución de ${KIND_LABELS[dto.policyKind]} · ${dto.tender.processCode}`;
  }

  /**
   * Without a client-supplied key, the tender itself identifies the submission so
   * a retried request cannot create a second agreement for the same bond.
   */
  private naturalKey(dto: CreatePolicyRequestDto) {
    const parts = [
      dto.tender.processCode,
      dto.policyKind,
      normalizeCuit(dto.applicant.taxId),
      dto.policyAmount.toFixed(2),
    ];

    return `natural:${createHash('sha256').update(parts.join('|')).digest('hex').slice(0, 32)}`;
  }
}
