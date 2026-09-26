import { requireOptionalNativeModule } from "expo";

export type TipDisplayFrequency = "immediate" | "hourly" | "daily" | "weekly" | "monthly";

/**
 * Why a tip is being put away. `actionPerformed` is the everyday one: the user
 * did the thing the tip was hinting at, so there is nothing left to teach.
 */
export type TipInvalidationReason = "actionPerformed" | "tipClosed" | "displayCountExceeded";

interface PapillonTipsNativeModule {
  isSupported: boolean;
  configure: (displayFrequency?: TipDisplayFrequency) => Promise<boolean>;
  invalidate: (tipId: string, reason?: TipInvalidationReason) => Promise<void>;
  resetDatastore: () => Promise<boolean>;
  showAllTipsForTesting: () => Promise<void>;
  hideAllTipsForTesting: () => Promise<void>;
}

// Absent on Android and on any build made before the module was added, so every
// entry point below has to cope with it being null.
const NativeModule = requireOptionalNativeModule<PapillonTipsNativeModule>("PapillonTips");

/** Whether TipKit is there to show anything — iOS 17 and up. */
export const tipsAreSupported = NativeModule?.isSupported ?? false;

/**
 * Sets TipKit up for the process. Optional — the first tip that mounts does it
 * with defaults — but calling it at launch is the only way to choose the
 * display frequency. Resolves `false` when TipKit was already configured.
 */
export async function configureTips(displayFrequency?: TipDisplayFrequency): Promise<boolean> {
  return (await NativeModule?.configure(displayFrequency)) ?? false;
}

/**
 * Puts a tip away for good, whether or not it is on screen. Use it when the
 * user does the thing the tip teaches: the hint has served its purpose and
 * should not come back on the next launch.
 */
export async function invalidateTip(
  tipId: string,
  reason: TipInvalidationReason = "actionPerformed"
): Promise<void> {
  await NativeModule?.invalidate(tipId, reason);
}

/**
 * Forgets every dismissal. TipKit only allows this before it is configured, so
 * it is for a debug menu at launch and nothing else.
 */
export async function resetTipsDatastore(): Promise<boolean> {
  return (await NativeModule?.resetDatastore()) ?? false;
}

/**
 * Puts every tip back on screen, ignoring both its own rules and any dismissal
 * already on file. Lasts until `hideAllTips()` or the next launch — a debug
 * affordance, never shipping behaviour.
 */
export async function showAllTips(): Promise<void> {
  await NativeModule?.showAllTipsForTesting();
}

/** Lifts `showAllTips()` and puts every tip away again. */
export async function hideAllTips(): Promise<void> {
  await NativeModule?.hideAllTipsForTesting();
}
