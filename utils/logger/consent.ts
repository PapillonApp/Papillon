import { MMKV } from "react-native-mmkv";

import { posthog } from "@/utils/logger/posthog";

interface ConsentStatus {
  given: boolean;
  required: boolean;
  optional: boolean;
  advanced: boolean;
}

export const checkConsent = async (): Promise<ConsentStatus> => {
  const consentConfig = new MMKV();
  const given = await consentConfig.getBoolean("consent") ?? false;
  const required = await consentConfig.getBoolean("countly-consent-required") ?? false;
  const optional = await consentConfig.getBoolean("countly-consent-optional") ?? false;
  const advanced = await consentConfig.getBoolean("countly-consent-advanced") ?? false;

  return { given, required, optional, advanced };
}

interface ConsentLevels {
  none: boolean;
  required: boolean;
  optional: boolean;
  advanced: boolean;
}

export const setConsent = async (consent: keyof ConsentLevels) => {
  const consentConfig = new MMKV();

  if (consent === "none") {
    await consentConfig.set("consent", true);
    await consentConfig.set("countly-consent-required", false);
    await consentConfig.set("countly-consent-optional", false);
    await consentConfig.set("countly-consent-advanced", false);
    await posthog.optOut();
  } else if (consent === "required") {
    await consentConfig.set("consent", true);
    await consentConfig.set("countly-consent-required", true);
    await consentConfig.set("countly-consent-optional", false);
    await consentConfig.set("countly-consent-advanced", false);
    await posthog.optIn();
  } else if (consent === "optional") {
    await consentConfig.set("consent", true);
    await consentConfig.set("countly-consent-required", true);
    await consentConfig.set("countly-consent-optional", true);
    await consentConfig.set("countly-consent-advanced", false);
    await posthog.optIn();
  } else if (consent === "advanced") {
    await consentConfig.set("consent", true);
    await consentConfig.set("countly-consent-required", true);
    await consentConfig.set("countly-consent-optional", true);
    await consentConfig.set("countly-consent-advanced", true);
    await posthog.optIn();
  }

  return;
}
