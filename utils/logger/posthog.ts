import PostHog from "posthog-react-native";

let secrets = { POSTHOG_API_KEY: "", POSTHOG_HOST: "" };

try {
  secrets = require("../../secrets.json") ?? secrets;
} catch {
  console.warn("No secrets.json file found, PostHog will not be initialized properly.");
}

const API_KEY = secrets.POSTHOG_API_KEY;
const HOST = secrets.POSTHOG_HOST || "https://posthog.papillon.bzh";

export const posthog = new PostHog(API_KEY, {
  host: HOST,
  defaultOptIn: false,
});
