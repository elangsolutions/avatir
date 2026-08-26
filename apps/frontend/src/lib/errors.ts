import { CombinedGraphQLErrors } from '@apollo/client';

export function getErrorMessage(error: unknown, fallback: string) {
  if (CombinedGraphQLErrors.is(error)) {
    return error.errors[0]?.message ?? fallback;
  }

  if (error instanceof Error && error.message) {
    return error.message.replace(/^\[GraphQL\]\s*/i, '');
  }

  return fallback;
}
