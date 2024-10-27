"use client";

import { HttpLink, split, gql, from } from "@apollo/client";
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { getMainDefinition } from "@apollo/client/utilities";
import { createClient } from 'graphql-ws'
import {
  ApolloNextAppProvider,
  ApolloClient,
  InMemoryCache,
} from "@apollo/experimental-nextjs-app-support";
import React from 'react';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

interface RefreshResponse {
  refreshTokens: {
    access_token: string;
  }
}

interface PendingRequest {
  (token: string): void;
}

const REFRESH_TOKEN = gql`
  mutation RefreshToken {
    refreshAccessToken {
      access_token
    }
  }
`;


// Separate refresh client to avoid circular dependency
const createRefreshClient = () => new ApolloClient({
  link: new HttpLink({
    uri: 'http://localhost:3000/graphql',
    credentials: 'include',
  }),
  cache: new InMemoryCache(),
});

const refreshToken = async () => {
  const refreshClient = createRefreshClient();
  try {
    const { data } = await refreshClient.mutate<RefreshResponse>({
      mutation: REFRESH_TOKEN
    });
    return data?.refreshTokens.access_token;
  } catch (error) {
    throw error;
  } finally {
    refreshClient.stop();
  }
};

function makeClient() {
  const httpLink = new HttpLink({
    uri: "http://localhost:3000/graphql",
    credentials: 'include',
  });

  const wsLink = new GraphQLWsLink(createClient({
    url: 'ws://localhost:3000/graphql',
  }));

  const authLink = setContext((_, { headers }) => {
    const token = localStorage.getItem('access_token')
    return {
      headers: {
        ...headers,
        Authorization: token ? `Bearer ${token}` : "",
      }
    }
  })

  let isRefreshing = false;
  let pendingRequests: PendingRequest[] = [];

  const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
      if (graphQLErrors) {
        for (const err of graphQLErrors) {
          switch (err.extensions?.code) {
            case 'UNAUTHENTICATED':
              if (!isRefreshing) {
                refreshToken().then((newToken) => {
                  if (newToken) {
                    localStorage.setItem('access_token', newToken);
                    pendingRequests.forEach(callback => callback(newToken));
                  } else {
                    throw new Error('No token received')
                  }
                }).catch((error) => {
                    console.error('Token refresh failed:', error);
                    localStorage.removeItem('access_token');
                    pendingRequests = [];
                    window.location.href = '/';
                }).finally(() => {
                    console.log("success")
                    isRefreshing = false;
                })
              }

              return new Promise(resolve => {
                pendingRequests.push((token: string) => {
                  operation.setContext({
                    headers: {
                      ...operation.getContext().headers,
                      authorization: `Bearer ${token}`
                    }
                  })
                  resolve(forward(operation))
                })
              })
          }
        }
      }
  })

  const splitLink = split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === 'OperationDefinition' &&
        definition.operation === 'subscription'
      );
    },
    wsLink,
    httpLink,
  );

  const link = from([errorLink, authLink, splitLink]);

  return new ApolloClient({
    cache: new InMemoryCache(),
    link: link,
    defaultOptions: {
      query: {
        fetchPolicy: 'network-only',
      },
      mutate: {
        fetchPolicy: 'no-cache',
      },
      watchQuery: {
        fetchPolicy: 'network-only',
      }
    },
  });
}

export function ApolloWrapper({ children }: React.PropsWithChildren) {
  return (
    <ApolloNextAppProvider makeClient={makeClient}>
      {children}
    </ApolloNextAppProvider>
  );
}