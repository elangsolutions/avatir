import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { IntegrationClient } from '../../generated/prisma';

export const CurrentIntegrationClient = createParamDecorator(
  (_data: unknown, context: ExecutionContext): IntegrationClient =>
    context.switchToHttp().getRequest().integrationClient,
);
