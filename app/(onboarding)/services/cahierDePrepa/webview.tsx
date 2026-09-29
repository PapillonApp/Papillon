import { router } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform } from "react-native";
import type { WebViewMessageEvent } from "react-native-webview";

import OnboardingWebView from "@/app/(onboarding)/components/OnboardingWebView";
import {
  cahierDePrepaAuthKeys,
  CahierDePrepa,
  normalizeCahierDePrepaUrl,
} from "@/services/cahierDePrepa";
import { useAccountStore } from "@/stores/account";
import { consumePendingPronoteAuth } from "@/stores/account/pendingCombinedLogin";
import { Services } from "@/stores/account/types";
import { useTranslation } from "react-i18next";
import uuid from "@/utils/uuid/uuid";

const CAHIER_DE_PREPA_HOME = "https://cahier-de-prepa.fr/";

type CredentialsPayload = {
  type: "credentials";
  url?: string;
  username: string;
  password: string;
};

type AuthenticatedPayload = {
  type: "authenticated";
  url?: string;
};

type LoginPayload = CredentialsPayload | AuthenticatedPayload;

const AUTHENTICATION_PROBE = `
(function () {
  if (window.__papillonCahierDePrepaProbe) return;
  window.__papillonCahierDePrepaProbe = true;

  var reported = false;
  var credentialsReported = false;

  function readCredentials() {
    var login = document.querySelector('input[name="login"]');
    var password = document.querySelector('input[name="motdepasse"]');
    if (!login || !password || !login.value || !password.value) return;

    credentialsReported = true;
    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: 'credentials',
      url: window.location.href,
      username: login.value,
      password: password.value
    }));
  }

  function checkAuthentication() {
    if (reported) return;

    var bodyText = (document.body && document.body.innerText) || '';
    var nodes = document.querySelectorAll('a, button, input, [role="alert"]');
    var controlsText = '';
    for (var i = 0; i < nodes.length; i += 1) {
      var node = nodes[i];
      controlsText += ' ' + (node.textContent || '') + ' ' +
        (node.value || '') + ' ' +
        (node.getAttribute('aria-label') || '');
    }

    if (/connexion\\s+réussie|connection\\s+réussie|déconnexion|se déconnecter|logout/i.test(bodyText + ' ' + controlsText)) {
      reported = true;
      readCredentials();
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'authenticated',
        url: window.location.href
      }));
    }
  }

  document.addEventListener('submit', readCredentials, true);
  document.addEventListener('click', function (event) {
    var target = event.target;
    if (target && target.closest && target.closest('form')) {
      readCredentials();
    }
  }, true);

  checkAuthentication();
  setInterval(function () {
    if (!credentialsReported) readCredentials();
    checkAuthentication();
  }, 500);
  if (window.MutationObserver && document.body) {
    new MutationObserver(checkAuthentication).observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }
})();
true;
`;

export default function CahierDePrepaWebView() {
  const { t } = useTranslation();
  const handledAuthentication = useRef(false);
  const pendingLogin = useRef<CredentialsPayload | null>(null);
  const [finishing, setFinishing] = useState(false);

  const finishLogin = useCallback(
    async (payload: AuthenticatedPayload) => {
      if (handledAuthentication.current || finishing) return;

      const credentials = pendingLogin.current;
      const baseUrl = payload.url ?? credentials?.url;
      const username = credentials?.username;
      const password = credentials?.password;
      if (!baseUrl || !username || !password) {
        Alert.alert(
          t("Alert_Auth_Error"),
          t("ONBOARDING_ALERT_LOGIN_ABORTED")
        );
        return;
      }

      handledAuthentication.current = true;
      setFinishing(true);
      try {
        const cahierAuth = {
          additionals: {
            [cahierDePrepaAuthKeys.BASE_URL_KEY]:
              normalizeCahierDePrepaUrl(baseUrl),
            [cahierDePrepaAuthKeys.USERNAME_KEY]: username,
            [cahierDePrepaAuthKeys.PASSWORD_KEY]: password,
          },
        };

        const pronoteAuth = consumePendingPronoteAuth();
        if (!pronoteAuth) {
          Alert.alert(
            t("Alert_Auth_Error"),
            t("ONBOARDING_ALERT_LOGIN_ABORTED")
          );
          handledAuthentication.current = false;
          return;
        }

        await new CahierDePrepa(uuid()).refreshAccount(cahierAuth);

        const store = useAccountStore.getState();
        const now = new Date().toISOString();
        store.addAccount({
          id: uuid(),
          firstName: pronoteAuth.firstName,
          lastName: pronoteAuth.lastName,
          schoolName: pronoteAuth.schoolName,
          className: pronoteAuth.className,
          customisation: pronoteAuth.customisation,
          services: [
            {
              id: uuid(),
              auth: pronoteAuth.auth,
              serviceId: Services.PRONOTE,
              createdAt: now,
              updatedAt: now,
            },
            {
              id: uuid(),
              auth: cahierAuth,
              serviceId: Services.CAHIER_DE_PREPA,
              createdAt: now,
              updatedAt: now,
            },
          ],
          createdAt: now,
          updatedAt: now,
        });

        router.dismissAll();
        router.replace("/" as never);
      } catch {
        handledAuthentication.current = false;
        Alert.alert(t("Alert_Auth_Error"), t("ONBOARDING_ALERT_LOGIN_ABORTED"));
      } finally {
        setFinishing(false);
      }
    },
    [finishing, t]
  );

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const payload = JSON.parse(event.nativeEvent.data) as LoginPayload;
        if (payload.type === "credentials") {
          pendingLogin.current = payload;
        } else if (payload.type === "authenticated") {
          void finishLogin(payload);
        }
      } catch {
        // Ignore
      }
    },
    [finishLogin]
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <OnboardingWebView
        source={{ uri: CAHIER_DE_PREPA_HOME }}
        originWhitelist={["https://*"]}
        sharedCookiesEnabled
        thirdPartyCookiesEnabled
        injectedJavaScript={AUTHENTICATION_PROBE}
        onMessage={handleMessage}
      />
    </KeyboardAvoidingView>
  );
}
