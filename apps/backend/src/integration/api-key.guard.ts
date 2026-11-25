import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ApiKeysService } from './api-keys.service';
import { IntegrationScope } from './integration.scopes';
import { INTEGRATION_SCOPES_KEY } from './scopes.decorator';
import { RateLimiterService } from './rate-limiter.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private readonly apiKeys: ApiKeysService,
    private readonly rateLimiter: RateLimiterService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const rawKey = this.extractKey(request.headers);
    if (!rawKey) {
      throw new UnauthorizedException('Provide an API key in the X-Api-Key header');
    }

    const client = await this.apiKeys.authenticate(rawKey);

    const quota = this.rateLimiter.consume(client.id);
    response.setHeader?.('X-RateLimit-Remaining', String(quota.remaining));
    if (!quota.allowed) {
      response.setHeader?.('Retry-After', String(quota.retryAfter));
      throw new HttpException(
        'Rate limit exceeded for this API key',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const required = this.reflector.getAllAndOverride<IntegrationScope[]>(
      INTEGRATION_SCOPES_KEY,
      [context.getHandler(), context.getClass()],
    );

    const missing = (required ?? []).filter((scope) => !client.scopes.includes(scope));
    if (missing.length) {
      throw new ForbiddenException(`API key is missing scope: ${missing.join(', ')}`);
    }

    request.integrationClient = client;
    return true;
  }

  private extractKey(headers: Record<string, string | string[] | undefined> = {}) {
    const apiKeyHeader = headers['x-api-key'];
    const fromHeader = Array.isArray(apiKeyHeader) ? apiKeyHeader[0] : apiKeyHeader;
    if (fromHeader) {
      return fromHeader;
    }

    const authorization = headers.authorization;
    const value = Array.isArray(authorization) ? authorization[0] : authorization;
    const bearer = value?.startsWith('Bearer ') ? value.slice(7).trim() : undefined;

    return bearer?.startsWith('avtr_') ? bearer : undefined;
  }
}
