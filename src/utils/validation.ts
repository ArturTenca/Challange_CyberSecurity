/**
 * Data validation and sanitization utilities
 */
import { assertSafeString, containsMaliciousPattern } from '../security/inputGuards';

/**
 * Validate email
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (Brazilian format)
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^(\+55)?\s?(\(?\d{2}\)?)\s?9?\d{4}-?\d{4}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Validate URL
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Sanitize string - remove harmful characters
 */
export const sanitizeString = (str: string): string => {
  if (!str) return '';
  const trimmed = str.trim();
  if (containsMaliciousPattern(trimmed)) {
    return trimmed.replace(/[<>'"`;|]/g, '');
  }
  return trimmed
    .replace(/[<>\"'&]/g, (char) => {
      const map: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;',
      };
      return map[char] || char;
    });
};

/**
 * Sanitize number
 */
export const sanitizeNumber = (value: any): number | null => {
  const num = Number(value);
  return !isNaN(num) ? num : null;
};

/**
 * Validate and sanitize vehicle data
 */
export const validateVehicleData = (data: any): boolean => {
  if (!data || typeof data !== 'object') return false;
  
  return (
    typeof data.model === 'string' &&
    typeof data.price === 'string' &&
    data.model.length > 0 &&
    data.model.length < 255
  );
};

/**
 * Validate and sanitize user feedback
 */
export const validateFeedback = (feedback: {
  message?: string;
  rating?: number;
  vehicleId?: string;
}): boolean => {
  if (!feedback || typeof feedback !== 'object') return false;
  
  if (feedback.message) {
    if (typeof feedback.message !== 'string' || feedback.message.length < 3) {
      return false;
    }
  }
  
  if (feedback.rating !== undefined) {
    const rating = sanitizeNumber(feedback.rating);
    if (rating === null || rating < 1 || rating > 5) {
      return false;
    }
  }
  
  if (feedback.vehicleId && typeof feedback.vehicleId !== 'string') {
    return false;
  }
  
  return true;
};

/**
 * Validate API response
 */
export const validateApiResponse = <T>(
  response: any,
  schema: Record<string, 'string' | 'number' | 'boolean' | 'object' | 'array'>
): response is T => {
  if (!response || typeof response !== 'object') return false;
  
  for (const [key, type] of Object.entries(schema)) {
    const value = response[key];
    
    if (type === 'array' && !Array.isArray(value)) return false;
    if (type !== 'array' && typeof value !== type) return false;
  }
  
  return true;
};

/**
 * Sanitize object keys and values
 */
export const sanitizeObject = (obj: Record<string, any>): Record<string, any> => {
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === 'number') {
      sanitized[key] = sanitizeNumber(value);
    } else if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        sanitized[key] = value.map((item) =>
          typeof item === 'string' ? sanitizeString(item) : item
        );
      } else {
        sanitized[key] = sanitizeObject(value);
      }
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

/**
 * Rate limiter helper
 */
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  private readonly maxAttempts: number;
  private readonly windowMs: number;

  constructor(maxAttempts: number = 10, windowMs: number = 60000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  isAllowed(key: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];

    // Remove old attempts outside the window
    const validAttempts = attempts.filter((time) => now - time < this.windowMs);

    if (validAttempts.length >= this.maxAttempts) {
      return false;
    }

    validAttempts.push(now);
    this.attempts.set(key, validAttempts);

    return true;
  }

  reset(key?: string): void {
    if (key) {
      this.attempts.delete(key);
    } else {
      this.attempts.clear();
    }
  }
}

/**
 * Input validation for forms
 */
export const validateInput = {
  email: (email: string): { valid: boolean; error?: string } => {
    if (!email) return { valid: false, error: 'Email é obrigatório' };
    if (!isValidEmail(email)) return { valid: false, error: 'Email inválido' };
    return { valid: true };
  },

  password: (
    password: string
  ): { valid: boolean; error?: string } => {
    if (!password) return { valid: false, error: 'Senha é obrigatória' };
    if (password.length < 6) {
      return { valid: false, error: 'Senha deve ter no mínimo 6 caracteres' };
    }
    return { valid: true };
  },

  url: (url: string): { valid: boolean; error?: string } => {
    if (!url) return { valid: false, error: 'URL é obrigatória' };
    if (!isValidUrl(url)) return { valid: false, error: 'URL inválida' };
    return { valid: true };
  },

  text: (
    text: string,
    minLength: number = 1,
    maxLength: number = 500
  ): { valid: boolean; error?: string } => {
    if (text.length < minLength) {
      return { valid: false, error: `Mínimo ${minLength} caracteres` };
    }
    if (text.length > maxLength) {
      return { valid: false, error: `Máximo ${maxLength} caracteres` };
    }
    const safe = assertSafeString(text, maxLength);
    if (!safe.safe) {
      return { valid: false, error: safe.reason };
    }
    return { valid: true };
  },
};

export { assertSafeString, containsMaliciousPattern };
