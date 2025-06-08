import { useEffect, useState } from "react";

/**
 * Custom hook for debouncing a value.
 * @param  value - The value to be debounced.
 * @param  milliSeconds - The time to delay before updating the debounced value.
 * @returns - The debounced value.
 */

export const useDebounce = (value, milliSeconds) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set a timeout to update the debounced value after the specified time.
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, milliSeconds);

    // Clean up the timeout when the component unmounts or when 'value' or 'milliSeconds' changes.
    return () => {
      clearTimeout(handler);
    };
  }, [value, milliSeconds]);

  return debouncedValue;
};
