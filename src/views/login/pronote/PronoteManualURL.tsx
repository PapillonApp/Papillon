import React, { useEffect, useState } from "react";
import type { RouteParameters, Screen } from "@/router/helpers/types";
import { View, StyleSheet, TouchableOpacity, KeyboardEvent, Keyboard } from "react-native";
import { useTheme } from "@react-navigation/native";
import determinateAuthenticationView from "@/services/pronote/determinate-authentication-view";

import * as Clipboard from "expo-clipboard";

import Reanimated, { FadeInUp, FadeOutUp, LinearTransition, ZoomIn, ZoomOut } from "react-native-reanimated";

import MaskStars from "@/components/FirstInstallation/MaskStars";
import PapillonShineBubble from "@/components/FirstInstallation/PapillonShineBubble";
import ButtonCta from "@/components/FirstInstallation/ButtonCta";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { BadgeInfo, Link2, TriangleAlert, Undo2, X } from "lucide-react-native";
import { Alert, useAlert } from "@/providers/AlertProvider";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import ResponsiveTextInput from "@/components/FirstInstallation/ResponsiveTextInput";

const PronoteManualURL: Screen<"PronoteManualURL"> = ({ route, navigation }) => {
  const theme = useTheme();
  const {colors} = theme;
  const insets = useSafeAreaInsets();
  const [instanceURL, setInstanceURL] = useState("");
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  const {showAlert} = useAlert();

  const keyboardDidShow = (event: KeyboardEvent) => {
    setKeyboardOpen(true);
  };

  const keyboardDidHide = () => {
    setKeyboardOpen(false);
  };

  useEffect(() => {
    Keyboard.addListener("keyboardDidShow", keyboardDidShow);
    Keyboard.addListener("keyboardDidHide", keyboardDidHide);

    return () => {
      Keyboard.removeAllListeners("keyboardDidShow");
      Keyboard.removeAllListeners("keyboardDidHide");
    };
  }, []);

  // find url in route params
  useEffect(() => {
    if (route.params?.url) {
      setInstanceURL(route.params?.url);
      determinateAuthenticationView(route.params?.url, navigation, showAlert);
    }
  }, [route.params]);

  const [clipboardFound, setClipboardFound] = useState(false);

  // get url from clipboard
  useEffect(() => {
    if (instanceURL === "" && !route.params?.url) {
      Clipboard.getStringAsync().then((clipboardContent) => {
        if (clipboardContent && clipboardContent.startsWith("https://") && clipboardContent.includes("/pronote")) {
          setInstanceURL(clipboardContent);
          setClipboardFound(true);
        }
      });
    }
  }, []);

  useEffect(() => {
    setClipboardFound(false);
  }, [instanceURL]);

  const checkForDemoInstance = async <ScreenName extends keyof RouteParameters>(
    instanceURL: string,
    navigation: NativeStackNavigationProp<RouteParameters, ScreenName>,
    showAlert: (alert: Alert) => void,
  ): Promise<void> => {
    if (!instanceURL.includes("demo.index-education.net")) return determinateAuthenticationView(instanceURL.trim(), navigation, showAlert);
    showAlert({
      title: "Instance non prise en charge",
      message: "Désolé, les instances de démonstration ne sont pas prises en charge, elles peuvent être instables ou ne pas fonctionner correctement.",
      icon: <BadgeInfo />,
      actions: [
        {
          title: "Continuer",
          icon: <TriangleAlert />,
          onPress: () => determinateAuthenticationView(instanceURL, navigation, showAlert),
          danger: false,
          delayDisable: 5,
        },
        {
          title: "Annuler",
          icon: <Undo2 />,
          primary: true,
        }
      ]
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <MaskStars />

      <View style={{ height: insets.top, marginTop: "10%" }} />

      {!keyboardOpen && (
        <Reanimated.View
          entering={FadeInUp.duration(250).delay(200)}
          exiting={FadeOutUp.duration(150)}
          style={{ zIndex: 9999 }}
          layout={LinearTransition}
        >
          <PapillonShineBubble
            message={
              !clipboardFound ?
                "Indique moi l'adresse URL Pronote de ton établissement"
                : "J'ai trouvé cette adresse dans ton presse-papier !"
            }
            numberOfLines={2}
            width={250}
            noFlex
          />
        </Reanimated.View>
      )}


      <Reanimated.View
        style={[
          styles.searchContainer,
          {
            backgroundColor: colors.text + "15",
            // @ts-expect-error
            color: colors.text,
            borderColor: colors.border,
          }
        ]}
      >
        <Link2 size={24} color={colors.text + "55"} />

        <ResponsiveTextInput
          keyboardType="url"
          autoCapitalize="none"
          placeholder="URL de l'instance Pronote"

          style={[styles.searchInput, { color: theme.colors.text }]}
          placeholderTextColor={theme.colors.text + "50"}

          value={instanceURL}
          onChangeText={setInstanceURL}
          onSubmitEditing={() => {
            if (instanceURL.length > 0) {
              checkForDemoInstance(instanceURL, navigation, showAlert);
            };
          }}
        />

        {instanceURL.length > 0 && (
          <Reanimated.View
            layout={LinearTransition}
            entering={ZoomIn.springify()}
            exiting={ZoomOut.springify()}
          >
            <TouchableOpacity onPress={() => {
              setInstanceURL("");
            }}>
              <X size={24} color={colors.text + "55"} />
            </TouchableOpacity>
          </Reanimated.View>
        )}
      </Reanimated.View>

      <View style={{ flex: 1 }} />

      <View
        style={styles.buttons}
      >
        <ButtonCta
          value="Confirmer"
          primary
          onPress={() => {
            if (instanceURL.length > 0) {
              checkForDemoInstance(instanceURL, navigation, showAlert);
            };
          }}
        />
        {(route.params?.method) && (
          <ButtonCta
            value="Quitter"
            onPress={() => navigation.navigate("AccountSelector")}
          />)}
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

  buttons: {
    width: "100%",
    paddingHorizontal: 16,
    gap: 9,
    marginBottom: 16,
  },

  searchContainer: {
    marginHorizontal: 16,
    marginTop: 10,

    flexDirection: "row",

    paddingHorizontal: 16,
    paddingVertical: 12,

    borderRadius: 300,
    gap: 12,
  },

  searchInput: {
    flex: 1,
    fontSize: 17,
    fontFamily: "medium",
  }
});

export default PronoteManualURL;
