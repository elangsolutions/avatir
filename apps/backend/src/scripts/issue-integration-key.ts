import 'reflect-metadata';

import { join } from 'node:path';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { UserRole } from '../../generated/prisma';
import { ApiKeysService } from '../integration/api-keys.service';
import { IntegrationModule } from '../integration/integration.module';
import { INTEGRATION_SCOPES, isIntegrationScope } from '../integration/integration.scopes';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        join(__dirname, '..', '..', '.env.local'),
        join(__dirname, '..', '..', '.env'),
        join(process.cwd(), '.env.local'),
        join(process.cwd(), '.env'),
      ],
    }),
    PrismaModule,
    IntegrationModule,
  ],
})
class IssueKeyModule {}

/** Accepts both `--name=value` and `--name value`. */
function parseArgs(argv: string[]) {
  const args = new Map<string, string>();

  for (let index = 0; index < argv.length; index += 1) {
    const match = /^--([\w-]+)(?:=(.*))?$/.exec(argv[index]);
    if (!match) {
      continue;
    }

    if (match[2] !== undefined) {
      args.set(match[1], match[2]);
      continue;
    }

    const next = argv[index + 1];
    if (next !== undefined && !next.startsWith('--')) {
      args.set(match[1], next);
      index += 1;
    } else {
      args.set(match[1], 'true');
    }
  }

  return args;
}

const USAGE = `Usage: node dist/scripts/issue-integration-key.js --name "Broker name" [options]

Options:
  --name <name>            Label for the integration client (required)
  --scopes <a,b>           Comma separated scopes (default: agreements:write)
  --agent-email <email>    AGENT user the created agreements are attributed to
  --expires-in-days <n>    Expire the key after n days (default: never)

Available scopes: ${INTEGRATION_SCOPES.join(', ')}`;

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const name = args.get('name');

  if (!name || name === 'true') {
    console.error(USAGE);
    process.exitCode = 1;
    return;
  }

  const scopes = (args.get('scopes') ?? 'agreements:write')
    .split(',')
    .map((scope) => scope.trim())
    .filter(Boolean);

  const invalid = scopes.filter((scope) => !isIntegrationScope(scope));
  if (invalid.length) {
    console.error(`Unknown scope(s): ${invalid.join(', ')}\n\n${USAGE}`);
    process.exitCode = 1;
    return;
  }

  const expiresInDays = args.get('expires-in-days');
  const expiresAt = expiresInDays
    ? new Date(Date.now() + Number(expiresInDays) * 24 * 60 * 60 * 1000)
    : null;

  if (expiresAt && Number.isNaN(expiresAt.getTime())) {
    console.error(`--expires-in-days must be a number\n\n${USAGE}`);
    process.exitCode = 1;
    return;
  }

  const app = await NestFactory.createApplicationContext(IssueKeyModule, {
    logger: ['error', 'warn'],
  });

  try {
    const agentEmail = args.get('agent-email');
    let agentId: string | null = null;

    if (agentEmail) {
      const prisma = app.get(PrismaService);
      const agent = await prisma.user.findUnique({
        where: { email: agentEmail.trim().toLowerCase() },
      });

      if (!agent || agent.role !== UserRole.AGENT) {
        throw new Error(`No AGENT user found for ${agentEmail}`);
      }

      agentId = agent.id;
    }

    const issued = await app.get(ApiKeysService).issue({
      name,
      scopes: scopes.filter(isIntegrationScope),
      agentId,
      expiresAt,
    });

    console.log('');
    console.log(`Integration client : ${issued.client.name} (${issued.client.id})`);
    console.log(`Scopes             : ${issued.client.scopes.join(', ')}`);
    console.log(`Attributed agent   : ${agentId ?? 'none'}`);
    console.log(`Expires            : ${expiresAt?.toISOString() ?? 'never'}`);
    console.log('');
    console.log(`X-Api-Key: ${issued.key}`);
    console.log('');
    console.log('Store this key now. Only its hash is persisted, so it cannot be shown again.');
  } finally {
    await app.close();
  }
}

main().catch((error: unknown) => {
  new Logger('issue-integration-key').error(String(error));
  process.exitCode = 1;
});
