import PostHog from "posthog-react-native";

let secrets = { POSTHOG_API_KEY: "", POSTHOG_HOST: "" };

try {
  secrets = require("../../secrets.json") ?? secrets;
} catch {
  // No secrets.json in this environment (e.g. local/dev checkout) — PostHog stays disabled below.
}

const API_KEY = secrets.POSTHOG_API_KEY;
const HOST = secrets.POSTHOG_HOST || "https://posthog.papillon.bzh";

// The PostHog client self-disables gracefully when constructed without an API
// key (it just becomes a no-op), so we always build a real instance here —
// PostHogProvider expects one and breaks on a plain object stand-in.
export const posthog = new PostHog(API_KEY, {
  host: HOST,
  defaultOptIn: false,
});
