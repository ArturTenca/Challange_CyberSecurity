import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import { STORAGE_KEYS } from './storage';

interface SyncRecord {
  id: string;
  timestamp: number;
  status: 'pending' | 'synced' | 'failed';
  data: any;
  error?: string;
}

interface PersistenceConfig {
  key: string;
  version: number;
  migrate?: (data: any, version: number) => any;
  onError?: (error: Error) => void;
}

/**
 * Advanced persistence manager for offline-first architecture
 */
export class PersistenceManager {
  private config: PersistenceConfig;
  private syncQueue: SyncRecord[] = [];
  private isOnline: boolean = true;

  constructor(config: PersistenceConfig) {
    this.config = config;
    this.loadSyncQueue();
  }

  /**
   * Save data with automatic versioning
   */
  async save<T>(data: T): Promise<void> {
    try {
      const serialized = {
        data,
        version: this.config.version,
        timestamp: Date.now(),
      };

      await AsyncStorage.setItem(
        this.config.key,
        JSON.stringify(serialized)
      );
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }

  /**
   * Load data with automatic migration
   */
  async load<T>(): Promise<T | null> {
    try {
      const stored = await AsyncStorage.getItem(this.config.key);
      if (!stored) return null;

      const parsed = JSON.parse(stored);

      // Run migration if needed
      if (parsed.version < this.config.version) {
        if (this.config.migrate) {
          parsed.data = this.config.migrate(parsed.data, parsed.version);
          await this.save(parsed.data);
        }
      }

      return parsed.data;
    } catch (error) {
      this.handleError(error as Error);
      return null;
    }
  }

  /**
   * Add to sync queue for offline-first
   */
  async queueForSync(id: string, data: any): Promise<void> {
    const record: SyncRecord = {
      id,
      timestamp: Date.now(),
      status: 'pending',
      data,
    };

    this.syncQueue.push(record);
    await this.saveSyncQueue();
  }

  /**
   * Get pending sync records
   */
  getPendingSync(): SyncRecord[] {
    return this.syncQueue.filter((r) => r.status === 'pending');
  }

  /**
   * Mark as synced
   */
  async markAsSynced(id: string): Promise<void> {
    const record = this.syncQueue.find((r) => r.id === id);
    if (record) {
      record.status = 'synced';
      record.timestamp = Date.now();
      await this.saveSyncQueue();
    }
  }

  /**
   * Mark as failed
   */
  async markAsFailed(id: string, error: string): Promise<void> {
    const record = this.syncQueue.find((r) => r.id === id);
    if (record) {
      record.status = 'failed';
      record.error = error;
      await this.saveSyncQueue();
    }
  }

  /**
   * Save sync queue to storage
   */
  private async saveSyncQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        `${this.config.key}:sync`,
        JSON.stringify(this.syncQueue)
      );
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  /**
   * Load sync queue from storage
   */
  private async loadSyncQueue(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(`${this.config.key}:sync`);
      if (stored) {
        this.syncQueue = JSON.parse(stored);
      }
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  /**
   * Retry failed syncs
   */
  async retrySyncQueue(
    syncFn: (record: SyncRecord) => Promise<void>
  ): Promise<void> {
    const failed = this.syncQueue.filter((r) => r.status === 'failed');

    for (const record of failed) {
      try {
        await syncFn(record);
        await this.markAsSynced(record.id);
      } catch (error) {
        await this.markAsFailed(
          record.id,
          error instanceof Error ? error.message : 'Unknown error'
        );
      }
    }
  }

  /**
   * Clear all data
   */
  async clear(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        this.config.key,
        `${this.config.key}:sync`,
      ]);
      this.syncQueue = [];
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  /**
   * Get storage statistics
   */
  async getStats(): Promise<{
    stored: boolean;
    version: number;
    pendingSync: number;
    failedSync: number;
    lastUpdated: number | null;
  }> {
    try {
      const stored = await AsyncStorage.getItem(this.config.key);
      const parsed = stored ? JSON.parse(stored) : null;

      return {
        stored: !!stored,
        version: parsed?.version || 0,
        pendingSync: this.syncQueue.filter((r) => r.status === 'pending')
          .length,
        failedSync: this.syncQueue.filter((r) => r.status === 'failed').length,
        lastUpdated: parsed?.timestamp || null,
      };
    } catch (error) {
      this.handleError(error as Error);
      return {
        stored: false,
        version: 0,
        pendingSync: 0,
        failedSync: 0,
        lastUpdated: null,
      };
    }
  }

  /**
   * Handle errors
   */
  private handleError(error: Error): void {
    console.error(`PersistenceManager error (${this.config.key}):`, error);
    this.config.onError?.(error);
  }
}

/**
 * Pre-configured managers for common use cases
 */

export const vehiclePersistence = new PersistenceManager({
  key: STORAGE_KEYS.VEHICLE_DATA,
  version: 1,
  migrate: (data, version) => {
    // Example migration from v0 to v1
    if (version === 0) {
      return Array.isArray(data)
        ? data
        : Object.values(data);
    }
    return data;
  },
});

export const userPreferencesPersistence = new PersistenceManager({
  key: STORAGE_KEYS.USER_PREFERENCES,
  version: 1,
});

export const favoritesPersistence = new PersistenceManager({
  key: STORAGE_KEYS.FAVORITES,
  version: 1,
});

/**
 * Hook for using persistence manager in components
 */
export const usePersistence = (manager: PersistenceManager) => {
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const loaded = await manager.load();
        setData(loaded);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Load failed');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [manager]);

  const save = React.useCallback(async (newData: any) => {
    try {
      await manager.save(newData);
      setData(newData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    }
  }, [manager]);

  return { data, loading, error, save };
};

export type { PersistenceConfig, SyncRecord };

