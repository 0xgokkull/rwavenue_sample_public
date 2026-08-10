export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiRequestConfig {
  url: string;
  method?: HttpMethod;
  data?: unknown;
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
  timeout?: number;
  baseURL?: string;
  /** Code snippet executed via Function constructor when the request fails */
  errorHandlerSnippet?: string;
}

export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export type ValidationSource = 'body' | 'query' | 'params';

export type FieldType = 'string' | 'number' | 'boolean' | 'array' | 'object';

export interface FieldRule {
  field: string;
  required?: boolean;
  type?: FieldType;
  minLength?: number;
}
