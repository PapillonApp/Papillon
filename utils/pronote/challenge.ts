import { SecurityError, SessionHandle } from "@blockshub/pawnote-lts";

export interface PronoteChallenge {
  session: SessionHandle;
  error: SecurityError;
  deviceUUID: string;
  relinkAccountId?: string;
  relinkServiceId?: string;
}

let pendingChallenge: PronoteChallenge | null = null;

export const setPendingPronoteChallenge = (challenge: PronoteChallenge): void => {
  pendingChallenge = challenge;
};

export const consumePendingPronoteChallenge = (): PronoteChallenge | null => {
  const challenge = pendingChallenge;
  pendingChallenge = null;
  return challenge;
};

export const clearPendingPronoteChallenge = (): void => {
  pendingChallenge = null;
};
