import Typography from "@/ui/components/Typography";
import React from "react";
import { View, ScrollView, Image } from "react-native";
import { Papicons } from "@getpapillon/papicons";
import { useTheme } from "@react-navigation/native";

export default function ChangelogScreen() {
  const theme = useTheme();
  const { colors } = theme;

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{
        padding: 20,
        gap: 12,
        justifyContent: "center",
      }}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior="automatic"
    >
      <Image
        source={require("../assets/images/icon.png")}
        style={{ width: 72, height: 72, alignSelf: "center", borderRadius: 20, marginBottom: 8 }}
      />
      <Typography variant="h3" align="center">
        Bienvenue sur Papillon v8
      </Typography>
      <Typography variant="body1" color="secondary" align="center">
        Cette mise à jour a été repensée de fond en comble pour améliorer votre expérience. Mais cela prend du temps, nous faisons de notre mieux pour faire de cette version la meilleure possible.
      </Typography>

      <View style={{ height: 16 }} />

      <Papicons name="clock" size={32} color={colors.text} style={{ alignSelf: "center" }} />
      <Typography variant="h4" align="center">
        Pourquoi tout changer ?
      </Typography>
      <Typography variant="body1" color="secondary" align="center">
        Vous évoluez, nous aussi ! Papillon n'a jamais cessé de grandir depuis des années, et nous nous devons d'utiliser une application modernisée afin d'offrir la meilleure expérience et de garantir le futur de l'application.
      </Typography>
      <Typography variant="body1" color="primary" align="center">
        Ce processus prend énormément de temps, et en tant qu'étudiants et lycéens, on doit aussi aller en cours, donc on fait ce qu'on peut avec ce qu'on à !
      </Typography>
      <Typography variant="caption" color="secondary" align="center">
        (Si vous aimez ce qu'on fait, n'hésitez pas à nous soutenir depuis les paramètres !)
      </Typography>

      <View style={{ height: 16 }} />

      <Papicons name="ghost" size={32} color={colors.text} style={{ alignSelf: "center" }} />
      <Typography variant="h4" align="center">
        Il manque (telle ou telle) fonctionnalité ?
      </Typography>
      <Typography variant="body1" color="secondary" align="center">
        Pour vous permettre d'utiliser Papillon dès la rentrée, l'application est sortie plus lègere en fonctionnalités que prévu. Nous travaillons d'arrache-pied pour réintégrer les fonctionnalités manquantes au plus vite.
      </Typography>

      <View style={{ height: 16 }} />

      <Papicons name="unlock" size={32} color={colors.text} style={{ alignSelf: "center" }} />
      <Typography variant="h4" align="center">
        J'ai un bug avec (quelque chose) !
      </Typography>
      <Typography variant="body1" color="secondary" align="center">
        Il est possible que certaines choses ne fonctionnent pas. Si la télémétrie est activée, vos bugs nous seront automatiquement parvenus, sinon, n'hésitez pas à nous contacter (Paramètres {">"} À propos)
      </Typography>

      <View style={{ height: 16 }} />

      <Papicons name="heart" size={32} color={colors.text} style={{ alignSelf: "center" }} />
      <Typography variant="h4" align="center">
        Merci d'être là depuis le début !
      </Typography>
      <Typography variant="body1" color="secondary" align="center">
        Nous apprécions votre soutien et vos retours. N'hésitez pas à nous faire part de vos suggestions ou de vos problèmes sur les réseaux sociaux ou par email.
      </Typography>
    </ScrollView>
  );
};