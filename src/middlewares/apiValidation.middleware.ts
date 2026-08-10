import { NextFunction, Request, Response } from 'express';
import { apiRequest } from '../lib/apiRequest.js';
import {
  ApiError,
  type ApiRequestConfig,
  type ApiResponse,
  type FieldRule,
  type HttpMethod,
  type ValidationSource,
} from '../types/api.js';

const HTTP_METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

const isValidUrl = (value: string): boolean => {
  try {
    new URL(value);
    return true;
  } catch {
    return value.startsWith('/');
  }
};

const getFieldType = (value: unknown): string => {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
};

export const validateApiConfig = (config: ApiRequestConfig): void => {
  if (!config.url || typeof config.url !== 'string' || config.url.trim() === '') {
    throw new ApiError('API request URL is required', 400, 'INVALID_URL');
  }

  if (!isValidUrl(config.url)) {
    throw new ApiError('API request URL is invalid', 400, 'INVALID_URL');
  }

  if (config.method && !HTTP_METHODS.includes(config.method)) {
    throw new ApiError(`Invalid HTTP method: ${config.method}`, 400, 'INVALID_METHOD');
  }

  if (config.timeout !== undefined && (typeof config.timeout !== 'number' || config.timeout <= 0)) {
    throw new ApiError('API timeout must be a positive number', 400, 'INVALID_TIMEOUT');
  }

  if (config.baseURL !== undefined && !isValidUrl(config.baseURL)) {
    throw new ApiError('API baseURL is invalid', 400, 'INVALID_BASE_URL');
  }
};

/**
 * Public entry point for outbound API calls.
 * Runs validation middleware, then delegates to the root `apiRequest` function.
 */
export async function validatedApiRequest<T = unknown>(
  config: ApiRequestConfig,
): Promise<ApiResponse<T>> {
  validateApiConfig(config);
  return apiRequest<T>(config);
}

const getSourceData = (req: Request, source: ValidationSource): Record<string, unknown> => {
  switch (source) {
    case 'body':
      return (req.body ?? {}) as Record<string, unknown>;
    case 'query':
      return (req.query ?? {}) as Record<string, unknown>;
    case 'params':
      return (req.params ?? {}) as Record<string, unknown>;
  }
};

const validateFieldRules = (
  data: Record<string, unknown>,
  rules: FieldRule[],
): string[] => {
  const errors: string[] = [];

  for (const rule of rules) {
    const value = data[rule.field];
    const isMissing = value === undefined || value === null || value === '';

    if (rule.required && isMissing) {
      errors.push(`${rule.field} is required`);
      continue;
    }

    if (isMissing) continue;

    if (rule.type && getFieldType(value) !== rule.type) {
      errors.push(`${rule.field} must be of type ${rule.type}`);
    }

    if (rule.type === 'string' && rule.minLength !== undefined && typeof value === 'string') {
      if (value.length < rule.minLength) {
        errors.push(`${rule.field} must be at least ${rule.minLength} characters`);
      }
    }
  }

  return errors;
};

/**
 * Express middleware to validate incoming request data before handlers call external APIs.
 */
export const validateRequest =
  (rules: FieldRule[], source: ValidationSource = 'body') =>
  (req: Request, res: Response, next: NextFunction): void => {
    const data = getSourceData(req, source);
    const errors = validateFieldRules(data, rules);

    if (errors.length > 0) {
      res.status(400).json({
        message: 'Request validation failed',
        errors,
      });
      return;
    }

    next();
  };
