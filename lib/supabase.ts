import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

// Get these from https://app.supabase.com/project/_/settings/api
// Or set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://cmqffpfzsuamnquxmqac.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_sb6jdYX1xZmgDR-7GpAJNA_GlwexNWk';

// Check if we're running on web
const isWeb = typeof window !== 'undefined' && typeof document !== 'undefined';

// Web-safe storage adapter
// On web: uses localStorage (synchronous wrapper for async interface)
// On native: uses expo-secure-store with AsyncStorage fallback
const StorageAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    if (isWeb) {
      try {
        return window.localStorage.getItem(key);
      } catch (e) {
        console.warn('localStorage getItem error:', e);
        return null;
      }
    }

    // Native platform - try SecureStore first, fall back to AsyncStorage
    try {
      const SecureStore = await import('expo-secure-store');
      const AsyncStorage = await import('@react-native-async-storage/async-storage');
      try {
        return await SecureStore.getItemAsync(key);
      } catch {
        return await AsyncStorage.default.getItem(key);
      }
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (isWeb) {
      try {
        window.localStorage.setItem(key, value);
      } catch (e) {
        console.warn('localStorage setItem error:', e);
      }
      return;
    }

    // Native platform
    try {
      const SecureStore = await import('expo-secure-store');
      try {
        await SecureStore.setItemAsync(key, value);
        return;
      } catch {
        // Fall through to AsyncStorage
      }
    } catch {
      // SecureStore not available, fall through to AsyncStorage
    }

    try {
      const AsyncStorage = await import('@react-native-async-storage/async-storage');
      await AsyncStorage.default.setItem(key, value);
    } catch (e) {
      console.warn('AsyncStorage setItem error:', e);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    if (isWeb) {
      try {
        window.localStorage.removeItem(key);
      } catch (e) {
        console.warn('localStorage removeItem error:', e);
      }
      return;
    }

    // Native platform
    try {
      const SecureStore = await import('expo-secure-store');
      try {
        await SecureStore.deleteItemAsync(key);
        return;
      } catch {
        // Fall through to AsyncStorage
      }
    } catch {
      // SecureStore not available, fall through to AsyncStorage
    }

    try {
      const AsyncStorage = await import('@react-native-async-storage/async-storage');
      await AsyncStorage.default.removeItem(key);
    } catch (e) {
      console.warn('AsyncStorage removeItem error:', e);
    }
  },
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: StorageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
