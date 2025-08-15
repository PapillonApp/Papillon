import { useRouter } from "expo-router";
import * as pronote from "pawnote";
import { useMemo, useState } from "react";
import React, { Alert, ScrollView, StyleSheet, View } from "react-native";

import UnderConstructionNotice from "@/components/UnderConstructionNotice";
import { initializeAccountManager } from "@/services/shared";
import { ARD } from "@/services/ard";
import { useAccountStore } from "@/stores/account";
import { Services } from "@/stores/account/types";
import Button from "@/ui/components/Button";
import Stack from "@/ui/components/Stack";
import { getSubjectEmoji } from "@/utils/subjects/emoji";
import List from "@/ui/components/List";
import Item from "@/ui/components/Item";
import Typography from "@/ui/components/Typography";
import TabFlatList from "@/ui/components/TabFlatList";
import LinearGradient from "react-native-linear-gradient";

import * as Papicons from "@getpapillon/papicons";
import Icon from "@/ui/components/Icon";
import AnimatedPressable from "@/ui/components/AnimatedPressable";
import Course from "@/ui/components/Course";
import { NativeHeaderHighlight, NativeHeaderPressable, NativeHeaderSide, NativeHeaderTitle } from "@/ui/components/NativeHeader";
import { BellDotIcon, ChevronDown, Filter, ListFilter } from "lucide-react-native";
import NativeHeaderTopPressable from "@/ui/components/NativeHeaderTopPressable";
import { LinearTransition } from "react-native-reanimated";
import { Animation } from "@/ui/utils/Animation";
import { Dynamic } from "@/ui/components/Dynamic";
import { useTheme } from "@react-navigation/native";
import adjust from "@/utils/adjustColor";
import { checkAndUpdateModel } from "@/utils/magic/updater";
import ModelManager from "@/utils/magic/ModelManager";

export default function TabOneScreen() {
  const [loading, setLoading] = useState(false);
  const [ardLoading, setArdLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const router = useRouter();

  const theme = useTheme();
  const { colors } = theme;

  const date = useMemo(() => new Date(), []);
  const accent = "#009EC5";
  const foreground = adjust(accent, theme.dark ? 0.4 : -0.4);

  const generateUUID = () => {
    // Generate a random UUID (version 4)
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  const InitManager = async () => {
    getSubjectEmoji("français")
  }

  const loginDemoAccount = async () => {
    try {
      setLoading(true);
      const accounts = useAccountStore.getState().accounts;
      for (const account of accounts) {
        useAccountStore.getState().removeAccount(account)
      }
      const uuid = generateUUID();

      const session = pronote.createSessionHandle();
      const auth = await pronote.loginCredentials(session, {
        url: "https://pronote.papillon.bzh/",
        deviceUUID: uuid,
        kind: pronote.AccountKind.STUDENT,
        username: "demonstration",
        password: "E2hgDv918W33",
      });
      console.log("First logged in successfully:", auth);
      useAccountStore.getState().setLastUsedAccount(uuid);
      useAccountStore.getState().addAccount({
        id: uuid,
        firstName: "Demo",
        lastName: "Unknown",
        services: [{
          id: uuid,
          auth: {
            accessToken: auth.token,
            refreshToken: auth.token,
            additionals: {
              instanceURL: auth.url,
              kind: auth.kind,
              username: auth.username,
              deviceUUID: uuid,
            },
          },
          serviceId: Services.PRONOTE,
          createdAt: (new Date()).toISOString(),
          updatedAt: (new Date()).toISOString(),
        }],
        createdAt: (new Date()).toISOString(),
        updatedAt: (new Date()).toISOString(),
      });
      await initializeAccountManager();
      Alert.alert("Success", "You are now logged in to the Papillon demo account!");
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Failed to log in:", error);
    }
  };

  const testArdConnection = async () => {
    try {
      setArdLoading(true);

      const ard = new ARD("sus");

      const credentials = {
        additionals: {
          username: "xxxx",
          password: "xxxx",
          schoolId: "xxxx",
        }
      };

      console.log("Tentative de connexion ARD...");

      await ard.refreshAccount(credentials);
      console.log("Connexion ARD réussie !");

      await new Promise(resolve => setTimeout(resolve, 5000));

      const balances = await ard.getCanteenBalances();
      console.log("Soldes ARD:", balances);

      Alert.alert(
        "ARD Réussi",
        `\nSoldes trouvés: ${balances.length}`
      );

      setArdLoading(false);
    } catch (error) {
      setArdLoading(false);
      console.error("Erreur ARD:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      Alert.alert("Erreur ARD", `Échec de la connexion: ${errorMessage}`);
    }
  };

  return (
    <>
      <LinearGradient
        colors={[accent + "77", accent + "00"]}
        locations={[0, 0.5]}
        style={{ position: "absolute", top: 0, left: 0, right: 0, height: "100%" }}
      />

      <TabFlatList
        translucent
        backgroundColor="transparent"
        height={200}
        header={
          <Stack padding={20}>
            <Typography variant="h1" align="center">
              Je suis devenu riche grâce à LUMA AI
            </Typography>
          </Stack>
        }
        gap={12}
        data={[
          {
            icon: <Papicons.Calendar />,
            title: "Prochains cours",
            redirect: "(tabs)/calendar",
            render: () => (
              <Stack padding={12} gap={6} style={{ paddingBottom: 6 }}>
                <Course
                  id="id1"
                  name="Traitement des données"
                  teacher="Baptive V."
                  room="Bât. 12 amphi 4"
                  color="#0095D6"
                  status={{ label: "Travail dirigé", canceled: false }}
                  variant="primary"
                  start={1750126049}
                  end={1750129649}
                />
                <Course
                  id="id1"
                  name="Traitement des données"
                  teacher="Baptive V."
                  room="Bât. 12 amphi 4"
                  color="#0095D6"
                  status={{ label: "Travail dirigé", canceled: false }}
                  variant="primary"
                  start={1750126049}
                  end={1750129649}
                />
              </Stack>
            )
          },
          __DEV__ && {
            icon: <Papicons.Ghost />,
            title: "Outils de développement",
            render: () => (
              <List marginBottom={0}>
                <Item
                  onPress={() => router.navigate("/demo")}
                >
                  <Typography variant="title" color="text">
                    Demo components
                  </Typography>
                </Item>
                <Item
                  onPress={() => router.navigate("/devmode")}
                >
                  <Typography variant="title" color="text">
                    Papillon DevMode
                  </Typography>
                </Item>
                <Item
                  onPress={() => loginDemoAccount()}
                >
                  <Typography variant="title" color="text">
                    Login to Papillon Demo Account
                  </Typography>
                </Item>
                <Item
                  onPress={() => InitManager()}
                >
                  <Typography variant="title" color="text">
                    Init Manager
                  </Typography>
                </Item>
                <Item
                  onPress={() => router.navigate("/(onboarding)/welcome")}
                >
                  <Typography variant="title" color="text">
                    Onboarding
                  </Typography>
                </Item>
                <Item
                  onPress={() => ModelManager.init()}
                >
                  <Typography variant="title" color="text">
                    Init ModelManager
                  </Typography>
                </Item>
                <Item
                  onPress={async () => {
                    try {
                      const result = await checkAndUpdateModel(
                        "8.0.0",
                        "http://192.168.1.124:8000/"
                      );

                      console.log("Résultat mise à jour:", result);

                      Alert.alert(
                        "Model Updater",
                        `Updated: ${result.updated}\nReason: ${result.reason ?? "ok"}`
                      );
                    } catch (error) {
                      console.error("Erreur checkAndUpdateModel:", error);
                      Alert.alert("Erreur", String(error));
                    }
                  }}
                >
                  <Typography variant="title" color="text">
                    checkAndUpdateModel
                  </Typography>
                </Item>

              </List>
            )
          }
        ]}
        renderItem={({ item }) => (
          <Stack card radius={26}>
            <Stack direction="horizontal" hAlign="center" padding={12} gap={10} style={{ paddingBottom: 0, height: 44 }}>
              <Icon papicon opacity={0.6} style={{ marginLeft: 4 }}>
                {item.icon}
              </Icon>
              <Typography numberOfLines={1} style={{ flex: 1, opacity: 0.6 }} variant="title" color="text">
                {item.title}
              </Typography>
              {item.redirect && (
                <AnimatedPressable
                  onPress={() => router.navigate(item.redirect)}
                >
                  <Stack card direction="horizontal" hAlign="center" padding={[12, 6]} gap={6}>
                    <Typography variant="body2" color="secondary" inline style={{ marginTop: 2 }}>
                      Afficher plus
                    </Typography>
                    <Icon size={20} papicon opacity={0.5}>
                      <Papicons.Arrow />
                    </Icon>
                  </Stack>
                </AnimatedPressable>
              )}
            </Stack>
            <item.render />
          </Stack>
        )}
      />

      <NativeHeaderSide side="Left">
        <NativeHeaderPressable>
          <Icon>
            <ListFilter />
          </Icon>
        </NativeHeaderPressable>
      </NativeHeaderSide>

      <NativeHeaderTitle key={"header-" + date.toISOString()}>
        <NativeHeaderTopPressable
          layout={Animation(LinearTransition)}
        >
          <Dynamic
            style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
          >
            <Dynamic animated key={date.toLocaleDateString("fr-FR", { weekday: "long" })}>
              <Typography variant="navigation" color={foreground}>
                {date.toLocaleDateString("fr-FR", { weekday: "long" })}
              </Typography>
            </Dynamic>
            <Dynamic animated>
              <NativeHeaderHighlight color={foreground} style={{ marginBottom: 0 }}>
                {date.toLocaleDateString("fr-FR", { day: "numeric" })}
              </NativeHeaderHighlight>
            </Dynamic>
            <Dynamic animated key={date.toLocaleDateString("fr-FR", { month: "long" })}>
              <Typography variant="navigation" color={foreground}>
                {date.toLocaleDateString("fr-FR", { month: "long" })}
              </Typography>
            </Dynamic>
          </Dynamic>
          <Dynamic animated>
            <ChevronDown color={colors.text} opacity={0.7} />
          </Dynamic>
        </NativeHeaderTopPressable>
      </NativeHeaderTitle>

      <NativeHeaderSide side="Right">
        <NativeHeaderPressable>
          <Icon>
            <BellDotIcon />
          </Icon>
        </NativeHeaderPressable>
      </NativeHeaderSide>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16
  },
  containerContent: {
    justifyContent: "center",
    alignItems: "center",
  }
});