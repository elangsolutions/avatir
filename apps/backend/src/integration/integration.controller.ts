import {
  Body,
  Controller,
  Headers,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { IntegrationClient } from '../../generated/prisma';
import { Public } from '../auth/public.decorator';
import { ApiKeyGuard } from './api-key.guard';
import { CreatePolicyRequestDto } from './create-policy-request.dto';
import { CurrentIntegrationClient } from './integration-client.decorator';
import { PolicyRequestsService } from './policy-requests.service';
import { RequireScopes } from './scopes.decorator';

type HttpResponse = { status: (code: number) => unknown };

// `@Public` opts out of the global JWT guard; ApiKeyGuard authenticates instead.
@Public()
@UseGuards(ApiKeyGuard)
@Controller('integration/v1')
export class IntegrationController {
  constructor(private readonly policyRequests: PolicyRequestsService) {}

  @RequireScopes('agreements:write')
  @Post('agreements')
  async createAgreement(
    @Body() dto: CreatePolicyRequestDto,
    @CurrentIntegrationClient() client: IntegrationClient,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Res({ passthrough: true }) response: HttpResponse,
  ) {
    const result = await this.policyRequests.create(dto, client, idempotencyKey);
    response.status(result.duplicate ? HttpStatus.OK : HttpStatus.CREATED);

    return this.policyRequests.toResponse(result);
  }
}
