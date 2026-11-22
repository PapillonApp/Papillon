import {
  type Account,
  type PrepaProvider,
  type PrepaServiceSelection,
  Services,
} from "./types";

export type PrepaCategory = keyof PrepaServiceSelection;

const supported: Record<PrepaCategory, readonly PrepaProvider[]> = {
  timetable: [Services.CAHIER_DE_PREPA, Services.PRONOTE],
  grades: [Services.PREPA_PLUS, Services.PRONOTE],
  homework: [Services.CAHIER_DE_PREPA, Services.PRONOTE],
};

export function supportsPrepaCategory(
  category: PrepaCategory,
  provider?: PrepaProvider
): boolean {
  return provider !== undefined && supported[category].includes(provider);
}

export function getPrepaServiceIds(
  account: Account | undefined,
  category: PrepaCategory
): string[] {
  const provider = isPrepaAccount(account)
    ? getPrepaSelection(account)[category]
    : undefined;
  return (
    account?.services
      .filter(
        service => provider === undefined || service.serviceId === provider
      )
      .map(service => service.id) ?? []
  );
}

export function getPrepaSelection(
  account?: Account
): Partial<PrepaServiceSelection> {
  if (!account) {
    return {};
  }
  const providerFor = (category: PrepaCategory) => {
    const selected = account.prepaServices?.[category];
    if (supportsPrepaCategory(category, selected)) {
      return selected;
    }
    return supported[category].find(provider =>
      account.services.some(link => link.serviceId === provider)
    );
  };
  return {
    timetable: providerFor("timetable"),
    grades: providerFor("grades"),
    homework: providerFor("homework"),
  };
}

export function isPrepaAccount(account?: Account): boolean {
  return Boolean(
    account?.prepaServices ||
    account?.services.some(
      service =>
        service.serviceId === Services.CAHIER_DE_PREPA ||
        service.serviceId === Services.PREPA_PLUS
    )
  );
}
