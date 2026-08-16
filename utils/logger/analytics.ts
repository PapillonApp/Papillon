import { checkConsent } from "@/utils/logger/consent";
import { posthog } from "@/utils/logger/posthog";

type Segmentation = Record<string, string | number | boolean>;

async function track(event: string, level: "essentials" | "advanced", segmentation?: Segmentation) {
  const consent = await checkConsent();
  if (!consent.given || consent.level === "none") {
    return;
  }
  if (level === "advanced" && consent.level !== "advanced") {
    return;
  }
  posthog.capture(event, segmentation);
}

export async function trackOptionalEvent(event: string, segmentation?: Segmentation) {
  await track(event, "essentials", segmentation);
}

export async function trackAdvancedEvent(event: string, segmentation?: Segmentation) {
  await track(event, "advanced", segmentation);
}
