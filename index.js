// Silence known, non-actionable warnings/errors at the console level (not just
// the in-app LogBox overlay) so they don't spam the Metro terminal output.
const SILENCED_LOG_PATTERNS = [
  "is missing the required default export",
  "Found screens with the same name nested inside one another",
  "Linking found multiple possible URI schemes",
  "Failed to install Tensorflow Lite bindings",
  "You must pass your PostHog project's api key",
  "i18next is made possible by our own product, Locize",
  "Installing bindings...",
  "Successfully installed!",
];

const shouldSilence = (args) =>
  typeof args[0] === "string" &&
  SILENCED_LOG_PATTERNS.some((pattern) => args[0].includes(pattern));

const originalWarn = console.warn;
console.warn = (...args) => {
  if (shouldSilence(args)) return;
  originalWarn(...args);
};

const originalError = console.error;
console.error = (...args) => {
  if (shouldSilence(args)) return;
  originalError(...args);
};

const originalLog = console.log;
console.log = (...args) => {
  if (shouldSilence(args)) return;
  originalLog(...args);
};

const originalInfo = console.info;
console.info = (...args) => {
  if (shouldSilence(args)) return;
  originalInfo(...args);
};

import "expo-router/entry";
