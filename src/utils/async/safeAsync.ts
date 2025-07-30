import { error as logError, warn } from "@/utils/logger/logger";

/**
 * Safely executes an async operation with error handling
 * @param operation The async operation to execute
 * @param context A context string for logging
 * @param fallbackValue Optional fallback value to return on error
 * @returns The result of the operation or fallbackValue on error
 */
export async function safeAsync<T> (
  operation: () => Promise<T>,
  context: string,
  fallbackValue?: T
): Promise<T | undefined> {
  try {
    return await operation();
  } catch (error) {
    logError(`Error in ${context}: ${error}`, "SafeAsync");
    if (error instanceof Error) {
      logError(`Stack trace: ${error.stack}`, "SafeAsync");
    }
    return fallbackValue;
  }
}

/**
 * Safely executes an async operation without waiting for the result
 * Useful for fire-and-forget operations that shouldn't block execution
 * @param operation The async operation to execute
 * @param context A context string for logging
 */
export function safeAsyncVoid (
  operation: () => Promise<void>,
  context: string
): void {
  operation().catch((error) => {
    logError(`Error in ${context}: ${error}`, "SafeAsyncVoid");
    if (error instanceof Error) {
      logError(`Stack trace: ${error.stack}`, "SafeAsyncVoid");
    }
  });
}

/**
 * Creates a retry wrapper for async operations
 * @param operation The async operation to retry
 * @param maxRetries Maximum number of retry attempts
 * @param delay Delay between retries in milliseconds
 * @param context Context for logging
 */
export async function withRetry<T> (
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000,
  context: string = "Unknown"
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === maxRetries) {
        logError(`Failed after ${maxRetries} attempts in ${context}: ${lastError.message}`, "RetryWrapper");
        throw lastError;
      }

      warn(`Attempt ${attempt} failed in ${context}, retrying in ${delay}ms: ${lastError.message}`, "RetryWrapper");
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

/**
 * Timeout wrapper for async operations
 * @param operation The async operation to execute
 * @param timeoutMs Timeout in milliseconds
 * @param context Context for logging
 */
export async function withTimeout<T> (
  operation: () => Promise<T>,
  timeoutMs: number,
  context: string = "Unknown"
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      const error = new Error(`Operation timed out after ${timeoutMs}ms in ${context}`);
      logError(error.message, "TimeoutWrapper");
      reject(error);
    }, timeoutMs);

    operation()
      .then((result) => {
        clearTimeout(timer);
        resolve(result);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}