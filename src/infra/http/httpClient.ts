export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '/api';

const DEFAULT_MESSAGES: Record<number, string> = {
  400: 'Dados inválidos. Revise as informações e tente novamente.',
  401: 'Sessão expirada. Faça login novamente.',
  404: 'Registro não encontrado.',
  500: 'Erro interno no servidor. Tente novamente em instantes.',
  503: 'Serviço temporariamente indisponível. Tente novamente em instantes.',
};

async function parseError(response: Response): Promise<ApiError> {
  const body = (await response.json().catch(() => null)) as {
    message?: string;
    code?: string;
  } | null;
  const message =
    body?.message ?? DEFAULT_MESSAGES[response.status] ?? 'Não foi possível concluir a operação.';
  return new ApiError(message, response.status, body?.code);
}

async function request(path: string, init: RequestInit): Promise<Response> {
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, init);
  } catch {
    throw new ApiError(
      'Não foi possível conectar ao servidor. Verifique sua conexão.',
      0,
      'NETWORK_ERROR',
    );
  }
  if (!response.ok) throw await parseError(response);
  return response;
}

function body(payload: unknown): Pick<RequestInit, 'body' | 'headers'> {
  if (payload instanceof FormData) return { body: payload };
  return { body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } };
}

export const httpClient = {
  async get<T>(path: string, signal?: AbortSignal): Promise<T> {
    const response = await request(path, { method: 'GET', signal });
    return response.json() as Promise<T>;
  },
  async post<T>(path: string, payload?: unknown): Promise<T> {
    const response = await request(path, { method: 'POST', ...body(payload) });
    return response.json() as Promise<T>;
  },
  async blob(path: string): Promise<Blob> {
    const response = await request(path, { method: 'GET' });
    return response.blob();
  },
};

export type HttpClient = typeof httpClient;
