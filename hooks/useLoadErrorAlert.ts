import { useEffect, useRef } from "react";

import type { ServiceFailure } from "@/services/shared/types";
import { useAlert } from "@/ui/components/AlertProvider";

interface LoadErrorAlertOptions {
  /** What could not be loaded, e.g. "ton emploi du temps". */
  subject: string;
  /** The failure that stopped the load, if any. */
  error?: Error | null;
  /** Per-service failures reported by the manager, if any. */
  failures?: ServiceFailure[];
  /** Whether some data is on screen anyway (from the cache). */
  hasData?: boolean;
}

const signatureOf = (error?: Error | null, failures?: ServiceFailure[]) => {
  if (error) { return `error:${error.message}`; }
  if (failures && failures.length > 0) {
    return `failures:${failures.map(f => `${f.displayName}:${String(f.reason)}`).join("|")}`;
  }
  return null;
};

/**
 * Tells the user when data could not be loaded, instead of leaving a screen
 * looking simply empty. The same failure is only reported once: a pager that
 * re-renders on every swipe would otherwise raise it again and again.
 */
export function useLoadErrorAlert({
  subject,
  error,
  failures,
  hasData = false,
}: LoadErrorAlertOptions) {
  const alert = useAlert();
  const lastReported = useRef<string | null>(null);

  useEffect(() => {
    const signature = signatureOf(error, failures);

    if (!signature) {
      lastReported.current = null;
      return;
    }

    if (lastReported.current === signature) { return; }
    lastReported.current = signature;

    const serviceName = failures?.[0]?.displayName;
    const technical = error?.message ?? (failures ?? []).map(f => String(f.reason)).join("\n");

    alert.showAlert({
      title: "Impossible de récupérer tes données",
      description: hasData
        ? `Nous n'avons pas pu mettre à jour ${subject}${serviceName ? ` depuis ${serviceName}` : ""}. Les informations affichées sont celles de la dernière synchronisation.`
        : `Nous n'avons pas pu récupérer ${subject}${serviceName ? ` depuis ${serviceName}` : ""}. Vérifie ta connexion, puis réessaie en tirant la page vers le bas.`,
      icon: "GlobeCross",
      color: "#D60046",
      withoutNavbar: true,
      technical: technical || undefined,
    });
  }, [alert, error, failures, hasData, subject]);
}
