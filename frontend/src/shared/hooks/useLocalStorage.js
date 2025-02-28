import { useState, useEffect } from 'react';

/**
 * Custom React Hook to manage state synchronized with localStorage.
 *
 * @param {string} key - The key under which the value is stored in localStorage.
 * @param {*} initialValue - The initial value to use if the key is not in localStorage.
 * @returns {[any, function]} - The current value and a function to update it.
 */
const useLocalStorage = (key, initialValue) => {
  // Initialize state with the value from localStorage or the initial value
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item !== null ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`[useLocalStorage] Error reading key "${key}" from localStorage:`, error);
      return initialValue;
    }
  });

  /**
   * Update localStorage whenever the stored value changes.
   */
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(`[useLocalStorage] Error writing key "${key}" to localStorage:`, error);
    }
  }, [key, storedValue]);

  /**
   * Handle updates to localStorage from other tabs/windows.
   */
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === key) {
        try {
          const newValue = event.newValue ? JSON.parse(event.newValue) : initialValue;
          setStoredValue(newValue);
        } catch (error) {
          console.error(`[useLocalStorage] Error parsing key "${key}" from storage event:`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, initialValue]);

  return [storedValue, setStoredValue];
};

export default useLocalStorage;
