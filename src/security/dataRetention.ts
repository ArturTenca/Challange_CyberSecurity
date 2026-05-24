import AsyncStorage from '@react-native-async-storage/async-storage';
import { secureLogger } from './secureLogger';

const RETENTION_META_KEY = '@ford_app/retention_meta';
const DEFAULT_MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;

interface RetentionMeta {
  lastPurgeAt: number | null;
}

export async function purgeStaleLocalData(
  keys: string[],
  maxAgeMs: number = DEFAULT_MAX_AGE_MS
): Promise<{ removed: number }> {
  const now = Date.now();
  let removed = 0;

  for (const key of keys) {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw);
      const timestamp = parsed?.timestamp ?? parsed?.createdAt ?? null;
      if (timestamp && now - new Date(timestamp).getTime() > maxAgeMs) {
        await AsyncStorage.removeItem(key);
        removed += 1;
      }
    } catch {
      // ignore malformed cache entries
    }
  }

  const meta: RetentionMeta = { lastPurgeAt: now };
  await AsyncStorage.setItem(RETENTION_META_KEY, JSON.stringify(meta));
  secureLogger.info('local_retention_purge', { removed });
  return { removed };
}
