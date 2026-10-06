import { Auth, CustomisationStorage } from "./types";

export interface PendingPronoteAuth {
  auth: Auth;
  firstName: string;
  lastName: string;
  schoolName: string;
  className: string;
  customisation: CustomisationStorage;
}

let pendingPronoteAuth: PendingPronoteAuth | null = null;

export function setPendingPronoteAuth(auth: PendingPronoteAuth) {
  pendingPronoteAuth = auth;
}

export function consumePendingPronoteAuth(): PendingPronoteAuth | null {
  const auth = pendingPronoteAuth;
  pendingPronoteAuth = null;
  return auth;
}

export function clearPendingPronoteAuth() {
  pendingPronoteAuth = null;
}
