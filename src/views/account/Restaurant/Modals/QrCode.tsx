import { balanceFromExternal } from "@/services/balance";
import { qrcodeFromExternal } from "@/services/qrcode";
import { useTheme } from "@react-navigation/native";
import { BlurView } from "expo-blur";
import { QrCodeIcon, X } from "lucide-react-native";
import { useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { PressableScale } from "react-native-pressable-scale";
import QRCode from "react-native-qrcode-svg";
import * as Haptics from "expo-haptics";
import { Screen } from "@/router/helpers/types";
import { ExternalAccount } from "@/stores/account/types";
import useSoundHapticsWrapper from "@/utils/native/playSoundHaptics";
import * as Brightness from "expo-brightness";

const RestaurantQrCode: Screen<"RestaurantQrCode">  = ({ route, navigation }) => {
  const { card } = route.params;
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [defaultBrightness, setDefaultBrightness] = useState<number>(0.5);
  const { playHaptics } = useSoundHapticsWrapper();

  const PollingBalance = async () => {
    balanceFromExternal(card.account as ExternalAccount).then((newBalance) => {
      if(card.balance[0].amount !== newBalance[0].amount) {
        const diff = newBalance[0].amount - card.balance[0].amount;
        openFeedback();
      }
    });
  };

  const openFeedback = () => {
    playHaptics("notification", {
      notification: Haptics.NotificationFeedbackType.Success,
    });
    navigation.goBack();
    setTimeout(() => {
      navigation.navigate("RestaurantPaymentSuccess", { card, diff: 0 });
    }, 1000);
  };

  useEffect(() => {
    const handleBrightness = async () => {
      const { status } = await Brightness.requestPermissionsAsync();
      if (status === "granted") {
        const currentBrightness = await Brightness.getBrightnessAsync();
        setDefaultBrightness(currentBrightness);
        Brightness.setSystemBrightnessAsync(1);
      }
    };

    handleBrightness();

    const handleBeforeRemove = async () => {
      const { status } = await Brightness.requestPermissionsAsync();
      if (status === "granted" && defaultBrightness !== undefined) {
        Brightness.setSystemBrightnessAsync(defaultBrightness);
      }
    };

    navigation.addListener("beforeRemove", handleBeforeRemove);

    return () => {
      navigation.removeListener("beforeRemove", handleBeforeRemove);
    };
  }, [defaultBrightness, navigation]);

  useEffect(() => {
    // Si Izly
    if(card.service === 10) {
      const interval = setInterval(() => {
        console.log("[CANTINE >> IZLY] Demande du solde");
        PollingBalance();
      }, 1000);

      return () => {
        clearInterval(interval);
        console.log("[CANTINE >> IZLY] Fin du polling");
      };
    }
  }, []);

  const theme = useTheme();

  const GenerateQRCode = async () => {
    qrcodeFromExternal(card.account as ExternalAccount).then((qrCode) => {
      // @ts-expect-error
      setQrCode(qrCode);
    });
  };

  useEffect(() => {
    GenerateQRCode();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background + "50",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <BlurView
        style={{
          flex: 1,
          width: "100%",
          justifyContent: "center",
          alignItems: "center",
        }}
        intensity={100}
        tint={theme.dark ? "dark" : "light"}
      >

        <Pressable
          style={{
            width: "100%",
            flex: 1,

            justifyContent: "flex-end",
            alignItems: "center",
          }}
          onPress={() => navigation.goBack()}
        >
          <View
            style={{
              marginBottom: 32,
              justifyContent: "center",
              alignItems: "center",
              gap: 8,
              maxWidth: 260,
            }}
          >
            <QrCodeIcon
              size={24}
              color={theme.colors.text}
            />

            <Text
              style={{
                color: theme.colors.text,
                fontSize: 15,
                lineHeight: 20,
                textAlign: "center",
                fontFamily: "semibold",
              }}
            >
              Approche le code QR du scanner de la borne afin de valider ta carte
            </Text>
          </View>
        </Pressable>

        {qrCode && (
          <PressableScale
            style={{
              padding: 16,
              backgroundColor: "white",

              borderColor: theme.colors.text + "40",
              borderWidth: 1,

              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.2,
              shadowRadius: 7,

              elevation: 5,

              borderRadius: 16,
              borderCurve: "continuous",
            }}
            onPress={() => {
              GenerateQRCode();
            }}
            weight="light"
            activeScale={0.9}
          >
            <QRCode
              value={qrCode}
              size={280}
            />
          </PressableScale>
        )}

        <Pressable
          style={{
            width: "100%",
            flex: 1,

            justifyContent: "flex-start",
            alignItems: "center",
          }}
          onPress={() => navigation.goBack()}
        >
          <TouchableOpacity
            style={{
              marginTop: 32,
              paddingHorizontal: 20,
              paddingVertical: 10,
              backgroundColor: theme.colors.text + "20",
              borderRadius: 50,
              borderCurve: "continuous",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              gap: 8,
            }}
            onPress={() => navigation.goBack()}
          >
            <X strokeWidth={2.6} size={20} color={theme.colors.text} />

            <Text
              style={{
                color: theme.colors.text,
                fontSize: 15,
                lineHeight: 20,
                textAlign: "center",
                fontFamily: "semibold",
              }}
            >
              Fermer
            </Text>
          </TouchableOpacity>
        </Pressable>

      </BlurView>
    </View>
  );
};

export default RestaurantQrCode;