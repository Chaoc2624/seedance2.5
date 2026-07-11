import { createRouter } from '@tanstack/react-router';

import { NotFoundPage } from '@/components/blocks/common/not-found';

import { routeTree } from './routeTree.gen';

export function getRouter() {
  const router = createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: false,
    defaultNotFoundComponent: NotFoundPage,
  });

  return router;
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
