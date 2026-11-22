import type {
  Account,
  PrepaProvider,
  PrepaServiceSelection,
  ServiceAccount,
} from "./types";

type Profile = Pick<
  Account,
  "firstName" | "lastName" | "schoolName" | "className" | "customisation"
>;

export class PrepaLogin {
  private readonly providers: PrepaProvider[];
  readonly services: ServiceAccount[] = [];
  profile?: Profile;

  constructor(
    readonly selection: PrepaServiceSelection,
    linked: readonly ServiceAccount[] = [],
    readonly returnTo:
      | "/(onboarding)/prepa"
      | "/(settings)/prepaProviders" = "/(onboarding)/prepa"
  ) {
    this.providers = [
      ...new Set([selection.timetable, selection.grades, selection.homework]),
    ].filter(
      provider => !linked.some(service => service.serviceId === provider)
    );
  }

  get next(): PrepaProvider | undefined {
    return this.providers[this.services.length];
  }

  add(service: ServiceAccount, profile?: Profile) {
    if (service.serviceId !== this.next) {
      return false;
    }
    this.services.push(service);
    this.profile ??= profile;
    return true;
  }
}

// Credentials remain in memory until every selected provider signs in.
export const pendingPrepaLogins = new Map<string, PrepaLogin>();
