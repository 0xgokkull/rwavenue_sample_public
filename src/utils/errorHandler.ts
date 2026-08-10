import { createRequire } from 'module';
import { ApiError } from '../types/api.js';
import type { ErrorHandlerFn, ErrorHandlerResult } from '../types/error.js';

type RequireFn = ReturnType<typeof createRequire>;

type CompiledSnippet = (require: RequireFn) => ErrorHandlerResult | undefined;

const compileSnippet = (codeSnippet: string): CompiledSnippet => {
  const FunctionConstructor = Function as unknown as {
    new (...args: string[]): CompiledSnippet;
  };

  return new FunctionConstructor('require', codeSnippet);
};

const executeSnippet = (codeSnippet: string): ErrorHandlerResult | undefined => {
  const requireFn = createRequire(import.meta.url);
  const compiled = compileSnippet(codeSnippet);

  try {
    const result = compiled(requireFn);
    return result ?? undefined;
  } catch (handlerError) {
    console.error('Error handler failed:', handlerError);
    return undefined;
  }
};

/**
 * Creates a reusable handler from a code snippet.
 * The snippet runs via the Function constructor with `require` in scope.
 *
 * @example
 * const handler = createErrorHandler(`
 *   const fs = require('fs');
 *   return { handled: true, message: 'Done', statusCode: 200 };
 * `);
 * handler();
 */
export const createErrorHandler = (codeSnippet: string): ErrorHandlerFn => {
  return (): ErrorHandlerResult | undefined => executeSnippet(codeSnippet);
};

/**
 * Runs a code snippet for one-off handling.
 */
export const runErrorHandler = (
  codeSnippet: string,
): ErrorHandlerResult | undefined => executeSnippet(codeSnippet);

/**
 * Runs a snippet and converts the result into an ApiError when handled.
 * Returns null when the snippet does not handle the error (fallback to default handling).
 * `caughtError` is only used when the snippet returns `{ rethrow: true }`.
 */
export const applyErrorHandler = (
  codeSnippet: string,
  caughtError?: unknown,
): ApiError | null => {
  const result = runErrorHandler(codeSnippet);

  if (!result) {
    return null;
  }

  if (result.rethrow) {
    if (caughtError instanceof ApiError) {
      throw caughtError;
    }

    throw caughtError instanceof Error
      ? caughtError
      : new ApiError(String(caughtError ?? 'Unknown error'), 500);
  }

  if (result.handled || result.message) {
    return new ApiError(
      result.message ?? 'Error handled by snippet',
      result.statusCode ?? 500,
      result.code,
      result.details,
    );
  }

  return null;
};
