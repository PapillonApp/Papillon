import { router } from "expo-router";
import { getProfile } from "@studentsphere/linksign";

import { useAccountStore } from "@/stores/account";
import { useSettingsStore } from "@/stores/settings";
import { Account, Services } from "@/stores/account/types";

export async function completeEdusignLogin({
  token,
  refreshToken,
  localDeviceId,
  selectedSchoolName,
  authSession,
}: {
  token: string;
  refreshToken?: string;
  localDeviceId: string;
  selectedSchoolName?: string;
  authSession?: any;
  navigation?: unknown;
}) {
  let profile = authSession;
  if (!profile || !profile.FIRSTNAME) {
    profile = await getProfile(token, localDeviceId);
  }

  if (!profile || !profile.FIRSTNAME) {
    throw new Error("Failed to retrieve profile");
  }

  const createdAt = new Date().toISOString();
  const store = useAccountStore.getState();
  const account: Account = {
    id: localDeviceId,
    firstName: profile.FIRSTNAME,
    lastName: profile.LASTNAME,
    schoolName: selectedSchoolName || profile.SCHOOL?.NAME || "",
    services: [
      {
        id: localDeviceId,
        auth: {
          accessToken: token,
          refreshToken: refreshToken || "",
        },
        serviceId: Services.EDUSIGN,
        createdAt,
        updatedAt: createdAt,
      },
    ],
    createdAt,
    updatedAt: createdAt,
  };

  store.addAccount(account);
  store.setLastUsedAccount(localDeviceId);

  const settingsStore = useSettingsStore.getState();
  const disabledTabs = settingsStore.personalization.disabledTabs || [];
  const newDisabledTabs = Array.from(new Set([...disabledTabs, "news", "grades"]));
  settingsStore.mutateProperty("personalization", { disabledTabs: newDisabledTabs });

  if (router.canDismiss()) {
    router.dismissAll();
  }
  router.replace("/" as any);
}
