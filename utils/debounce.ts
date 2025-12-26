// utils/debounce.ts

/**
 * Creates a debounced function that delays invoking func until after wait milliseconds
 * have elapsed since the last time the debounced function was invoked.
 *
 * @param func The function to debounce.
 * @param wait The number of milliseconds to delay.
 * @returns A new, debounced function.
 */
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): T & { cancel: () => void } {
  let timeout: NodeJS.Timeout | null = null;

  // The debounced function that will be called by the user
  const debounced = function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    // Clear the previous timeout, effectively resetting the timer
    if (timeout) {
      clearTimeout(timeout);
    }

    // Set a new timeout
    timeout = setTimeout(() => {
      // Execute the original function
      func.apply(this, args);
    }, wait);
  } as T & { cancel: () => void };

  // Add a cancel method to the debounced function
  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return debounced;
}