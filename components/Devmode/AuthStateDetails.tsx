import React from "react";

import { AuthStep, ServiceAuthState } from "@/services/auth/types";
import { useAuthStateStore } from "@/stores/authState";
import Typography from "@/ui/new/Typography";

const CLOCK_INTERVAL_MS = 5000;

const formatDelay = (ms: number) => {
  const seconds = Math.round(Math.abs(ms) / 1000);
  return seconds < 120 ? `${seconds} s` : `${Math.round(seconds / 60)} min`;
};

const describeAuthState = (state: ServiceAuthState | undefined, now: number): string => {
  if (!state) {
    return "Aucune connexion enregistrée";
  }

  const parts = [`${state.step}, il y a ${formatDelay(now - state.updatedAt)}`];
  if (state.step === AuthStep.Failed && state.failure) {
    parts.push(`${state.failure.reason} à l'étape ${state.failure.step}`);
    if (state.failure.step === AuthStep.AwaitingNewCredential) {
      parts.push("jeton peut-être consommé");
    }
  }
  if (state.nextRetryAt && state.nextRetryAt > now) {
    parts.push(`nouvel essai dans ${formatDelay(state.nextRetryAt - now)}`);
  }
  return parts.join(" · ");
};

// Its own component so the clock re-renders these lines, not the whole devmode screen.
export default function AuthStateDetails({ serviceId }: { serviceId: string }) {
  const state = useAuthStateStore(store => store.services[serviceId]);
  const [now, setNow] = React.useState(Date.now());
  React.useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), CLOCK_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <Typography variant="body2" color="textSecondary">
        {describeAuthState(state, now)}
      </Typography>
      {state?.failure ? (
        <Typography variant="caption" color="textSecondary" numberOfLines={3}>
          {state.failure.message}
        </Typography>
      ) : null}
      <Typography variant="caption" color="textSecondary">
        Toucher pour réinitialiser et se reconnecter
      </Typography>
    </>
  );
}
