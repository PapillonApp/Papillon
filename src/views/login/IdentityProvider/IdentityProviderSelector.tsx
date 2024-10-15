import React, { memo, useEffect, useState } from "react";
import { Image, View, StyleSheet, Text } from "react-native";

import type { Screen } from "@/router/helpers/types";
import { ScrollView } from "react-native-gesture-handler";
import { NativeItem, NativeList, NativeListHeader, NativeText } from "@/components/Global/NativeComponents";
import { Info } from "lucide-react-native";

const IdentityProviderSelector: Screen<"IdentityProviderSelector"> = ({ navigation }) => {
  const universityProviders = [
    {
      name: "univ_uphf",
      title: "Université Polytechnique Hauts-de-France",
      description: "Utilisez votre compte UPHF pour vous connecter",
      image: require("@/../assets/images/service_uphf.png"),
      navigate: () => navigation.navigate("UnivUphf_Login"),
    },
  ];

  const identityProviders = [
    {
      name: "univ_rennes1",
      title: "Université Rennes 1",
      description: "Utilisez votre compte Sésame pour vous connecter",
      image: require("@/../assets/images/service_rennes1.png"),
      navigate: () => navigation.navigate("UnivRennes1_Login"),
    },
    {
      name: "univ_rennes2",
      title: "Université Rennes 2",
      description: "Utilisez votre compte Sésame pour vous connecter",
      image: require("@/../assets/images/service_rennes2.png"),
      navigate: () => navigation.navigate("UnivRennes2_Login"),
    },
    {
      name: "univ_limoges",
      title: "Université de Limoges",
      description: "Utilisez votre compte Biome pour vous connecter",
      image: require("@/../assets/images/service_unilim.png"),
      navigate: () => navigation.navigate("UnivLimoges_Login"),
    },
    {
      name: "univ_sorbonne_paris_nord",
      title: "Université Sorbonne Paris Nord",
      description: "Utilisez votre compte Sorbonne pour vous connecter",
      image: require("@/../assets/images/service_uspn.png"),
      navigate: () => navigation.navigate("UnivSorbonneParisNord_login"),
    },
  ];

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 16, paddingTop: 0 }}
    >
      <NativeListHeader label="Service universitaire disponible" />

      <NativeList>
        {universityProviders.map((identityProvider) => (
          <NativeItem
            key={identityProvider.name}
            onPress={() => identityProvider.navigate()}
            leading={<Image source={identityProvider.image} style={{ width: 40, height: 40, borderRadius: 300 }} />}
          >
            <NativeText variant="title">{identityProvider.title}</NativeText>
            <NativeText variant="subtitle">
              {identityProvider.description}
            </NativeText>
          </NativeItem>
        ))}
      </NativeList>

      <NativeListHeader label="Fournisseurs disponibles" />

      <NativeList>
        {identityProviders.map((identityProvider) => (
          <NativeItem
            key={identityProvider.name}
            onPress={() => identityProvider.navigate()}
            leading={<Image source={identityProvider.image} style={{ width: 40, height: 40, borderRadius: 300 }} />}
          >
            <NativeText variant="title">{identityProvider.title}</NativeText>
            <NativeText variant="subtitle">
              {identityProvider.description}
            </NativeText>
          </NativeItem>
        ))}
      </NativeList>


      <NativeList inline>
        <NativeItem
          icon={<Info />}
        >
          <NativeText variant="subtitle">
            Les founisseurs d'identité ne fournissent pas de données (calendrier, notes, etc...) mais permettent de vous connecter à l'application.
          </NativeText>
        </NativeItem>
      </NativeList>

    </ScrollView>
  );
};

export default IdentityProviderSelector;