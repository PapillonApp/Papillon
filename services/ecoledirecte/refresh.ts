import { Account as EDAccount, Client, InvalidCredentials, Require2FA } from "@blockshub/blocksdirecte";

import { runAuthRefresh } from "@/services/auth/coordinator";
import { AuthErrorClassifier } from "@/services/auth/types";
import { useAccountStore } from "@/stores/account";
import { Auth } from "@/stores/account/types";

export function selectEDAccountIndex(
  accounts: EDAccount[],
  preferredAccountId?: string | number
): number {
  if (preferredAccountId !== undefined && preferredAccountId !== "") {
    const byIdIndex = accounts.findIndex(
      a => String(a.id) === String(preferredAccountId)
    );
    if (byIdIndex !== -1) {
      return byIdIndex;
    }
  }

  const mainStudentIndex = accounts.findIndex(
    a => a.main && a.typeCompte === "E"
  );
  if (mainStudentIndex !== -1) {
    return mainStudentIndex;
  }

  const studentIndex = accounts.findIndex(a => a.typeCompte === "E");
  if (studentIndex !== -1) {
    return studentIndex;
  }

  return 0;
}

export function extractEDClassName(account: EDAccount): string | undefined {
  return (
    account.profile?.classe?.libelle?.trim() ||
    account.profile?.classe?.code?.trim() ||
    undefined
  );
}

const classifyEDError: AuthErrorClassifier = e => {
  if (e instanceof Require2FA) {
    return "security_challenge";
  }
  if (e instanceof InvalidCredentials) {
    return "credential_rejected";
  }
  return undefined;
};

export function refreshEDAccount(accountId: string, credentials: Auth): Promise<{auth: Auth, account: Client }> {
  return runAuthRefresh(accountId, credentials, { rotatesCredential: true, classifyError: classifyEDError }, async tracker => {
    // The caller's copy can be outdated if another login already rotated the token
    const stored = tracker.readCredentials();
    const client = new Client();
    const storedCn = typeof stored.additionals?.["cn"] === "string" ? stored.additionals["cn"] : undefined;
    const storedCv = typeof stored.additionals?.["cv"] === "string" ? stored.additionals["cv"] : undefined;

    // A single request both consumes the token and returns the next one.
    tracker.credentialSent(stored);
    tracker.awaitingNewCredential();
    const refreshed = await client.auth.refreshToken(
      stored.additionals!["username"] as string,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      "E" as any,
      stored.additionals!["token"] as string,
      storedCn || undefined,
      storedCv || undefined,
      stored.additionals!["deviceUUID"] as string
    );

    const accountIndex = selectEDAccountIndex(
      refreshed.accounts,
      stored.additionals?.["accountId"]
    );
    client.auth.setAccount(accountIndex);
    const account = client.auth.getAccount();

    const auth: Auth = {
      additionals: {
        username: stored.additionals!["username"],
        token: account.accessToken,
        cn: storedCn ?? "",
        cv: storedCv ?? "",
        deviceUUID: stored.additionals!["deviceUUID"],
        accountId: account.id,
        modules: JSON.stringify(account.modules ?? []),
      }
    };

    tracker.credentialReceived(auth);

    const nextClassName = extractEDClassName(account);
    const nextSchoolName =
      account.nomEtablissement?.trim() ||
      account.profile?.nomEtablissement?.trim() ||
      undefined;
    const existingAccount = useAccountStore
      .getState()
      .accounts.find(acc => acc.services.some(service => service.id === accountId));

    if (
      existingAccount &&
      ((nextClassName && existingAccount.className !== nextClassName) ||
        (nextSchoolName && existingAccount.schoolName !== nextSchoolName))
    ) {
      useAccountStore.setState(state => ({
        accounts: state.accounts.map(acc => {
          if (acc.id !== existingAccount.id) {
            return acc;
          }
          return {
            ...acc,
            className: nextClassName ?? acc.className,
            schoolName: nextSchoolName ?? acc.schoolName,
            updatedAt: new Date().toISOString(),
          };
        }),
      }));
    }

    return {
      auth,
      account: client
    };
  });
}
