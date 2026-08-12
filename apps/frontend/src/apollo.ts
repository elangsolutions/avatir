import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const graphQLEndpoint = import.meta.env.VITE_GRAPHQL_URL ?? 'http://localhost:3601/graphql';

export const apolloClient = new ApolloClient({
  link: new HttpLink({
    uri: graphQLEndpoint,
  }),
  cache: new InMemoryCache(),
});
