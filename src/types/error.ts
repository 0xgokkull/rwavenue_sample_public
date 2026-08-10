export interface ErrorHandlerResult {
  handled?: boolean;
  message?: string;
  statusCode?: number;
  code?: string;
  details?: unknown;
  rethrow?: boolean;
}

export type ErrorHandlerFn = () => ErrorHandlerResult | undefined;
