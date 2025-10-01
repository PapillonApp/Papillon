import * as ExpoWebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { isWindows } from './platform';
import { warn } from './logger/logger';

/**
 * Opens a URL in a web browser, using an in-app browser on mobile and the
 * default external browser on Windows.
 * @param {string} url - The URL to open.
 * @param {ExpoWebBrowser.WebBrowserOptions} options - Options for the in-app browser on mobile.
 */
export async function openBrowserAsync(
  url: string,
  options: ExpoWebBrowser.WebBrowserOptions = {}
): Promise<ExpoWebBrowser.WebBrowserResult> {
  if (isWindows) {
    warn('Opening URL in external browser on Windows.');
    try {
      await Linking.openURL(url);
      return { type: 'opened' };
    } catch (error) {
      warn(`Failed to open URL: ${error}`);
      return { type: 'cancel' }; // or another appropriate result type
    }
  }
  return ExpoWebBrowser.openBrowserAsync(url, options);
}

// Re-export all other members from expo-web-browser for convenience
export * from 'expo-web-browser';