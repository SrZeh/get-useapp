/**
 * useDebounce - Hook to debounce a value
 * 
 * Delays updating the debounced value until after the specified delay
 * has passed since the last time the source value changed.
 * 
 * Useful for search inputs, API calls, or any operation that should
 * only trigger after the user stops typing/acting.
 * 
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 500)
 * @returns Debounced value
 */

import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up a timer to update the debounced value after the delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timer if value changes before delay completes
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

