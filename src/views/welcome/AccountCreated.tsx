import React, { useCallback, useEffect, useRef, useState } from "react";
import { Dimensions, Image, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { Screen } from "@/router/helpers/types";

import LottieView from "lottie-react-native";

import ButtonCta from "@/components/FirstInstallation/ButtonCta";
import MaskStars from "@/components/FirstInstallation/MaskStars";
import PapillonShineBubble from "@/components/FirstInstallation/PapillonShineBubble";

import * as Haptics from "expo-haptics";

import { useAccounts, useCurrentAccount } from "@/stores/account";
import useSoundHapticsWrapper from "@/utils/native/playSoundHaptics";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { AccountService, PrimaryAccount } from "@/stores/account/types";

const AccountCreated: Screen<"AccountCreated"> = ({ navigation }) => {
  const accounts = useAccounts((state) => state.accounts);
  const account = useCurrentAccount((state) => state.account!);
  const switchTo = useCurrentAccount((store) => store.switchTo);
  const createStoredAccount = useAccounts(store => store.create);
  const removeAccount = useAccounts((store) => store.remove);

  const { playHaptics, playSound } = useSoundHapticsWrapper();
  const theme = useTheme();
  const LEson5 = require("@/../assets/sound/5.wav");
  const LEson6 = require("@/../assets/sound/6.wav");

  let name = (!account || !account.studentName?.first) ? null
    : account.studentName?.first;

  // Truncate name if over 10 characters.
  if (name && name.length > 10) {
    name = name.substring(0, 10) + "...";
  }

  const animationRef = useRef<LottieView>(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const fusionsDetected = accounts
    .filter((THEaccount) => !THEaccount.isExternal)
    .filter(
      (THEaccount) =>
        THEaccount.service === account.service &&
        THEaccount.name === account.name
    )
    .sort((a, b) => {
      if (a.localID === account.localID) return -1;
      if (b.localID === account.localID) return 1;
      return 0;
    }) as PrimaryAccount[];
  const [isFusionDetected, setIsFusionDetected] = useState(fusionsDetected.length > 1);
  const [loading, setLoading] = useState(false);

  // show animation on focus
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      setShowAnimation(true);

      // loop 20 times
      for (let i = 0; i < 15; i++) {
        setTimeout(() => {
          playHaptics("impact", {
            impact: Haptics.ImpactFeedbackStyle.Medium,
          });
        }, i * 20);
      }
    });

    return unsubscribe;
  }, [navigation]);

  // hide animation on blur
  useEffect(() => {
    const unsubscribe = navigation.addListener("blur", () => {
      setShowAnimation(false);
    });

    return unsubscribe;
  }, [navigation]);

  const renderAccount = useCallback((account: PrimaryAccount, index: number, lenghtFusions: number) => (
    <View
      style={{
        backgroundColor: theme.colors.primary + "11",
        flexDirection: "row",
        padding: 9,
        borderStyle: "solid",
        borderBottomWidth: index !== lenghtFusions - 1 ? 1 : 0,
        borderColor: theme.colors.text + "20",
        alignItems: "center",
      }}
    >
      <View
        style={{
          width: 30,
          height: 30,
          borderRadius: 80,
          backgroundColor: "#000000",
          marginRight: 10,
        }}
      >
        <Image
          source={{ uri: account.personalization.profilePictureB64 }}
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 80,
          }}
          resizeMode="cover"
        />
      </View>
      <View
        style={{
          flexDirection: "column",
          gap: 2,
        }}
      >
        <View style={{ flexDirection: "row", flexWrap: "nowrap", minWidth: "90%", maxWidth: "75%" }}>
          <Text
            style={{
              fontSize: 16,
              fontFamily: "semibold",
              color: theme.colors.text,
              flexShrink: 1,
            }}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {account.studentName?.first || "Utilisateur"} {account.studentName?.last || ""}
          </Text>
        </View>
        <Text
          style={{
            fontSize: 15,
            fontWeight: 500,
            color: theme.colors.text + "50",
            fontFamily: "medium",
            maxWidth: "70%",
          }}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {AccountService[account.service] !== "Local" && account.service !== AccountService.PapillonMultiService
            ? AccountService[account.service]
            : account.identityProvider
              ? account.identityProvider.name
              : "Compte local"}
        </Text>
      </View>
    </View>
  ), []);

  const fusionAccounts = useCallback(async () => {
    if (!account) return;

    const mergedAccount = fusionsDetected
      .filter((curr) => curr.localID !== account.localID)
      // @ts-expect-error
      .reduce((acc, curr) => {
        /** Explication de la fusion des comptes
         * `...` permet de faire une copie d'un objet
         * `Array.from(new Set(...))` permet de supprimer les doublons d'un tableau
         */

        return {
          ...acc,
          personalization: {
            ...acc.personalization,
            ...curr.personalization,
            tabs: Array.from(
              new Set([...(acc.personalization.tabs || []), ...(curr.personalization.tabs || [])])
            ),
            icalURLs: Array.from(
              new Set([...(acc.personalization.icalURLs || []), ...(curr.personalization.icalURLs || [])])
            ),
            subjects: {
              ...(acc.personalization.subjects || {}),
              ...(curr.personalization.subjects || {}),
            },
          },
          linkedExternalLocalIDs: Array.from(
            new Set([...(acc.linkedExternalLocalIDs || []), ...(curr.linkedExternalLocalIDs || [])])
          ),
          associatedAccountsLocalIDs: Array.from(
            new Set([...(acc.associatedAccountsLocalIDs || []), ...(curr.associatedAccountsLocalIDs || [])])
          ),
          serviceData: {
            ...(acc.serviceData || {}),
            ...(curr.serviceData || {}),
          },
        };
      }, account);

    createStoredAccount(mergedAccount);
    await switchTo(mergedAccount);

    fusionsDetected.forEach((acc) => {
      removeAccount(acc.localID);
    });
  }, [account, fusionsDetected]);

  return (
    <SafeAreaView style={styles.container}>
      <MaskStars />

      {showAnimation && (
        <LottieView
          ref={animationRef}
          source={require("@/../assets/lottie/confetti_1.json")}
          style={{
            width: Dimensions.get("window").width,
            height: Dimensions.get("window").height,
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: -200,
          }}
          autoPlay
          loop={false}
        />
      )}

      <PapillonShineBubble
        message={
          isFusionDetected
            ? `Une fusion ${fusionsDetected.length > 2 ? "de plusieurs comptes" : "d'un compte"} est possible`
            : name
              ? `Enchanté, ${name} ! On va personnaliser ton expérience !`
              : "Bienvenue sur Papillon !"
        }
        numberOfLines={isFusionDetected || name ? 2 : 1}
        width={260}
        style={{
          zIndex: 10,
        }}
      />

      {isFusionDetected && (
        <View style={styles.menu}>
          {fusionsDetected.map((acc, index) => (
            <View key={acc.localID}>
              {acc.localID === account.localID ? (
                <Text
                  key={acc.localID}
                  style={{
                    fontSize: 16,
                    fontFamily: "semibold",
                    color: theme.colors.text,
                    padding: 9,
                    backgroundColor: theme.colors.primary + "25",
                  }}
                >
                  Compte ajouté
                </Text>
              ) : index === 1 && (
                <Text
                  key={acc.localID}
                  style={{
                    fontSize: 16,
                    fontFamily: "semibold",
                    color: theme.colors.text,
                    padding: 9,
                    backgroundColor: theme.colors.primary + "25",
                  }}
                >
                  {fusionsDetected.length > 2 ? "Fusions possibles" : "Fusion possible"}
                </Text>
              )}
              {renderAccount(acc, index, fusionsDetected.length)}
            </View>
          ))}
        </View>
      )}

      <View style={styles.buttons}>
        {isFusionDetected ? (
          <>
            <ButtonCta
              value="Fusionner les comptes"
              primary
              disabled={loading}
              onPress={async () => {
                setLoading(true);
                await fusionAccounts();

                setTimeout(() => {
                  playSound(LEson6);
                  navigation.reset({
                    index: 0,
                    routes: [{ name: "AccountStack" }],
                  });
                }, 1000);
              }}
            />
            <ButtonCta
              value="Ne pas fusionner"
              disabled={loading}
              onPress={() => {
                setIsFusionDetected(false);
              }}
            />
          </>
        ) : (
          <>
            <ButtonCta
              value="Personnaliser Papillon"
              primary
              onPress={() => {
                navigation.navigate("ColorSelector");
                playSound(LEson5);
              }}
            />
            <ButtonCta
              value="Ignorer cette étape"
              onPress={() => {
                navigation.navigate("AccountStack", { onboard: true });
                playSound(LEson6);
              }}
            />
          </>
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

  buttons: {
    width: "100%",
    paddingHorizontal: 16,
    gap: 9,
    marginBottom: 16,
  },

  terms_text: {
    fontSize: 12,
    textAlign: "center",
    fontFamily: "medium",
    paddingHorizontal: 20,
  },

  menu: {
    width: 260,
    borderRadius: 12,
    borderCurve: "continuous",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
});

export default AccountCreated;
