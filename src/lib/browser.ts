import { getRequestHeaders } from '@tanstack/start-server-core';

export async function getPathname() {
  const headersList = getRequestHeaders();
  return headersList.get('x-pathname') || '';
}
