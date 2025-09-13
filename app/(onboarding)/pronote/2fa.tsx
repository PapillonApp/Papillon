import AnimatedPressable from "@/ui/components/AnimatedPressable";
import Icon from "@/ui/components/Icon";
import Stack from "@/ui/components/Stack";
import Typography from "@/ui/components/Typography";
import { Papicons } from "@getpapillon/papicons";
import { useTheme } from "@react-navigation/native";
import { finishLoginManually, SecurityError, securitySave, securitySource, SessionHandle } from "pawnote";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, View } from "react-native";
import Reanimated from "react-native-reanimated"
import * as Device from "expo-device"
import { Services } from "@/stores/account/types";
import { useAccountStore } from "@/stores/account";
import { router } from "expo-router";
import { useAlert } from "@/ui/components/AlertProvider";
import { ScrollView } from "react-native-gesture-handler";

export function Pronote2FAModal({ doubleAuthSession, doubleAuthError, setChallengeModalVisible, deviceId }: { doubleAuthSession: SessionHandle | null, doubleAuthError: SecurityError | null, setChallengeModalVisible: (visible: boolean) => void, deviceId: string }) {
  const { t } = useTranslation();
  const { colors, dark } = useTheme();
  const alert = useAlert();

  const [pinCode, setPinCode] = useState<string>("");

  const solveDoubleAuth = async (pinCode: string) => {
    try {
      if (!doubleAuthSession || !doubleAuthError) return;

      const error = doubleAuthError
      const session = doubleAuthSession
      const deviceName = Device.deviceName
      const source = "Papillon sur " + deviceName
      await securitySource(session, source.length > 30 ? "Papillon" : "Papillon sur " + deviceName)
      await securitySave(session, error.handle, {
        pin: pinCode,
        deviceName: source.length > 30 ? "Papillon" : "Papillon sur " + deviceName || "Papillon"
      })

      const context = error.handle.context;
      const refresh = await finishLoginManually(
        session,
        context.authentication,
        context.identity,
        context.initialUsername
      )
      const splittedUsername = session.user.name.split(" ")
      const firstName = splittedUsername[splittedUsername.length - 1]
      const lastName = splittedUsername.slice(0, splittedUsername.length - 1).join(" ")
      const schoolName = session.user.resources[0].establishmentName
      const className = session.user.resources[0].className

      const account = {
        id: deviceId,
        firstName,
        lastName,
        schoolName,
        className,
        services: [{
          id: deviceId,
          auth: {
            accessToken: refresh.token,
            refreshToken: refresh.token,
            additionals: {
              instanceURL: refresh.url,
              kind: refresh.kind,
              username: refresh.username,
              deviceUUID: deviceId
            }
          },
          serviceId: Services.PRONOTE,
          createdAt: (new Date()).toISOString(),
          updatedAt: (new Date()).toISOString()
        }],
        createdAt: (new Date()).toISOString(),
        updatedAt: (new Date()).toISOString()
      }

      const store = useAccountStore.getState()
      store.addAccount(account)
      store.setLastUsedAccount(deviceId)

      router.push({
        pathname: "../end/color",
        params: {
          accountId: deviceId
        }
      });
    } catch (error) {
      return alert.showAlert({
        title: "Identifiants incorrects",
        description: "Nous n’avons pas réussi à te connecter à ton compte Pronote. Vérifie ton identifiant et ton mot de passe puis essaie de nouveau.",
        icon: "TriangleAlert",
        color: "#D60046",
        technical: String(error),
        withoutNavbar: true
      })
    }
  }

  function addPinCodeChar(char: string): void {
    if (pinCode.length < 4) {
      setPinCode((prev) => prev + char);
    }
  }

  const data = [
    {
      name: "1",
      onPress: () => {
        addPinCodeChar("1")
      }
    },
    {
      name: "2",
      onPress: () => {
        addPinCodeChar("2")
      }
    },
    {
      name: "3",
      onPress: () => {
        addPinCodeChar("3")
      }
    },
    {
      name: "4",
      onPress: () => {
        addPinCodeChar("4")
      }
    },
    {
      name: "5",
      onPress: () => {
        addPinCodeChar("5")
      }
    },
    {
      name: "6",
      onPress: () => {
        addPinCodeChar("6")
      }
    },
    {
      name: "7",
      onPress: () => {
        addPinCodeChar("7")
      }
    },
    {
      name: "8",
      onPress: () => {
        addPinCodeChar("8")
      }
    },
    {
      name: "9",
      onPress: () => {
        addPinCodeChar("9")
      }
    },
    {
      name: "del",
      icon: <Papicons name="ArrowLeft" fill={colors.text} />,
      onPress: () => {
        setPinCode((prev) => prev.slice(0, -1));
      }
    },
    {
      name: "0",
      onPress: () => {
        addPinCodeChar("0")
      }
    },
    {
      name: "check",
      icon: <Papicons name="Check" fill={colors.text} />,
      onPress: () => {
        solveDoubleAuth(pinCode);

        if (!doubleAuthSession || !doubleAuthError || pinCode.length < 4) return;
        setChallengeModalVisible(false);
      }
    }
  ]

  const renderItem = useCallback(({ item }: { item: typeof data[0] }) => (
    <AnimatedPressable
      onPress={item.onPress}
      style={{
        width: 80,
        height: 80,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
        borderColor: colors.border,
        borderRadius: 100
      }}>
      {!item.icon ? (<Typography variant="h1">{item.name}</Typography>) : (item.icon)}
    </AnimatedPressable>
  ), [data]);

  return (
    <View style={{ backgroundColor: colors.background, width: "100%", height: "100%" }}>
      <View
        style={{
          alignItems: "center",
          justifyContent: "flex-end",
          borderBottomLeftRadius: 42,
          borderBottomRightRadius: 42,
          padding: 20,
          paddingBottom: 34,
          backgroundColor: "#E50052",
        }}
      >
        <Reanimated.View
          style={{
            marginBottom: 16,
            alignItems: "center",
            justifyContent: "center",
          }}
        />
        <Stack vAlign="start" hAlign="start" width="100%" gap={12}>
          <Stack direction="horizontal">
            <Typography variant="h5" style={{ color: "#FFF", fontSize: 18 }}>
              {t("STEP")} 3
            </Typography>
            <Typography variant="h5" style={{ color: "#FFFFFF90", fontSize: 18 }}>
              {t("STEP_OUTOF")} 3
            </Typography>
          </Stack>
          <Typography variant="h1" style={{ color: "#FFF", fontSize: 32 }}>
            {t("ONBOARDING_LOGIN_PINCODE")}
          </Typography>
        </Stack>
      </View>
      <ScrollView>
        <Stack flex direction="horizontal" style={{ paddingHorizontal: 50, paddingVertical: 30 }}>
          <Stack
            flex
            direction="horizontal"
            hAlign="center"
            gap={10}
            style={{
              flex: 1,
              padding: 20,
              backgroundColor: colors.text + (dark ? "15" : "08"),
              borderRadius: 300,
              borderWidth: 1,
              borderColor: colors.border
            }}
          >
            <Icon
              papicon
              size={24}
              fill={colors.text + "AF"}
            >
              <Papicons name={"Password"} />
            </Icon>
            <Typography variant="h5" color={pinCode.trim() ? colors.text + "AF" : "secondary"}>{pinCode.trim() ? pinCode : t("INPUT_PIN")}</Typography>
          </Stack>
        </Stack>
        <FlatList
          scrollEnabled={false}
          data={data}
          numColumns={3}
          renderItem={renderItem}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 50,
            gap: 15
          }}
          columnWrapperStyle={{
            justifyContent: "space-between",
            alignItems: "center"
          }}
          style={{
            width: "100%",
            overflow: "hidden"
          }}
          removeClippedSubviews
          maxToRenderPerBatch={6}
          windowSize={1}
        />
      </ScrollView>
    </View>)
}