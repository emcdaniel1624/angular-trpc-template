import { createTRPCProxyClient, httpLink } from '@trpc/client';
import superjson from 'superjson';
import type { AppRouter } from '../../server/api/trpc';

function getBaseUrl() {
  if (typeof window !== "undefined") return window.location.origin
  if (process.env['BASE_URL']) return process.env['BASE_URL']
  return `http://localhost:${process.env['PORT'] ?? 4200}`
}

export const api = createTRPCProxyClient<AppRouter>({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
      //headers() {
      //  return {
      //    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
      //  };
      //}
    }),
  ],
});
