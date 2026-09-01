import { ApolloLink, HttpLink, ApolloClient, InMemoryCache } from '@apollo/client';
import { readToken } from './auth/storage';

const graphQLEndpoint = import.meta.env.VITE_GRAPHQL_URL ?? 'http://localhost:5001/graphql';

const authLink = new ApolloLink((operation, forward) => {
  const token = readToken();
  operation.setContext((previous: { headers?: Record<string, string> }) => ({
    headers: {
      ...previous.headers,
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  }));

  return forward(operation);
});

export const apolloClient = new ApolloClient({
  link: ApolloLink.from([
    authLink,
    new HttpLink({
      uri: graphQLEndpoint,
    }),
  ]),
  cache: new InMemoryCache(),
});
