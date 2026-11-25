import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { IntegrationClient } from '../../generated/prisma';
import { PrismaService } from '../prisma/prisma.service';
import { IntegrationScope } from './integration.scopes';

const KEY_NAMESPACE = 'avtr';
const PREFIX_BYTES = 8;
const SECRET_BYTES = 32;

/** Compared against when no client matches, so lookups take a similar amount of time either way. */
const DECOY_HASH = createHash('sha256').update(randomBytes(SECRET_BYTES)).digest('hex');

const LAST_USED_THROTTLE_MS = 60_000;

export type IssuedApiKey = {
  client: IntegrationClient;
  /** Returned once at creation time and never recoverable afterwards. */
  key: string;
};

@Injectable()
export class ApiKeysService {
  private readonly logger = new Logger(ApiKeysService.name);

  constructor(private readonly prisma: PrismaService) {}

  async issue(input: {
    name: string;
    scopes: IntegrationScope[];
    agentId?: string | null;
    expiresAt?: Date | null;
  }): Promise<IssuedApiKey> {
    const prefix = randomBytes(PREFIX_BYTES).toString('hex');
    const secret = randomBytes(SECRET_BYTES).toString('base64url');

    const client = await this.prisma.integrationClient.create({
      data: {
        name: input.name.trim(),
        keyPrefix: prefix,
        keyHash: this.hashSecret(secret),
        scopes: input.scopes,
        agentId: input.agentId ?? null,
        expiresAt: input.expiresAt ?? null,
      },
    });

    return { client, key: `${KEY_NAMESPACE}_${prefix}.${secret}` };
  }

  async revoke(id: string) {
    return this.prisma.integrationClient.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  }

  async authenticate(rawKey: string): Promise<IntegrationClient> {
    const parsed = this.parseKey(rawKey);
    const client = parsed
      ? await this.prisma.integrationClient.findUnique({
          where: { keyPrefix: parsed.prefix },
        })
      : null;

    const matches = this.secretMatches(parsed?.secret, client?.keyHash ?? DECOY_HASH);
    if (!parsed || !client || !matches) {
      throw new UnauthorizedException('Invalid API key');
    }

    if (client.revokedAt) {
      throw new UnauthorizedException('This API key has been revoked');
    }

    if (client.expiresAt && client.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedException('This API key has expired');
    }

    this.touch(client);
    return client;
  }

  private parseKey(rawKey: string) {
    const match = /^avtr_([0-9a-f]{16})\.([A-Za-z0-9_-]{20,})$/.exec(rawKey.trim());
    if (!match) {
      return null;
    }

    return { prefix: match[1], secret: match[2] };
  }

  private secretMatches(secret: string | undefined, expectedHash: string) {
    const candidate = Buffer.from(
      secret ? this.hashSecret(secret) : DECOY_HASH,
      'hex',
    );
    const expected = Buffer.from(expectedHash, 'hex');

    return (
      candidate.length === expected.length && timingSafeEqual(candidate, expected)
    );
  }

  private touch(client: IntegrationClient) {
    const lastUsedAt = client.lastUsedAt?.getTime() ?? 0;
    if (Date.now() - lastUsedAt < LAST_USED_THROTTLE_MS) {
      return;
    }

    void this.prisma.integrationClient
      .update({ where: { id: client.id }, data: { lastUsedAt: new Date() } })
      .catch((error: unknown) => {
        this.logger.warn(`Could not record API key usage: ${String(error)}`);
      });
  }

  private hashSecret(secret: string) {
    return createHash('sha256').update(secret).digest('hex');
  }
}
