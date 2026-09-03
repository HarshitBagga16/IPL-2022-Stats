'use client';
// This file is a client component because it uses React Query, which requires client-side rendering
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

// Providers component that wraps the application with React Query's QueryClientProvider
//react query is used for data fetching and caching, and it requires a QueryClient to be provided at the top level of the application its better than using useEffect and useState for data fetching because it provides caching, background updates, and other features that make data fetching more efficient and easier to manage
export function Providers({ children }: { children: React.ReactNode }) {
  // Create a QueryClient instance with default options for queries
  const [queryClient] = useState(() => new QueryClient({
    // Set default options for queries, including stale time and retry attempts
    defaultOptions: { queries: { staleTime: 60 * 1000, retry: 2 } },
  }));
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
