import { getResponse } from 'msw';
import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

const worker = setupWorker(...handlers);

/**
 * Fallback para ambientes sem Service Worker (aba anônima do Firefox, webviews,
 * políticas corporativas): intercepta `fetch` diretamente com os mesmos handlers.
 */
function interceptarFetch() {
  const fetchOriginal = window.fetch.bind(window);
  window.fetch = async (input, init) => {
    const request = new Request(input, init);
    if (new URL(request.url).pathname.startsWith('/api/')) {
      const response = await getResponse(handlers, request);
      if (response) return response;
    }
    return fetchOriginal(input, init);
  };
}

export async function iniciarMockApi() {
  try {
    await worker.start({ onUnhandledFrame: 'bypass', quiet: true });
  } catch (error) {
    console.warn('[mock] Service Worker indisponível, usando interceptação de fetch.', error);
    interceptarFetch();
  }
}
