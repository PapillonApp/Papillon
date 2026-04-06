import { Balance } from "@/services/shared/balance";
import { QRCode, QRType } from "@/services/shared/canteen";
import { Auth } from "@/stores/account/types";

const ED_MODULES_KEY = "edModules";
const ED_BADGE_NUMBER_KEY = "edCanteenBadgeNumber";
export const ED_CLASS_NAME_KEY = "edClassName";
export const ED_BADGE_LABEL = "Badge cantine";
const ED_BADGE_MODULE_CODE = "CANTINE_BARCODE";
const ED_RESERVATIONS_MODULE_CODE = "RESERVATIONS";
const ED_WEEKDAY_LABELS = ["L", "M", "M", "J", "V", "S", "D"] as const;

interface EDModule {
  code?: string;
  enable?: boolean;
  params?: Record<string, string | number | boolean | undefined>;
}

export interface EDCanteenWeekDayStatus {
  label: (typeof ED_WEEKDAY_LABELS)[number];
  enabled: boolean;
}

export interface EDCanteenBadgeDetails {
  regime?: string;
  lunch: EDCanteenWeekDayStatus[];
  dinner: EDCanteenWeekDayStatus[];
  hasSchedule: boolean;
}

export function getEDModulesAdditionals(
  modules?: EDModule[],
  options?: {
    className?: string;
  }
): Record<string, string> {
  const normalizedModules = Array.isArray(modules) ? modules : [];
  const additionals: Record<string, string> = {
    [ED_MODULES_KEY]: JSON.stringify(normalizedModules),
  };
  const badgeNumber = getEDBadgeNumberFromModules(normalizedModules);
  const className = normalizeString(options?.className);

  if (badgeNumber) {
    additionals[ED_BADGE_NUMBER_KEY] = badgeNumber;
  }

  if (className) {
    additionals[ED_CLASS_NAME_KEY] = className;
  }

  return additionals;
}

export function fetchEDCanteenBalances(accountId: string, auth: Auth): Balance[] {
  if (!hasEDCanteenBadge(auth.additionals)) {
    return [];
  }

  return [
    {
      createdByAccount: accountId,
      amount: 0,
      currency: "",
      lunchRemaining: 0,
      lunchPrice: 0,
      label: ED_BADGE_LABEL,
    },
  ];
}

export function fetchEDQRCode(accountId: string, auth: Auth): QRCode {
  return {
    type: QRType.Barcode,
    data: getEDBadgeNumber(auth.additionals) ?? "",
    createdByAccount: accountId,
  };
}

export function hasEDCanteenBadge(
  additionals?: Record<string, string | number>
): boolean {
  return typeof getEDBadgeNumber(additionals) === "string";
}

export function getEDBadgeNumber(
  additionals?: Record<string, string | number>
): string | undefined {
  const directBadgeNumber = normalizeString(additionals?.[ED_BADGE_NUMBER_KEY]);
  if (directBadgeNumber) {
    return directBadgeNumber;
  }

  return getEDBadgeNumberFromModules(getEDModules(additionals));
}

export function getEDModules(
  additionals?: Record<string, string | number>
): EDModule[] {
  const rawModules = additionals?.[ED_MODULES_KEY];
  if (typeof rawModules !== "string") {
    return [];
  }

  try {
    const parsedModules = JSON.parse(rawModules);
    return Array.isArray(parsedModules) ? parsedModules : [];
  } catch {
    return [];
  }
}

export function getEDClassName(
  additionals?: Record<string, string | number>
): string | undefined {
  return normalizeString(additionals?.[ED_CLASS_NAME_KEY]);
}

export function getEDCanteenBadgeDetails(
  additionals?: Record<string, string | number>
): EDCanteenBadgeDetails | null {
  const params = getEDReservationsParams(additionals);
  if (!params) {
    return null;
  }

  const lunch = getWeekStatuses(params, "repasmidi");
  const dinner = getWeekStatuses(params, "repassoir");
  const regime = normalizeString(params.regime);

  return {
    regime,
    lunch,
    dinner,
    hasSchedule: lunch.some((day) => day.enabled) || dinner.some((day) => day.enabled),
  };
}

function getEDBadgeNumberFromModules(modules: EDModule[]): string | undefined {
  const badgeModule = modules.find(
    (module) => module.code === ED_BADGE_MODULE_CODE && module.enable
  );

  return normalizeString(badgeModule?.params?.numeroBadge);
}

function getEDReservationsParams(
  additionals?: Record<string, string | number>
): Record<string, string | number | boolean | undefined> | undefined {
  const reservationsModule = getEDModules(additionals).find(
    (module) =>
      module.code === ED_RESERVATIONS_MODULE_CODE
      && module.params
      && Object.keys(module.params).length > 0
  );

  return reservationsModule?.params;
}

function getWeekStatuses(
  params: Record<string, string | number | boolean | undefined>,
  prefix: "repasmidi" | "repassoir"
): EDCanteenWeekDayStatus[] {
  return ED_WEEKDAY_LABELS.map((label, index) => ({
    label,
    enabled: normalizeBoolean(params[`${prefix}_${index + 1}`]),
  }));
}

function normalizeBoolean(value?: string | number | boolean): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value === 1;
  }

  if (typeof value === "string") {
    return ["1", "true", "yes", "oui"].includes(value.trim().toLowerCase());
  }

  return false;
}

function normalizeString(value?: string | number | boolean): string | undefined {
  if (typeof value === "number") {
    return String(value);
  }

  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }

  return undefined;
}