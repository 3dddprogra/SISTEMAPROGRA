import { ApiResponse } from '../types';

const BASE_URL = '/api/v1';

export class ApiError extends Error {
  public code: string;
  public details?: unknown;
  public status: number;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('foodtech_token');
  const mesaToken = localStorage.getItem('foodtech_mesa_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (mesaToken) {
    headers['x-mesa-token'] = mesaToken;
  }

  const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const json: ApiResponse<T> = await response.json().catch(() => ({
    success: false,
    error: { code: 'PARSE_ERROR', message: 'Error de respuesta del servidor' },
  }));

  if (!response.ok || !json.success) {
    throw new ApiError(
      response.status,
      json.error?.code || 'UNKNOWN_ERROR',
      json.error?.message || `Error en solicitud HTTP ${response.status}`,
      json.error?.details
    );
  }

  return json.data as T;
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint, { method: 'GET' }),
  post: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
};
