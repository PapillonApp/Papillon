import React, { useState } from "react";
import type { Screen } from "@/router/helpers/types";
import { View, ActivityIndicator, ScrollView, Dimensions } from "react-native";

import {
  type DoubleAuthChallenge,
  DoubleAuthRequired,
  initDoubleAuth,
  login,
  type Session,
  checkDoubleAuth,
  setAccessToken
} from "pawdirecte";
import uuid from "@/utils/uuid-v4";

import { useAccounts, useCurrentAccount } from "@/stores/account";
import { AccountService, type EcoleDirecteAccount } from "@/stores/account/types";
import defaultPersonalization from "@/services/ecoledirecte/default-personalization";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import ButtonCta from "@/components/FirstInstallation/ButtonCta";
import BottomSheet from "@/components/Modals/PapillonBottomSheet";
import {NativeText} from "@/components/Global/NativeComponents";
import Reanimated, {
  FlipInXDown,
  LinearTransition,
  useSharedValue
} from "react-native-reanimated";
import DuoListPressable from "@/components/FirstInstallation/DuoListPressable";
import {SvgFromXml} from "react-native-svg";
import LoginView from "@/components/Templates/LoginView";

const EcoleDirecteCredentials: Screen<"EcoleDirecteCredentials"> = ({ navigation }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [cachedPassword, setCachedPassword] = useState<string>("");
  const [doubleAuthChallenge, setDoubleAuthChallenge] = useState<DoubleAuthChallenge | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const scrollY = useSharedValue(0);

  const theme = useTheme();

  const createStoredAccount = useAccounts(store => store.create);
  const switchTo = useCurrentAccount(store => store.switchTo);

  const handleLogin = async (username: string, password: string, currentSession = session) => {
    try {
      setLoading(true);
      setError(null);
      if (username === "demo" && password === "demo") {
        setDoubleAuthChallenge({answers: ["demo00", "demo01", "demo02", "demo03", "demo04", "demo05", "demo06", "demo07", "demo08", "demo09"], question: "Ceci est une question de démonstration"});
      }

      if (currentSession === null) {
        const accountID = uuid();
        currentSession = { username, device_uuid: accountID };
        setCachedPassword(password);
      }

      const accounts = await login(currentSession, password ? password : cachedPassword);
      const account = accounts[0]; // NOTE: We only support single accounts for now. //TODO: Support multiple accounts in ED

      setAccessToken(currentSession, account);
      const local_account: EcoleDirecteAccount = {
        instance: {},

        localID: currentSession.device_uuid,
        service: AccountService.EcoleDirecte,

        isExternal: false,
        linkedExternalLocalIDs: [],

        identity: {
          firstName: account.firstName,
          lastName: account.lastName,
          civility: account.gender,
          phone: [account.phone],
          email: [account.email],
        },

        name: `${account.lastName} ${account.firstName}`,
        studentName: {
          first: account.firstName,
          last: account.lastName,
        },
        className: account.class.short,
        schoolName: account.schoolName,

        authentication: {
          session: currentSession,
          account
        },
        personalization: await defaultPersonalization(account),
        profilePictureURL: "",

        serviceData: {},
        providers: []
      };


      createStoredAccount(local_account);
      setLoading(false);
      switchTo(local_account);

      // We need to wait a tick to make sure the account is set before navigating.
      queueMicrotask(() => {
        // Reset the navigation stack to the "Home" screen.
        // Prevents the user from going back to the login screen.
        navigation.reset({
          index: 0,
          routes: [{ name: "AccountCreated" }],
        });
      });
    }
    catch (error) {
      if (error instanceof DoubleAuthRequired) {
        const challenge = await initDoubleAuth(currentSession!).catch((e) => {
          console.error(e);
          setError("Une erreur est survenue lors de la récupération des questions pour la double authentification");
          return null;
        }).finally(() => setLoading(false));

        setDoubleAuthChallenge(challenge);
        setSession(currentSession);
        return;
      }
      if (error instanceof Error) {
        if (error.message === "Bad credentials, no token found in response") setError("Nom d'utilisateur ou mot de passe incorrect!");
        else setError(error.message);
      }
      else {
        setError("Erreur inconnue");
      }

      setLoading(false);
      console.error(error);
    }
  };

  const handleChallenge = async (answer: string) => {
    if (!session) {
      console.warn("No session to handle challenge");
      return;
    }

    setLoading(true);
    const currentSession = { ...session };
    const correct = await checkDoubleAuth(currentSession, answer).finally(() => setLoading(false));

    if (!correct) {
      setError("Mauvaise réponse, réessaye");
      setDoubleAuthChallenge(null);
      setSession(null);
      return;
    }

    // username et password n'ont pas besoin d'être défini ici
    // car ils sont liés par la session directement.
    queueMicrotask(() => void handleLogin("", "", currentSession));
  };

  return (
    <>
      <LoginView
        serviceIcon={require("@/../assets/images/service_ed.png")}
        serviceName="EcoleDirecte"
        loading={loading}
        error={error}
        onLogin={(username, password) => handleLogin(username, password)}
      />

      {doubleAuthChallenge !== null && (
        <BottomSheet
          opened={true}
          setOpened={() => setDoubleAuthChallenge(null)}
        >
          <View>
            <View style={{padding: 16, height: 60 + 16, paddingBottom: 0}}>
              <NativeText variant={"title"}>{doubleAuthChallenge.question}</NativeText>
              <NativeText variant={"subtitle"}>Réponds à la question suivante pour continuer ton authentification</NativeText>
            </View>
            <SvgFromXml
              xml={`
                <svg xmlns="http://www.w3.org/2000/svg" fill="${theme.colors.text}" width="10000">
                    <rect x="0" y="0" width="1000000" height="16" fill="url(#gradient)"/>
                    <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="${theme.colors.background}"/>
                      <stop offset="100%" stop-color="${theme.colors.background}" stop-opacity="0"/>
                    </linearGradient>
                </svg>
              `}
              style={{
                position: "absolute",
                top: 60 + 16,
                left: 0,
                height: 16,
                width: Dimensions.get("screen").width,
                zIndex: 999,
                pointerEvents: "none",
              }}
            />
            <ScrollView
              style={{height: 450}}
              showsVerticalScrollIndicator={false}
            >
              <Reanimated.View style={{display: "flex", gap: 9, padding: 16, marginTop: scrollY, paddingBottom: 50 + 32}}>
                {doubleAuthChallenge.answers.map((answer, index) => (
                  <Reanimated.View
                    style={{
                      width: "100%",
                      height: 50,
                    }}
                    layout={LinearTransition}
                    entering={FlipInXDown.springify().delay(50 * index)}
                  >
                    <DuoListPressable
                      text={answer}
                      enabled={selectedAnswer === answer}
                      onPress={() => setSelectedAnswer(answer)}
                    />
                  </Reanimated.View>
                ))}
              </Reanimated.View>
            </ScrollView>
            <View style={{padding: 16, position: "absolute", height: 50 + 32, bottom: -5}}>
              <SvgFromXml
                xml={`
                <svg xmlns="http://www.w3.org/2000/svg" fill="${theme.colors.text}" width="10000">
                    <rect x="0" y="0" width="1000000" height="100%" fill="url(#gradient)"/>
                    <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="${theme.colors.background}" stop-opacity="0"/>
                      <stop offset="20%" stop-color="${theme.colors.background}"/>
                    </linearGradient>
                </svg>
              `}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  bottom: 0,
                  width: Dimensions.get("screen").width,
                }}
              />
              <ButtonCta
                value="Valider"
                onPress={() => void handleChallenge(selectedAnswer!)}
                primary={!loading}
                icon={loading ? <ActivityIndicator /> : void 0}
                disabled={selectedAnswer === null}
              />
            </View>
          </View>
        </BottomSheet>
      )}
    </>
  );
};

export default EcoleDirecteCredentials;
