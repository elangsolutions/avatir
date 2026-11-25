export const INTEGRATION_SCOPES = ['agreements:write'] as const;

export type IntegrationScope = (typeof INTEGRATION_SCOPES)[number];

export function isIntegrationScope(value: string): value is IntegrationScope {
  return (INTEGRATION_SCOPES as readonly string[]).includes(value);
}
