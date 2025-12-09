import Icon from "@/ui/components/Icon";
import Stack from "@/ui/components/Stack";
import Typography from "@/ui/components/Typography";
import { Papicons } from "@getpapillon/papicons";
import React from "react";
import { Linking, View } from "react-native";

export default function Soon() {
  return (
    <View
      style={{
        padding: 20,
        paddingBottom: 0,
      }}
    >
      <Stack
        padding={20}
        gap={10}
        vAlign="center"
        hAlign="center"
      >
        <Icon size={42}>
          <Papicons name="clock" />
        </Icon>
        <Typography variant="h3" align="center">
          Ça arrive bientôt !
        </Typography>
        <Typography variant="body1" color="secondary" align="center">
          L'onglet est en cours de développement. Il arrivera prochainement dans une version future de Papillon.
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