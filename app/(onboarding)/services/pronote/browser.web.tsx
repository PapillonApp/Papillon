import {
  AccountKind,
  createSessionHandle,
  DoubleAuthMode,
  finishLoginManually,
  loginToken,
  SecurityError,
  securitySave,
  securitySource,
  SessionHandle,
} from "@blockshub/pawnote-lts";
import { router, useNavigation } from "expo-router";
import { useRoute, useTheme } from "expo-router/react-navigation";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Modal, Platform, View } from "react-native";
import { useTranslation } from "react-i18next";

import { Pronote2FAModal } from "@/app/(onboarding)/services/pronote/2fa";
import { useAccountStore } from "@/stores/account";
import { Services } from "@/stores/account/types";
import Button from "@/ui/components/Button";
import Typography from "@/ui/components/Typography";
import { isTauriDesktop } from "@/utils/network/fetch";
import { customFetcher } from "@/utils/pronote/fetcher";
import { GetIdentityFromPronoteUsername } from "@/utils/pronote/name";
import uuid from "@/utils/uuid/uuid";

type LoginState = { status?: number; login?: string; mdp?: string };
type EntMessage = { type?: string; data?: LoginState };

export default function PronoteENTLoginWeb() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { params } = useRoute();
  const {
    url = "",
    school,
    relinkAccountId,
    relinkServiceId,
    relinkDeviceUUID,
  } = (params ?? {}) as {
    url?: string;
    school?: { name?: string };
    relinkAccountId?: string;
    relinkServiceId?: string;
    relinkDeviceUUID?: string;
  };
  const normalizedUrl = url.trim().replace(/\/+$/, "");
  const baseURL = (() => {
    try {
      return new URL(normalizedUrl).origin;
    } catch {
      return "";
    }
  })();
  const infoMobileURL = `${normalizedUrl}/InfoMobileApp.json?id=0D264427-EEFC-4810-A9E9-346942A862A4`;
  const deviceUUID = useRef(relinkDeviceUUID || uuid()).current;
  const receivedLogin = useRef(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [doubleAuthError, setDoubleAuthError] = useState<SecurityError | null>(null);
  const [doubleAuthSession, setDoubleAuthSession] = useState<SessionHandle | null>(null);
  const [challengeModalVisible, setChallengeModalVisible] = useState(false);

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    if (!isTauriDesktop() || !normalizedUrl) {
      setErrorMessage("La connexion Pronote intégrée est disponible dans l’application Windows. Tu peux aussi saisir directement l’adresse PRONOTE.");
      return;
    }

    let cancelled = false;
    let unlisten: (() => void) | undefined;
    let closePopup: (() => Promise<void>) | undefined;

    void (async () => {
      try {
        const [{ invoke }, { listen }] = await Promise.all([
          import("@tauri-apps/api/core"),
          import("@tauri-apps/api/event"),
        ]);
        unlisten = await listen<string>("pronote-ent-message", event => {
          if (cancelled) return;
          let message: EntMessage;
          try {
            message = JSON.parse(event.payload) as EntMessage;
          } catch {
            setErrorMessage("La réponse de la page de connexion PRONOTE est invalide.");
            return;
          }

          if (message.type === "pronote.connectionError") {
            setErrorMessage("La connexion à PRONOTE est impossible. Vérifie l’adresse de ton établissement et réessaie.");
            return;
          }

          if (message.type !== "pronote.loginState" || message.data?.status !== 0 || receivedLogin.current) return;
          receivedLogin.current = true;
          void completeLogin(message.data).catch(error => {
            setErrorMessage(error instanceof Error ? error.message : "Une erreur est survenue pendant la connexion.");
          });
        });
        closePopup = async () => { await invoke("close_pronote_ent_window"); };
        await invoke("open_pronote_ent_window", {
          url: normalizedUrl,
          baseUrl: baseURL,
          infoMobileUrl: infoMobileURL,
          deviceUuid: deviceUUID,
        });
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Impossible d’ouvrir la connexion PRONOTE.");
      }
    })();

    async function completeLogin(loginState: LoginState) {
      if (!loginState.login || !loginState.mdp) {
        setErrorMessage("PRONOTE n’a pas fourni les informations nécessaires pour terminer la connexion.");
        return;
      }

      const session = createSessionHandle(customFetcher);
      let refresh: import("@blockshub/pawnote-lts").RefreshInformation | undefined;
      try {
        refresh = await loginToken(session, {
          url: normalizedUrl,
          kind: AccountKind.STUDENT,
          username: loginState.login,
          token: loginState.mdp,
          deviceUUID,
        });
      } catch (error) {
        if (error instanceof SecurityError && !error.handle.shouldCustomPassword && !error.handle.shouldCustomDoubleAuth) {
          if (error.handle.shouldEnterSource && !error.handle.shouldEnterPIN) {
            const source = "Scola";
            await securitySource(session, source);
            await securitySave(session, error.handle, {
              mode: DoubleAuthMode.MGDA_NotificationSeulement,
              deviceName: source,
            });
            const context = error.handle.context;
            refresh = await finishLoginManually(
              session,
              context.authentication,
              context.identity,
              context.initialUsername,
            );
          } else {
            await closePopup?.();
            setDoubleAuthSession(session);
            setDoubleAuthError(error);
            setChallengeModalVisible(true);
            return;
          }
        } else {
          setErrorMessage(error instanceof Error ? error.message : "Une erreur est survenue pendant la connexion.");
          return;
        }
      }

      if (!refresh) {
        setErrorMessage("PRONOTE n’a pas renvoyé de session valide.");
        return;
      }

      const user = session.user;
      const resource = user.resources?.[0];
      if (!resource) {
        setErrorMessage("La session PRONOTE ne contient aucun profil élève.");
        return;
      }
      const { firstName, lastName } = GetIdentityFromPronoteUsername(user.name);
      const now = new Date().toISOString();
      const auth = {
        accessToken: refresh.token,
        refreshToken: refresh.token,
        additionals: {
          ...refresh,
          instanceURL: refresh.url,
          deviceUUID,
        },
      };
      const store = useAccountStore.getState();

      if (relinkServiceId && relinkAccountId) {
        store.updateServiceAuthData(relinkServiceId, auth);
        store.setLastUsedAccount(relinkAccountId);
      } else {
        store.addAccount({
          id: deviceUUID,
          firstName,
          lastName,
          schoolName: resource.establishmentName,
          className: resource.className,
          customisation: { profilePicture: "", serviceProfilePicture: "", subjects: {} },
          services: [{
            id: deviceUUID,
            auth,
            serviceId: Services.PRONOTE,
            createdAt: now,
            updatedAt: now,
          }],
          createdAt: now,
          updatedAt: now,
        });
        store.setLastUsedAccount(deviceUUID);
      }

      await closePopup?.();
      router.replace("/");
    }

    return () => {
      cancelled = true;
      unlisten?.();
      void closePopup?.();
    };
  }, [baseURL, deviceUUID, infoMobileURL, normalizedUrl, navigation, relinkAccountId, relinkServiceId]);

  if (!isTauriDesktop() && Platform.OS === "web") {
    return <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 16 }}>
      <Typography variant="h4" align="center">Connexion PRONOTE sur PC</Typography>
      <Typography variant="body1" color="textSecondary" align="center">La connexion via l’ENT nécessite l’application Papillon pour Windows.</Typography>
      <Button title={t("ONBOARDING_GO_BACK", "Retour")} onPress={() => router.back()} />
    </View>;
  }

  return <View style={{ flex: 1, backgroundColor: colors.card, alignItems: "center", justifyContent: "center", padding: 24, gap: 16 }}>
    {errorMessage ? <>
      <Typography variant="h4" align="center">Connexion impossible</Typography>
      <Typography variant="body1" color="textSecondary" align="center">{errorMessage}</Typography>
      <Button title={t("ONBOARDING_GO_BACK", "Retour")} onPress={() => router.back()} />
    </> : <>
      <ActivityIndicator color={colors.primary} />
      <Typography variant="h4" align="center">{t("ONBOARDING_LOGIN_TO")} {school?.name ?? t("ONBOARDING_YOUR_SCHOOL")}</Typography>
      <Typography variant="body1" color="textSecondary" align="center">La fenêtre sécurisée de connexion à l’ENT est ouverte. Termine la connexion pour revenir à Papillon.</Typography>
      <Button title={t("ONBOARDING_GO_BACK", "Retour")} onPress={() => router.back()} style={{ marginTop: 8 }} />
    </>}
    <Modal visible={challengeModalVisible} animationType="slide" onRequestClose={() => setChallengeModalVisible(false)}>
      <Pronote2FAModal
        doubleAuthSession={doubleAuthSession}
        doubleAuthError={doubleAuthError}
        setChallengeModalVisible={setChallengeModalVisible}
        deviceId={deviceUUID}
        relinkAccountId={relinkAccountId}
        relinkServiceId={relinkServiceId}
      />
    </Modal>
  </View>;
}
