import { router } from "expo-router";
import React, { useEffect, useState } from "react";

import { consumePendingPronoteChallenge, PronoteChallenge } from "@/utils/pronote/challenge";

import { Pronote2FAModal } from "./2fa";

export default function PronoteChallengeScreen() {
  const [challenge, setChallenge] = useState<PronoteChallenge | null>(null);

  useEffect(() => {
    const pending = consumePendingPronoteChallenge();

    if (!pending) {
      router.back();
      return;
    }

    setChallenge(pending);
  }, []);

  if (!challenge) {
    return null;
  }

  return (
    <Pronote2FAModal
      doubleAuthSession={challenge.session}
      doubleAuthError={challenge.error}
      setChallengeModalVisible={(visible) => {
        if (!visible) {
          router.back();
        }
      }}
      deviceId={challenge.deviceUUID}
      relinkAccountId={challenge.relinkAccountId}
      relinkServiceId={challenge.relinkServiceId}
    />
  );
}
