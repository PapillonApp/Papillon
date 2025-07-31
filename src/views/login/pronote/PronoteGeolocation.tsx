import React, { useEffect, useState } from "react";
import { View,Text, StyleSheet } from "react-native";
import type { Screen } from "@/router/helpers/types";
import { SafeAreaView } from "react-native-safe-area-context";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";

import { getCurrentPosition } from "@/utils/native/location";
import { useLocationPermission } from "@/hooks/location";
import MaskStars from "@/components/FirstInstallation/MaskStars";
import PapillonShineBubble from "@/components/FirstInstallation/PapillonShineBubble";
import ButtonCta from "@/components/FirstInstallation/ButtonCta";

/**
 * Intermediate screen to get the user's location before displaying the list of PRONOTE instances.
 *
 * When user grants the location permission, the screen will
 * automatically fetch the user's location and navigate
 * to the next screen.
 *
 * When the permission is not yet granted, the screen will
 * display a button to request the permission.
 */
const PronoteGeolocation: Screen<"PronoteGeolocation"> = ({ navigation }) => {
  const [permission, { loading: loadingPermission, request, refetch }] = useLocationPermission();
  const [loadingLocation, setLoadingLocation] = useState(false);
  const PapillonMessage = `${loadingPermission ? "Chargement des permissions..." : ""} ${loadingLocation ? "Localisation en cours..." : "Papillon a besoin de ton emplacement pour chercher des établissements"}`.trim();
  const theme = useTheme();
  const { colors } = theme;

  useEffect(() => {
    if (!permission?.granted) return;

    (async () => {
      setLoadingLocation(true);
      const position = await getCurrentPosition();

      if (!position) {
        setLoadingLocation(false);
        await refetch();
        return;
      }

      setTimeout(() => {
        navigation.goBack();
        navigation.navigate("PronoteInstanceSelector", position);
      }, 500);
    })();
  }, [permission]);

  return (
    <SafeAreaView style={styles.container}>
      <MaskStars />

      <PapillonShineBubble
        message={PapillonMessage}
        numberOfLines={permission?.granted ? 1 : 4}
        width={250}
      />
      {!permission?.granted && (
        <View style={styles.buttons}>
          <ButtonCta
            value="Demander la permission"
            primary
            onPress={() => void request()}
          />
        </View>
      )}

      <Text style={[styles.terms_text, { color: colors.text + "59" }]}>
        Ta position est nécessaire pour trouver les instances PRONOTE à proximité.
        Elle sera envoyée à Pronote et à l'API adresse du gouvernement pour trouver les établissements.
        Elle n'est pas stockée.
      </Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    gap: 20,
  },

  presentation: {
    alignItems: "center",
    gap: 9,
    paddingHorizontal: 20,
  },

  logotype: {
    height: 28,
  },

  presentation_text: {
    fontSize: 16,
    textAlign: "center",
    fontFamily: "medium",
    marginHorizontal: 20,
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
    marginBottom: 16,
  },
});

export default PronoteGeolocation;