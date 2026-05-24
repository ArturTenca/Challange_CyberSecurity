/**
 * Error handling utilities – mensagens seguras para o usuário
 */

const SAFE_STATUS_MESSAGES: Record<number, string> = {
  400: 'Dados inválidos. Verifique os campos e tente novamente.',
  401: 'Sessão expirada ou credenciais inválidas.',
  403: 'Você não tem permissão para esta ação.',
  404: 'Recurso não encontrado.',
  413: 'Dados enviados são grandes demais.',
  429: 'Muitas tentativas. Aguarde e tente novamente.',
  500: 'Erro interno. Tente novamente mais tarde.',
};

const INTERNAL_PATTERNS = [
  /stack/i,
  /trace/i,
  /sql/i,
  /mongodb/i,
  /postgres/i,
  /jwt/i,
  /node_modules/i,
  /at\s+\w+\./,
  /ECONNREFUSED/,
];

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function getPublicErrorMessage(statusCode?: number): string {
  if (statusCode && SAFE_STATUS_MESSAGES[statusCode]) {
    return SAFE_STATUS_MESSAGES[statusCode];
  }
  return 'Não foi possível concluir a operação. Tente novamente.';
}

function isInternalLeak(message: string): boolean {
  return INTERNAL_PATTERNS.some((p) => p.test(message));
}

export const handleApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) {
    return new ApiError(
      isInternalLeak(error.message)
        ? getPublicErrorMessage(error.statusCode)
        : error.message,
      error.statusCode,
      error.code,
      error.originalError
    );
  }

  if (error instanceof Error) {
    const safeMessage = isInternalLeak(error.message)
      ? getPublicErrorMessage()
      : error.message;
    return new ApiError(safeMessage, undefined, undefined, error);
  }

  return new ApiError(getPublicErrorMessage());
};

export const getErrorMessage = (error: unknown): string => {
  return handleApiError(error).message;
};

/**
 * Retry logic for failed requests
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error(getPublicErrorMessage());
};
