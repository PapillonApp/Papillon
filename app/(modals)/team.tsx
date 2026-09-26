import Icon from "@/ui/components/Icon";
import Button from "@/ui/new/Button";
import Typography from "@/ui/new/Typography";
import { Papicons } from "@getpapillon/papicons";
import { useRouter, useTheme } from "expo-router";
import React from "react";
import { View, Platform, Image, Linking } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TeamModal: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <View
      style={{
        gap: 0
      }}
    >
      <Image
        source={require("@/assets/images/team.jpg")}
        style={{
          width: "100%",
          height: 200,
          resizeMode: "cover",
        }}
      />

      <View
        style={{
          padding: 22,
          gap: 8
        }}
      >
        <Typography variant="h3">Salut, nous sommes les étudiants derrière Papillon ! 👋</Typography>
        <Typography variant="body1" color="textSecondary">
          Merci beaucoup d'utiliser Papillon ! Nous savons que parfois, certaines choses ne fonctionnent pas comme prévu, mais nous travaillons au quotidien a améliorer l'application pour vous offrir la meilleure expérience possible.
        </Typography>

        <View style={{ height: 8 }} />

        <Typography variant="body1" weight="semibold" color="textPrimary">
          Pour rester à jour sur les nouveautés, n'hésitez pas a nous suivre sur Instagram, on y partage tout !
        </Typography>

        <View style={{ paddingTop: 12, flexDirection: "row", gap: 8 }}>
        <Button
          label="Nos réseaux"
          onPress={() => {
            Linking.openURL("https://papillon.bzh/links");
          }}
          variant="primary"
          style={{flex: 1}}
          leading={
            <Papicons color="white" name="link" />
          }
        />
        <Button
          label="Ignorer"
          variant="secondary"
          onPress={() => {
            router.back();
          }}
          style={{flex: 1}}
          leading={
            <Icon>
              <Papicons name="minus" />
            </Icon>
          }
        />
        </View>
      </View>
    </View>
  )
};

export default TeamModal;