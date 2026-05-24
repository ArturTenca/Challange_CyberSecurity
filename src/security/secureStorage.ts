import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIX = '@ford_secure/';

export async function setSecureItem(key: string, value: string): Promise<void> {
  await AsyncStorage.setItem(`${PREFIX}${key}`, value);
}

export async function getSecureItem(key: string): Promise<string | null> {
  return AsyncStorage.getItem(`${PREFIX}${key}`);
}

export async function deleteSecureItem(key: string): Promise<void> {
  await AsyncStorage.removeItem(`${PREFIX}${key}`);
}
