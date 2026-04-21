import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import type { ReactNode } from 'react';

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

type TestQueryClientProviderProps = {
  children: ReactNode;
  client: QueryClient;
};

export function TestQueryClientProvider({ children, client }: TestQueryClientProviderProps) {
  return createElement(QueryClientProvider, { client }, children);
}
