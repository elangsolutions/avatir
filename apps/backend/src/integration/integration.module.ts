import { Module } from '@nestjs/common';
import { ApiKeyGuard } from './api-key.guard';
import { ApiKeysService } from './api-keys.service';
import { IntegrationController } from './integration.controller';
import { PolicyRequestsService } from './policy-requests.service';
import { RateLimiterService } from './rate-limiter.service';

@Module({
  controllers: [IntegrationController],
  providers: [ApiKeyGuard, ApiKeysService, PolicyRequestsService, RateLimiterService],
  exports: [ApiKeysService],
})
export class IntegrationModule {}
