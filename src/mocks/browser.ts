import { getResponse } from 'msw';
import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

const worker = setupWorker(...handlers);

/**
 * Fallback for environments without Service Worker support (Firefox private tabs,
 * webviews, corporate policies): intercepts `fetch` directly with the same handlers.
 */
function interceptFetch() {
  const originalFetch = window.fetch.bind(window);
  window.fetch = async (input, init) => {
    const request = new Request(input, init);
    if (new URL(request.url).pathname.startsWith('/api/')) {
      const response = await getResponse(handlers, request);
      if (response) return response;
    }
    return originalFetch(input, init);
  };
}

export async function startMockApi() {
  try {
    await worker.start({ onUnhandledFrame: 'bypass', quiet: true });
  } catch (error) {
    console.warn('[mock] Service Worker unavailable, falling back to fetch interception.', error);
    interceptFetch();
  }
}
