import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  VEHICLE_DATA: '@ford_app/vehicle_data',
  USER_PREFERENCES: '@ford_app/user_preferences',
  SYNC_HISTORY: '@ford_app/sync_history',
  FAVORITES: '@ford_app/favorites',
  LAST_SYNC: '@ford_app/last_sync',
} as const;

/**
 * Store data in local storage
 */
export const storeData = async <T>(key: string, value: T): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error storing data for key ${key}:`, error);
    throw error;
  }
};

/**
 * Retrieve data from local storage
 */
export const retrieveData = async <T>(key: string): Promise<T | null> => {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Error retrieving data for key ${key}:`, error);
    return null;
  }
};

/**
 * Remove data from local storage
 */
export const removeData = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing data for key ${key}:`, error);
    throw error;
  }
};

/**
 * Clear all app data
 */
export const clearAllData = async (): Promise<void> => {
  try {
    const keys = Object.values(STORAGE_KEYS);
    await AsyncStorage.multiRemove(keys);
  } catch (error) {
    console.error('Error clearing all data:', error);
    throw error;
  }
};

/**
 * Get storage usage info
 */
export const getStorageInfo = async (): Promise<{
  used: number;
  available: number;
  percentage: number;
} | null> => {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const allData = await AsyncStorage.multiGet(allKeys);
    
    const totalSize = allData.reduce((sum, [_, value]) => {
      return sum + (value ? value.length : 0);
    }, 0);

    return {
      used: totalSize,
      available: 5 * 1024 * 1024, // ~5MB for AsyncStorage
      percentage: (totalSize / (5 * 1024 * 1024)) * 100,
    };
  } catch (error) {
    console.error('Error getting storage info:', error);
    return null;
  }
};

export { STORAGE_KEYS };

