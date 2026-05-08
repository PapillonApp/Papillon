import Countly from "countly-sdk-react-native-bridge";

import { checkConsent } from "@/utils/logger/consent";

type Segmentation = Record<string, string | number | boolean>;

async function track(event: string, level: "optional" | "advanced", segmentation?: Segmentation) {
  const consent = await checkConsent();
  if (!consent.given || !consent.optional) {
    return;
  }
  if (level === "advanced" && !consent.advanced) {
    return;
  }
  Countly.events.recordEvent(event, segmentation, 1);
}

export async function trackOptionalEvent(event: string, segmentation?: Segmentation) {
  await track(event, "optional", segmentation);
}

export async function trackAdvancedEvent(event: string, segmentation?: Segmentation) {
  await track(event, "advanced", segmentation);
}
