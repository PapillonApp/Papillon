import React, { useState, useEffect, useLayoutEffect } from "react";
import { Image, Linking, Platform, ScrollView, View } from "react-native";

import PackageJSON from "../../../package.json";
import datasets from "@/consts/datasets.json";
import uuid from "@/utils/uuid-v4";
import { NativeItem, NativeList, NativeListHeader, NativeText } from "@/components/Global/NativeComponents";
import { AlertTriangle, Bug, Sparkles, X } from "lucide-react-native";
import { useTheme } from "@react-navigation/native";

import Reanimated, { FadeInUp, FadeOutUp, LinearTransition } from "react-native-reanimated";
import PapillonSpinner from "@/components/Global/PapillonSpinner";
import { animPapillon } from "@/utils/ui/animations";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import InsetsBottomView from "@/components/Global/InsetsBottomView";
import { TouchableOpacity } from "react-native-gesture-handler";
import { PressableScale } from "react-native-pressable-scale";

import AsyncStorage from "@react-native-async-storage/async-storage";
import {Screen} from "@/router/helpers/types";
import { OfflineWarning, useOnlineStatus } from "@/hooks/useOnlineStatus";

interface Feature {
  title: string;
  subtitle: string;
  image: string;
  navigation: string;
  href: string | null;
  button: string;
}

interface Version {
  version: string;
  title: string;
  subtitle: string;
  illustration: string;
  description: string;
  features: Feature[];
  bugfixes: Feature[];
}

const currentVersion = PackageJSON.version;
const changelogURL = datasets.changelog.replace("[version]", currentVersion.split(".").slice(0, 2).join("."));

const ChangelogScreen: Screen<"ChangelogScreen"> = ({ route, navigation }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const  { isOnline } = useOnlineStatus();

  const [changelog, setChangelog] = useState<Version|null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const acknowledgeUpdate = async () => {
    AsyncStorage.setItem("changelog.lastUpdate", PackageJSON.version);
  };

  useEffect(() => {
    if(!changelog) {
      setLoading(true);
      fetch(changelogURL + "#update=" + uuid()) // #TODO : remove, it's for development
        .then((response) => response.json())
        .then((json) => {
          if (json.version) {
            setChangelog(json);
            setLoading(false);
            setNotFound(false);
            acknowledgeUpdate();
          }
        })
        .catch((err) => {
          setLoading(false);
          setNotFound(true);
        });
    }
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        Platform.OS == "ios" &&
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            width: 32,
            aspectRatio: 1 / 1,
            backgroundColor: theme.colors.text + "18",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 30,
          }}
        >
          <X
            color={theme.colors.text}
            size={20}
            strokeWidth={3}
            opacity={0.7}
          />
        </TouchableOpacity>
      )
    });
  }, [navigation, route.params, theme.colors.text]);

  return (
    <ScrollView
      style={[
        {
          padding: 16,
          paddingTop: 0
        }
      ]}
      contentInsetAdjustmentBehavior="automatic"
    >
      {!isOnline ? (
        <OfflineWarning cache={false} />
      ) : loading ? (
        <NativeList
          inline
          animated
          entering={animPapillon(FadeInUp)}
          exiting={animPapillon(FadeOutUp)}
        >
          <NativeItem
            leading={
              <PapillonSpinner
                color={theme.colors.primary}
                size={24}
                strokeWidth={3.5}
              />
            }
          >
            <NativeText variant="title">
              Chargement des nouveautés...
            </NativeText>
            <NativeText variant="subtitle">
              Obtention des dernières nouveautés de l'application Papillon
            </NativeText>
          </NativeItem>
        </NativeList>
      ) : notFound ? (
        <NativeList
          inline
          animated
          entering={animPapillon(FadeInUp)}
          exiting={animPapillon(FadeOutUp)}
        >
          <NativeItem icon={<AlertTriangle />}>
            <NativeText variant="title">
              Impossible de trouver les notes de mise à jour
            </NativeText>
            <NativeText variant="subtitle">
              Les nouveautés de la version n'ont pas du être publiées ou
              alors une erreur est survenue...
            </NativeText>
          </NativeItem>
        </NativeList>
      ) : (
        changelog && (
          <Reanimated.View
            entering={animPapillon(FadeInUp)}
            exiting={animPapillon(FadeOutUp)}
            layout={animPapillon(LinearTransition)}
          >
            <PressableScale>
              <NativeList animated inline>
                <Image
                  source={{ uri: changelog.illustration }}
                  style={{
                    width: "100%",
                    aspectRatio: 2 / 1,
                  }}
                />
                <NativeItem pointerEvents="none">
                  <NativeText
                    variant="default"
                    style={{
                      color: theme.colors.primary,
                      fontFamily: "semibold",
                    }}
                  >
                    Papillon - version {changelog.version}
                  </NativeText>
                  <NativeText variant="titleLarge">
                    {changelog.title}
                  </NativeText>
                  <NativeText variant="subtitle">
                    {changelog.subtitle}
                  </NativeText>
                </NativeItem>
                <NativeItem pointerEvents="none">
                  <NativeText variant="default">
                    {changelog.description}
                  </NativeText>
                </NativeItem>
              </NativeList>
            </PressableScale>

            <Reanimated.View>
              <NativeListHeader
                animated
                label="Nouveautés"
                icon={<Sparkles />}
              />

              <Reanimated.ScrollView
                horizontal
                style={{
                  width: "100%",
                  overflow: "visible",
                  marginTop: 9,
                }}
                contentContainerStyle={{
                  gap: 10,
                }}
                showsHorizontalScrollIndicator={false}
              >
                {changelog.features.map((feature: Feature, index) => {
                  return (
                    <ChangelogFeature
                      key={index}
                      feature={feature}
                      navigation={navigation}
                      theme={theme}
                    />
                  );
                })}
              </Reanimated.ScrollView>
            </Reanimated.View>

            <Reanimated.View>
              <NativeListHeader animated label="Correctifs" icon={<Bug />} />

              <Reanimated.ScrollView
                horizontal
                style={{
                  width: "100%",
                  overflow: "visible",
                  marginTop: 9,
                }}
                contentContainerStyle={{
                  gap: 10,
                }}
                showsHorizontalScrollIndicator={false}
              >
                {changelog.bugfixes.map((feature: Feature, index) => {
                  return (
                    <ChangelogFeature
                      key={index}
                      feature={feature}
                      navigation={navigation}
                      theme={theme}
                    />
                  );
                })}
              </Reanimated.ScrollView>
            </Reanimated.View>
          </Reanimated.View>
        )
      )}

      <InsetsBottomView />
    </ScrollView>
  );
};

const ChangelogFeature: React.FC<{ feature: Feature, navigation: any, theme: any }> = ({ feature, navigation, theme }) => {
  return (
    <PressableScale>
      <NativeList
        inline
        style={{
          width: 200,
        }}
      >
        <Image
          source={{ uri: feature.image }}
          style={{
            width: "100%",
            aspectRatio: 3 / 2
          }}
        />
        <View pointerEvents="none"
          style={{
            height: 142,
            padding: 12,
            gap: 6,
            paddingLeft: 0,
            marginLeft: 12,
            borderBottomColor: theme.colors.text + "18",
            borderBottomWidth: 0.5,
          }}
        >
          <NativeText variant="title"
            numberOfLines={2}
          >
            {feature.title}
          </NativeText>
          <NativeText variant="subtitle"
            style={{
              height: "100%"
            }}
            ellipsizeMode="tail"
            numberOfLines={4}
          >
            {feature.subtitle}
          </NativeText>
        </View>
        <NativeItem
          onPress={(feature.href || feature.navigation) ? () => {
            if(feature.href) {
              Linking.openURL(feature.href);
            }
            else if(feature.navigation) {
              try {
                navigation.goBack();
                navigation.navigate(feature.navigation);
              }
              catch {}
            }
          } : undefined}
        >
          <NativeText
            variant="default"
            style={{
              color: (feature.href || feature.navigation) ? theme.colors.primary : theme.colors.text + "50"
            }}
          >
            {feature.button || "En savoir plus"}
          </NativeText>
        </NativeItem>

      </NativeList>
    </PressableScale>
  );
};

export default ChangelogScreen;
