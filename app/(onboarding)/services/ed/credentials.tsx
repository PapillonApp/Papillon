import { Papicons } from "@getpapillon/papicons";
import { Client, DoubleAuthQuestions, DoubleAuthResult, Require2FA } from "@blockshub/blocksdirecte";
import { useTheme } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  View,
} from "react-native";
import { useSharedValue, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAccountStore } from "@/stores/account";
import { Account, Services } from "@/stores/account/types";
import AnimatedPressable from "@/ui/components/AnimatedPressable";
import { Dynamic } from "@/ui/components/Dynamic";
import SheetModal from "@/ui/components/SheetModal";
import Stack from "@/ui/components/Stack";
import Button from "@/ui/new/Button";
import Divider from "@/ui/new/Divider";
import List from "@/ui/new/List";
import Typography from "@/ui/new/Typography";
import { PapillonZoomIn, PapillonZoomOut } from "@/ui/utils/Transition";
import adjust from "@/utils/adjustColor";
import uuid from "@/utils/uuid/uuid";
import { ScrollView } from "react-native-gesture-handler";
import LoginView from "../../components/LoginView";
import { useHeaderHeight } from "@react-navigation/elements";

const ANIMATION_DURATION = 170;
const CHALLENGE_COLOR = "#E50052";
export const PlatformPressable = Platform.OS === 'android' ? Pressable : AnimatedPressable;

function EDDoubleAuthModal({
  question,
  visible,
  options,
  selectedIndex,
  submitting,
  onClose,
  onContinue,
  onSelect,
}: {
  question: string;
  visible: boolean;
  options: string[];
  selectedIndex: number | null;
  submitting: boolean;
  onClose: () => void;
  onContinue: () => void;
  onSelect: (index: number | null) => void;
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { colors } = theme;
  const insets = useSafeAreaInsets();

  const selectedBackground = adjust(CHALLENGE_COLOR, theme.dark ? -0.82 : 0.92);
  const selectedBadgeBackground = CHALLENGE_COLOR + (theme.dark ? "22" : "18");

  return (
    <SheetModal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <List
          ListHeaderComponent={() => (
            <Stack padding={[4, 0]}>
              <Typography variant="h2">
                {question}
              </Typography>
              <Divider height={6} ghost />
              <Typography variant="action" color="textSecondary">
                {t("ONBOARDING_DOUBLE_AUTH_DESCRIPTION")}
              </Typography>
              <Divider height={18} ghost />
            </Stack>
          )}
          contentContainerStyle={{
            padding: 16,
            flexGrow: 1,
            gap: 10,
            paddingTop: insets.top + 20,
            paddingBottom: 20,
          }}
          style={{ flex: 1 }}
        >
          {options.map((option, index) => {
            const isSelected = selectedIndex === index;

            return (
              <List.Item
                key={`${option}-${index}`}
                onPress={() => {
                  if (!submitting) {
                    onSelect(isSelected ? null : index);
                  }
                }}
                style={{
                  backgroundColor: isSelected ? selectedBackground : colors.card,
                  minHeight: 68,
                }}
              >
                <List.Leading>
                  <Stack
                    width={32}
                    height={32}
                    vAlign="center"
                    hAlign="center"
                    radius={32}
                    backgroundColor={isSelected ? selectedBadgeBackground : colors.text + (theme.dark ? "12" : "08")}
                  >
                    <Dynamic animated entering={PapillonZoomIn} exiting={PapillonZoomOut}>
                      {isSelected ? (
                        <Papicons
                          name="check"
                          size={16}
                          fill={CHALLENGE_COLOR}
                        />
                      ) : (
                        <Typography variant="caption" color="textSecondary">
                          {index + 1}
                        </Typography>
                      )}
                    </Dynamic>
                  </Stack>
                </List.Leading>

                <Typography variant="action" style={{ paddingVertical: 6 }}>
                  {option}
                </Typography>
              </List.Item>
            );
          })}
        </List>

        <View
          style={{
            padding: 20,
            paddingBottom: insets.bottom + 20,
            borderTopColor: colors.border,
            borderTopWidth: 1,
            backgroundColor: colors.background,
          }}
        >
          <Button
            label={t("ONBOARDING_CONTINUE")}
            onPress={onContinue}
            disabled={selectedIndex === null || submitting}
          />
        </View>
      </View>
    </SheetModal>
  );
}

export default function EDLoginWithCredentials() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const [challengeModalVisible, setChallengeModalVisible] = useState<boolean>(false);
  const [doubleAuthChallenge, setDoubleAuthChallenge] = useState<DoubleAuthQuestions | null>(null);
  const [selectedChallengeIndex, setSelectedChallengeIndex] = useState<number | null>(null);
  const [isSubmittingChallenge, setIsSubmittingChallenge] = useState<boolean>(false);

  const [session, setSession] = useState<Client | null>(null);
  const [token, setToken] = useState<string>();

  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  const keyboardListeners = useMemo(() => ({
    show: () => {
      "worklet";
      opacity.value = withTiming(0, { duration: ANIMATION_DURATION });
      scale.value = withTiming(0.8, { duration: ANIMATION_DURATION });
    },
    hide: () => {
      "worklet";
      opacity.value = withTiming(1, { duration: ANIMATION_DURATION });
      scale.value = withTiming(1, { duration: ANIMATION_DURATION });
    },
  }), [opacity]);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardWillShow", keyboardListeners.show);
    const hideSub = Keyboard.addListener("keyboardWillHide", keyboardListeners.hide);

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [keyboardListeners]);

  useEffect(() => {
    if (!challengeModalVisible) {
      setSelectedChallengeIndex(null);
      setIsSubmittingChallenge(false);
    }
  }, [challengeModalVisible]);

  const handleLogin = async (username: string, password: string, keys?: DoubleAuthResult) => {
    const client = new Client();
    const device = uuid();
    const store = useAccountStore.getState();

    try {
      const tokens = await client.auth.loginUsername(username, password, keys?.cn, keys?.cv, true, device);
      if (tokens) {
        client.auth.setAccount(0);
        const authentication = client.auth.getAccount();
        const account: Account = {
          id: device,
          firstName: authentication.prenom,
          lastName: authentication.nom,
          schoolName: authentication.nomEtablissement,
          services: [
            {
              id: device,
              auth: {
                additionals: {
                  "username": username,
                  "token": authentication.accessToken,
                  "cn": keys?.cn ?? "",
                  "cv": keys?.cv ?? "",
                  "deviceUUID": device
                }
              },
              serviceId: Services.ECOLEDIRECTE,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        store.addAccount(account);
        store.setLastUsedAccount(device);

        queueMicrotask(() => {
          router.push({
            pathname: "../end/color",
            params: { accountId: device },
          });
        });
      }
    } catch (e) {
      setIsLoggingIn(false);
      if (e instanceof Require2FA) {
        const questions = await client.auth.get2FAQuestion(e.token);
        setDoubleAuthChallenge(questions);
        setSession(client);
        setChallengeModalVisible(true);
        setToken(e.token);
      } else {
        Alert.alert(t("Alert_Auth_Error"), t("ONBOARDING_ALERT_LOGIN_ABORTED"));
      }
    }
  }

  const loginED = async () => {
    if (!username.trim() || !password.trim()) { return; }
    setIsLoggingIn(true);
    Keyboard.dismiss();
    await handleLogin(username, password);
    setIsLoggingIn(false);
  };

  async function handleChallenge() {
    if (selectedChallengeIndex === null || !session || !doubleAuthChallenge?.propositions?.[selectedChallengeIndex]) { return; }

    setIsSubmittingChallenge(true);

    try {
      const keys = await session.auth.send2FAQuestion(doubleAuthChallenge.propositions[selectedChallengeIndex], token ?? "");
      setChallengeModalVisible(false);
      setIsLoggingIn(true);
      queueMicrotask(() => void handleLogin(username, password, keys));
    } catch {
      setIsSubmittingChallenge(false);
      Alert.alert(t("Alert_Auth_Error"), t("ONBOARDING_ALERT_LOGIN_ABORTED"));
    }
  }

  const headerHeight = useHeaderHeight();
  const finalHeaderHeight = Platform.select({
    android: headerHeight,
    default: insets.top
  });

  return (
    <KeyboardAvoidingView style={{ flex: 1, marginBottom: insets.bottom }} behavior="padding">
      <ScrollView contentContainerStyle={{ paddingTop: finalHeaderHeight, paddingBottom: insets.bottom }}>
              <LoginView
                color="#1788bc"
                serviceName="ÉcoleDirecte"
                serviceIcon={require('@/assets/images/service_ed.png')}
                loading={isLoggingIn}
                onSubmit={(values) => {
                  if (!isLoggingIn && values.username && values.password) {
                    setUsername(values.username);
                    setPassword(values.password);
                    loginED();
                  }
                }}
              />
            </ScrollView>

      <EDDoubleAuthModal
        visible={challengeModalVisible}
        question={doubleAuthChallenge?.question ?? t("ONBOARDING_DOUBLE_AUTH")}
        options={(doubleAuthChallenge?.propositions ?? []).map((option) => String(option))}
        selectedIndex={selectedChallengeIndex}
        submitting={isSubmittingChallenge}
        onSelect={setSelectedChallengeIndex}
        onClose={() => setChallengeModalVisible(false)}
        onContinue={handleChallenge}
      />
    </KeyboardAvoidingView>
  );
}
