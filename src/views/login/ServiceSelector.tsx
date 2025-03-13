import React, { memo, useEffect, useState } from "react";
import { Image, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Reanimated, { LinearTransition, FlipInXDown } from "react-native-reanimated";

import {RouteParameters, Screen} from "@/router/helpers/types";

import PapillonShineBubble from "@/components/FirstInstallation/PapillonShineBubble";
import DuoListPressable from "@/components/FirstInstallation/DuoListPressable";
import ButtonCta from "@/components/FirstInstallation/ButtonCta";
import MaskStars from "@/components/FirstInstallation/MaskStars";
import { useTheme } from "@react-navigation/native";
import GetV6Data from "@/utils/login/GetV6Data";
import { Check, School, WifiOff } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import useSoundHapticsWrapper from "@/utils/native/playSoundHaptics";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useAlert } from "@/providers/AlertProvider";

const ServiceSelector: Screen<"ServiceSelector"> = ({ navigation }) => {
  const theme = useTheme();
  const { colors } = theme;

  const { isOnline } = useOnlineStatus();
  const { showAlert } = useAlert();

  type Services = "pronote" | "ed" | "skolengo";
  const [service, setService] = useState<Services | null>(null);

  const [v6Data, setV6Data] = useState<any | null>(null);

  const { playSound } = useSoundHapticsWrapper();
  const LEson = require("@/../assets/sound/1.wav");

  useEffect(() => {
    setTimeout(async () => {
      const v6Data = await GetV6Data();
      setV6Data(v6Data);
      if (v6Data.restore && !v6Data.imported) {
        const data: RouteParameters["PronoteV6Import"]["data"] = {
          username: v6Data.data.username || "",
          deviceUUID: v6Data.data.deviceUUID || "",
          instanceUrl: v6Data.data.instanceUrl || "",
          nextTimeToken: v6Data.data.nextTimeToken || ""
        };
        navigation.navigate("PronoteV6Import", { data });
      }
    }, 1);
  }, []);

  const services = [
    {
      name: "pronote",
      title: "PRONOTE",
      image: require("../../../assets/images/service_pronote.png"),
      login: () => {
        navigation.navigate("PronoteAuthenticationSelector");
        playSound(LEson);
      },
    },
    {
      name: "ed",
      title: "ÉcoleDirecte",
      image: require("../../../assets/images/service_ed.png"),
      login: () => {
        navigation.navigate("EcoleDirecteCredentials");
        playSound(LEson);
      }
    },
    {
      name: "skolengo",
      title: "Skolengo",
      image: require("../../../assets/images/service_skolengo.png"),
      login: () => {
        navigation.navigate("SkolengoAuthenticationSelector");
        playSound(LEson);
      }
    },
    {
      name: "university",
      title: "Enseignement supérieur",
      subtitle: "Universités, IUT, écoles, etc.",
      image: require("../../../assets/images/service_skolengo.png"),
      icon: <School />,
      login: () => {
        navigation.navigate("IdentityProviderSelector");
        playSound(LEson);
      }
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <MaskStars />

      <PapillonShineBubble
        message="Pour commencer, quel est ton service scolaire ?"
        numberOfLines={2}
        width={260}
        offsetTop={"20%"}
      />

      <View
        style={{
          width: "100%",
          flex: 1,
          alignItems: "center",
          marginTop: -36,
          zIndex: 1000,
        }}
      >
        <LinearGradient
          colors={[colors.background, colors.background + "00"]}
          style={{
            width: "100%",
            height: 40,
            position: "absolute",
            top: 0,
            zIndex: 100,
          }}
        />

        <LinearGradient
          colors={[colors.background + "00", colors.background]}
          style={{
            width: "100%",
            height: 40,
            position: "absolute",
            bottom: 0,
            zIndex: 100,
          }}
        />

        <Reanimated.ScrollView
          style={styles.list}
          contentContainerStyle={{
            alignItems: "center",
            gap: 9,
            paddingHorizontal: 20,
            paddingTop: 30,
            paddingBottom: 60,
          }}
          layout={LinearTransition}
        >
          {services.map((srv, i) => (
            <Reanimated.View
              style={{ width: "100%" }}
              layout={LinearTransition}
              entering={FlipInXDown.springify().delay(100 * i)}
              key={srv.name}
            >
              <DuoListPressable
                key={srv.name}
                leading={
                  srv.icon ?
                    <View
                      style={{
                        opacity: srv.name === service ? 1 : 0.5,
                        padding: 3,
                      }}
                    >
                      {React.cloneElement(srv.icon, { size: 26, strokeWidth: 2.5, color: srv.name === service ? colors.primary : colors.text })}
                    </View>
                    :
                    <Image
                      source={srv.image}
                      style={styles.image}
                      resizeMode="contain"
                    />
                }
                text={srv.title}
                subtext={srv.subtitle}
                enabled={srv.name === service}
                onPress={() => setService(srv.name as Services)}
              />
            </Reanimated.View>
          ))}
        </Reanimated.ScrollView>
      </View>

      <View style={styles.buttons}>
        <ButtonCta
          primary
          value="Confirmer"
          disabled={service === null}
          onPress={
            isOnline
              ? services.find((srv) => srv.name === service)?.login
              : () => {
                showAlert({
                  title: "Information",
                  message:
                      "Pour poursuivre la connexion, tu dois être connecté à Internet. Vérifie ta connexion Internet et réessaie",
                  icon: <WifiOff />,
                  actions: [
                    {
                      title: "OK",
                      icon: <Check />,
                    },
                  ],
                });
              }
          }
        />

        {v6Data && v6Data.restore && (
          <ButtonCta
            value="Importer mon compte"
            onPress={() => navigation.navigate("PronoteV6Import", { data: v6Data.data })}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    gap: 20,
  },

  list: {
    flex: 1,
    width: "100%",
  },

  buttons: {
    width: "100%",
    paddingHorizontal: 16,
    gap: 9,
    marginBottom: 16,
  },

  image: {
    width: 32,
    height: 32,
    borderRadius: 80,
  },
});

export default memo(ServiceSelector);
