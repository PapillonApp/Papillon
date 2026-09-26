import Icon from "@/ui/components/Icon";
import Stack from "@/ui/components/Stack";
import Typography from "@/ui/components/Typography";
import { NativeHeaderPressable, NativeHeaderSide } from "@/ui/components/NativeHeader";
import { Papicons } from "@getpapillon/papicons";
import { useRouter } from "expo-router";
import React from "react";
import { Linking, Platform, View } from "react-native";

export default function Soon() {
  const router = useRouter();

  return (
    <View
      style={{
        padding: 20,
        paddingBottom: 0,
      }}
    >
      {Platform.OS === "android" && (
        <NativeHeaderSide side="Left">
          <NativeHeaderPressable onPress={() => router.back()}>
            <Icon size={28}>
              <Papicons name="Cross" />
            </Icon>
          </NativeHeaderPressable>
        </NativeHeaderSide>
      )}

      <Stack
        padding={20}
        gap={10}
        vAlign="center"
        hAlign="center"
      >
        <Icon size={42}>
          <Papicons name="clock" color="#29947A" />
        </Icon>
        <Typography variant="h2" align="center">
          Promis, ça arrive (vraiment) bientôt !
        </Typography>
        <Typography variant="body1" color="secondary" align="center">
          L'onglet est toujours en cours de développement. Il arrivera prochainement dans une version future de Papillon.
        </Typography>
        <Typography variant="body1" color="primary" align="center" onPress={() => {
          Linking.openURL("https://www.instagram.com/thepapillonapp/");
        }} style={{
          textDecorationLine: "underline",
        }}>
          Et pour rester au courant, tu peux nous suivre sur les réseaux sociaux !
        </Typography>
      </Stack>
    </View>
  );
}