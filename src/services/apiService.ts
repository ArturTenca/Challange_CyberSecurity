import {
  buildVehicleQueryString,
  normalizeVehicleParams,
} from '../security/apiParams';
import { recordClientAudit } from '../security/auditClient';
import { sanitizeObject } from '../utils/validation';
import { validateFeedback } from '../utils/validation';
import { retryWithBackoff } from '../utils/errorHandler';
import { retrieveData, STORAGE_KEYS, storeData } from '../utils/storage';
import { secureRequest } from './secureApiClient';

interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
  useCache?: boolean;
  cacheDuration?: number; // in milliseconds
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

const DEFAULT_TIMEOUT = 30000; // 30 seconds
const DEFAULT_CACHE_DURATION = 3600000; // 1 hour
const API_CACHE = new Map<string, CacheEntry<any>>();

/**
 * Fetch wrapper with error handling, retries, and caching
 */
const fetchWithConfig = async <T>(
  url: string,
  config: RequestConfig = {}
): Promise<T> => {
  const {
    method = 'GET',
    headers = {},
    body,
    timeout = DEFAULT_TIMEOUT,
    retries = 2,
    useCache = true,
    cacheDuration = DEFAULT_CACHE_DURATION,
  } = config;

  const cacheKey = `${method}:${url}`;

  // Check cache first
  if (method === 'GET' && useCache) {
    const cached = API_CACHE.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }

    const storedCache = await retrieveData<CacheEntry<T>>(cacheKey);
    if (storedCache && Date.now() - storedCache.timestamp < storedCache.ttl) {
      API_CACHE.set(cacheKey, storedCache);
      return storedCache.data;
    }
  }

  const makeRequest = async (): Promise<T> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data: T = await response.json();

      // Cache successful responses
      if (method === 'GET' && useCache) {
        const cacheEntry: CacheEntry<T> = {
          data,
          timestamp: Date.now(),
          ttl: cacheDuration,
        };
        API_CACHE.set(cacheKey, cacheEntry);
        await storeData(cacheKey, cacheEntry);
      }

      return data;
    } finally {
      clearTimeout(timeoutId);
    }
  };

  return retryWithBackoff(makeRequest, retries);
};

/**
 * API Service for Ford App
 */
export const apiService = {
  /**
   * Fetch vehicle data
   */
  getVehicles: async (forceRefresh = false): Promise<any[]> => {
    // For MVP, return mock data
    // In production, replace with actual API endpoint
    const mockVehicles = [
      {
        id: 1,
        model: 'Ranger Raptor 2026',
        tagline: 'Belo Sorriso.',
        price: 'R$ 466.500',
        year: 2026,
        imageUrl: 'https://placeholder.com/400x600',
        specs: {
          engine: '3.0 V6 Bi-turbo Diesel',
          power: '397 cv',
          torque: '583 Nm',
          transmission: '10-speed automatic',
        },
      },
    ];

    if (!forceRefresh) {
      const cached = await retrieveData<any[]>(STORAGE_KEYS.VEHICLE_DATA);
      if (cached) {
        return cached;
      }
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    await storeData(STORAGE_KEYS.VEHICLE_DATA, mockVehicles);
    return mockVehicles;
  },

  /**
   * Fetch vehicle specs
   */
  getVehicleSpecs: async (vehicleId: string): Promise<any> => {
    return fetchWithConfig(`/api/vehicles/${vehicleId}/specs`, {
      useCache: true,
      cacheDuration: 86400000, // 24 hours
    });
  },

  /**
   * Fetch competitor data for reports
   */
  getCompetitorData: async (): Promise<any> => {
    return fetchWithConfig(`/api/competitors`, {
      useCache: true,
      cacheDuration: 604800000, // 7 days
    });
  },

  /**
   * Submit user feedback
   */
  submitFeedback: async (feedback: {
    message: string;
    rating?: number;
    vehicleId?: string;
  }): Promise<{ success: boolean; id: string }> => {
    if (!validateFeedback(feedback)) {
      throw new Error('Feedback inválido');
    }
    const sanitized = sanitizeObject(feedback);
    return fetchWithConfig('/api/feedback', {
      method: 'POST',
      body: sanitized,
      useCache: false,
    });
  },

  /**
   * Busca veículos na API segura (marca, modelo, versão normalizados)
   */
  searchVehiclesSecure: async (params: {
    marca: string;
    modelo: string;
    versao: string;
  }) => {
    const normalized = normalizeVehicleParams(params);
    if (!normalized.valid || !normalized.data) {
      throw new Error(normalized.error || 'Parâmetros inválidos');
    }
    recordClientAudit('vehicle_query', normalized.data);
    const query = buildVehicleQueryString(normalized.data);
    return secureRequest<{ data: unknown[]; count: number }>(
      `/api/vehicles?${query}`,
      { method: 'GET', requiresAuth: true, signPayload: false }
    );
  },

  /**
   * Cria lead via API protegida
   */
  createLeadSecure: async (lead: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    vehicleInterest: string;
    region?: string;
  }) => {
    const body = sanitizeObject(lead);
    recordClientAudit('lead_submit', { vehicleInterest: body.vehicleInterest });
    return secureRequest<{ success: boolean; id: string }>('/api/leads', {
      method: 'POST',
      body,
      requiresAuth: true,
      signPayload: true,
    });
  },

  /**
   * Get personalized recommendations
   */
  getRecommendations: async (userId: string): Promise<any[]> => {
    return fetchWithConfig(`/api/users/${userId}/recommendations`, {
      useCache: true,
      cacheDuration: 3600000, // 1 hour
    });
  },

  /**
   * Sync data with server
   */
  syncData: async (): Promise<{ status: string; timestamp: number }> => {
    const result = await fetchWithConfig('/api/sync', {
      method: 'POST',
      useCache: false,
    });

    await storeData(STORAGE_KEYS.LAST_SYNC, Date.now());
    return result;
  },

  /**
   * Clear all caches
   */
  clearCache: (): void => {
    API_CACHE.clear();
  },
};

/**
 * Offline data handler
 */
export const offlineService = {
  /**
   * Get cached vehicle data when offline
   */
  getCachedVehicles: async (): Promise<any[]> => {
    const cached = await retrieveData<any[]>(STORAGE_KEYS.VEHICLE_DATA);
    return cached || [];
  },

  /**
   * Check if data is stale
   */
  isDataStale: async (): Promise<boolean> => {
    const lastSync = await retrieveData<number>(STORAGE_KEYS.LAST_SYNC);
    if (!lastSync) return true;
    return Date.now() - lastSync > 3600000; // 1 hour
  },

  /**
   * Get sync history
   */
  getSyncHistory: async (): Promise<any[]> => {
    const history = await retrieveData<any[]>(STORAGE_KEYS.SYNC_HISTORY);
    return history || [];
  },
};

export type { RequestConfig };

