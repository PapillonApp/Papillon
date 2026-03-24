import { useTheme } from "@react-navigation/native";
import { useRouter } from "expo-router";
import * as WebBrowser from 'expo-web-browser';
import React from "react";
import { Image, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Stack from "@/ui/components/Stack";
import Button from "@/ui/new/Button";
import Divider from "@/ui/new/Divider";
import PapillonLogo from "@/ui/new/symbols/PapillonLogo";
import Typography from "@/ui/new/Typography";

export default function Welcome() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const router = useRouter();

  const openHelpWebPage = () => {
    WebBrowser.openBrowserAsync("https://docs.papillon.bzh/support", {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET
    });
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "flex-end",
        alignItems: "center",
        padding: 16,
        gap: 10,
        paddingBottom: insets.bottom + 16
      }}
    >

      <Typography variant="caption" align="center" weight="bold" color="red" style={{ marginHorizontal: 10, opacity: 0.8, marginBottom: 20 }}>
        Mince ! j'ai accidentellement merge le nouvel onboarding dans main, donc vous serez coincé ici tant que je ne bosse pas :(
      </Typography>

      <PapillonLogo />

      <Typography variant="title" align="center" weight="medium" style={{ marginHorizontal: 10, opacity: 0.8 }}>
        L'application ultime pour gérer toute ta vie scolaire sans compromis.
      </Typography>

      <Divider height={2} ghost />


      <Button
        label="Se connecter avec"
        gap={4}
        trailing={
          <Stack direction="horizontal" gap={0}>
            <Image
              source={require("@/assets/images/service_pronote.png")}
              style={{ width: 32, height: 32, borderRadius: 32, borderWidth: 3, borderColor: colors.primary, zIndex: 3 }}
            />
            <Image
              source={require("@/assets/images/service_ed.png")}
              style={{ width: 32, height: 32, borderRadius: 32, borderWidth: 3, borderColor: colors.primary, marginLeft: -16, zIndex: 2 }}
            />
            <Image
              source={require("@/assets/images/service_skolengo.png")}
              style={{ width: 32, height: 32, borderRadius: 32, borderWidth: 3, borderColor: colors.primary, marginLeft: -16, zIndex: 1 }}
            />
          </Stack>
        }
        onPress={() => {
          router.push("./ageSelection")
        }}
        fullWidth
      />
      <Button
        label="Besoin d'aide ?"
        onPress={() => { openHelpWebPage() }}
        fullWidth
        variant="secondary"
      />

      <Divider height={2} ghost />

      <Typography variant="caption" color="textSecondary" align="center" style={{ marginHorizontal: 20, opacity: 0.7 }}>
        En continuant, vous acceptez les conditions d’utilisation ainsi que la politique de confidentialité.
      </Typography>
    </View>
  );
}