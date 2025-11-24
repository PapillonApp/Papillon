import Stack from "@/ui/components/Stack";
import Typography from "@/ui/components/Typography";
import { useTheme } from "@react-navigation/native";
import React from "react";
import { ScrollView, Text, View, Image } from "react-native";

export default function AboutAverages() {
  const theme = useTheme();

  return (
    <ScrollView
      style={{ flex: 1 }}
    >
      <Image
        source={require("@/assets/images/kb/averages.png")}
        style={{ width: "100%", height: 180 }}
        tintColor={theme.colors.primary}
      />

      <Stack padding={20} gap={8}>
        <Typography variant="h3">
          À propos des moyennes générales
        </Typography>

        <Typography variant="body1" color="secondary">
          Bien que cela semble trivial, calculer une moyenne générale est un processus complexe, encore plus lorsque nous ne savons rien de votre établissement ainsi que de son processus de calcul.
        </Typography>

        <Typography variant="h4" style={{ marginTop: 20 }}>
          Comment Papillon calcule-t-il les moyennes générales ?
        </Typography>

        <Typography variant="body1" color="secondary">
          Pour cela, il existe deux méthodes princpales : la moyenne des matières ainsi que la moyenne pondérée des notes.
        </Typography>

        <Typography variant="body1" color="secondary">
          Papillon regroupe automatiquement vos notes en fonction de leur matière présumée et en calcule la moyenne en tenant compte des coefficients et autres paramètres. Ensuite, il peut ou non calculer la moyennes des matières entre-elles.
        </Typography>

        <Typography variant="h4" style={{ marginTop: 20 }}>
          Pourquoi peut-il se tromper ?
        </Typography>

        <Typography variant="body1" color="secondary">
          Il ne s'agit que d'estimations, car nous manquons souvent du contexte nécessaire pour calculer une moyenne exacte. D'autant plus que certains services obfusquent parfois le fonctionnement de leur calcul.
        </Typography>

        <Typography variant="h4" style={{ marginTop: 20 }}>
          Comment savoir si c'est ma VRAIE moyenne ?
        </Typography>

        <Typography variant="body1" color="secondary">
          Lorsque Papillon affiche qu'une moyenne est fournie par l'établissement, c'est qu'il n'y a aucune différence entre votre moyenne réelle et celle affichée. Cependant, si la mention "estimée" ou une date apparaît, il peut exister une différence de l'ordre de quelques demi-points.
        </Typography>
      </Stack>
    </ScrollView>
  );
}
