/**
 * Helper utility to interact with LocalStorage safely.
 * Similar to the localData pattern in warehouse_web.
 *
 * @param key - The localStorage key
 * @param value - The value to set (if null, does nothing unless isRemove is true)
 * @param isRemove - If true, removes the key from localStorage
 */
export const storage = {
  get: <T>(key: string): T | null => {
    try {
      const result = localStorage.getItem(key);
      if (!result) return null;

      // If it's a string wrapped in quotes, clean it
      if (result.startsWith('"') && result.endsWith('"')) {
        return JSON.parse(result) as T;
      }

      // Attempt to parse JSON, if it fails, return as standard string
      try {
        return JSON.parse(result) as T;
      } catch {
        return result as unknown as T;
      }
    } catch (error) {
      console.error(`Error reading ${key} from localStorage`, error);
      return null;
    }
  },

  set: (key: string, value: unknown): void => {
    try {
      if (typeof value === 'string') {
        localStorage.setItem(key, value);
      } else {
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error(`Error setting ${key} to localStorage`, error);
    }
  },

  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key} from localStorage`, error);
    }
  },
};
