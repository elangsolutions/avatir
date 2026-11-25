import { SetMetadata } from '@nestjs/common';
import { IntegrationScope } from './integration.scopes';

export const INTEGRATION_SCOPES_KEY = 'integrationScopes';

export const RequireScopes = (...scopes: IntegrationScope[]) =>
  SetMetadata(INTEGRATION_SCOPES_KEY, scopes);
