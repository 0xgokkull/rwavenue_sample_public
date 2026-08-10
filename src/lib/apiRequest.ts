import axios, { AxiosError, isAxiosError } from 'axios';
import { env } from '../config/env.js';
import { ApiError, type ApiRequestConfig, type ApiResponse } from '../types/api.js';
import { applyErrorHandler } from '../utils/errorHandler.js';

const httpClient = axios.create({
  baseURL: env.API_BASE_URL,
  timeout: env.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

const normalizeAxiosError = (error: AxiosError): ApiError => {
  if (error.response) {
    const responseData = error.response.data as { message?: string } | undefined;
    return new ApiError(
      responseData?.message ?? error.message,
      error.response.status,
      error.code,
      error.response.data,
    );
  }

  if (error.request) {
    return new ApiError('No response received from external API', 503, error.code);
  }

  return new ApiError(error.message, 500, error.code);
};

/**
 * Root function for all outbound API requests.
 * Must be called through `validatedApiRequest` so config is checked by middleware first.
 */
export async function apiRequest<T = unknown>(config: ApiRequestConfig): Promise<ApiResponse<T>> {
  try {
    const response = await httpClient.request<T>({
      url: config.url,
      method: config.method ?? 'GET',
      data: config.data,
      params: config.params,
      headers: config.headers,
      timeout: config.timeout,
      baseURL: config.baseURL,
    });

    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
    };
  } catch (error) {
    if (config.errorHandlerSnippet) {
      const handledError = applyErrorHandler(config.errorHandlerSnippet, error);

      if (handledError) {
        throw handledError;
      }
    }

    if (isAxiosError(error)) {
      throw normalizeAxiosError(error);
    }

    throw new ApiError(
      error instanceof Error ? error.message : 'Unknown API request error',
      500,
    );
  }
}
