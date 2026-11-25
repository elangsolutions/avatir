# AVATIR

Monorepo for the AVATIR assurance deals app.

## Apps

- `apps/backend`: NestJS + GraphQL + PostgreSQL
- `apps/frontend`: Vite + React + Chakra UI + Apollo Client

## Development

1. Install dependencies from the repository root.
2. Start Postgres locally or with Docker.
3. Run `npm run dev` to start both apps together.

## Status

The first release includes a polished mobile-first auth experience, a Google sign-in placeholder, and role-scoped `Users` and `Agreements` workspaces. Agreements provides a quote simulator and a list of saved agreements.

## Agreement quote simulator

Without insurer configuration, the simulator returns clearly labeled local example prices. These mock prices are not quotes from real insurers. To enable a live provider, configure the backend environment:

- `QUOTE_SIMULATOR_API_URL`: HTTPS URL for the quote provider endpoint.
- `QUOTE_SIMULATOR_API_TOKEN`: optional bearer token sent in the `Authorization` header.

The backend sends a `POST` request with the agreement simulation input (`policyKind`, `policyFormat`, `policyAmount`, `currency`, `applicant`, `beneficiary`, and `tender`). The provider must return JSON in this shape:

```json
{
  "quotes": [
    {
      "company": "Example insurer",
      "premium": 1234.56,
      "currency": "ARS",
      "validUntil": "2026-12-01T00:00:00.000Z"
    }
  ]
}
```

`validUntil` is optional and must be a future ISO date-time when supplied. The simulator returns at most five lowest valid quotes, only in the requested currency; malformed, expired, or incomparable entries are excluded. If a live endpoint is configured but fails or returns no usable quotes, the request fails rather than falling back to mock prices. Simulations are not saved; agents and admins can create a draft agreement from a selected quote.
