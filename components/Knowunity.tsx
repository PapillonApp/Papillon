import { Papicons } from "@getpapillon/papicons";
import { useTheme } from "@react-navigation/native";
import { canOpenURL, openURL } from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import React, { useMemo } from "react";
import { Alert, Image, StyleSheet, TouchableOpacity, View } from "react-native";

import { useSettingsStore } from "@/stores/settings";
import { trackOptionalEvent } from "@/utils/logger/analytics";
import Icon from "@/ui/components/Icon";
import Stack from "@/ui/components/Stack";
import Button from "@/ui/new/Button";
import List from "@/ui/new/List";
import Typography from "@/ui/new/Typography";

interface KnowunityProps {
  subjectColor: string;
  subjectName: string;
  subjectEmoji: string;
  formattedTask: string;
}

const RandomSkeleton = ({ count = 14, maxWidth = 80, minWidth = 20 }) => {
  const { colors } = useTheme();
  const items = useMemo(() => {
    return Array.from({ length: count }).map((_, index) => ({
      id: index,
      width: Math.floor(Math.random() * (maxWidth - minWidth)) + minWidth,
    }));
  }, [count, maxWidth, minWidth]);

  return (
    <View style={styles.container}>
      {items.map((item) => (
        <View
          key={item.id}
          style={[styles.bar, { width: item.width, backgroundColor: colors.border }]}
        />
      ))}
    </View>
  );
};

const CardStack = ({ count = 3, title, backgroundColor, emoji }: { count?: number; title: string; backgroundColor: string; emoji: string }) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.cardContainer,
        { borderColor: colors.border, backgroundColor: backgroundColor + 30 },
      ]}
    >
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.card,
            {
              zIndex: index,
              backgroundColor: colors.background,
              borderColor: colors.text + 20,
              transform: `rotate(${4 * index}deg)`,
              marginLeft: index === 0 ? 0 : -170,
              opacity: 1 - (2 - index) * 0.2,
            },
          ]}
        >
          <Typography variant="h2" align="center">
            {emoji}
          </Typography>
          <Typography variant="body1" weight="semibold" align="center" style={{ marginTop: -6, lineHeight: 18, overflow: "visible" }}>
            {title}
          </Typography>
          <RandomSkeleton count={20} maxWidth={60} />
        </View>
      ))}
    </View>
  );
};

export default function Knowunity({ subjectColor, subjectName, subjectEmoji, formattedTask }: KnowunityProps) {
  const theme = useTheme();
  const settingsStore = useSettingsStore(state => state.personalization);
  const mutateProperty = useSettingsStore(state => state.mutateProperty);
  const knowunityEnabled = settingsStore.knowunityEnabled ?? true;

  if (!knowunityEnabled) {
    return null;
  }

  return (
    <List.Section>
      <List.SectionTitle>
        <Stack direction="horizontal" hAlign="center" gap={12} style={{ marginTop: 12, paddingHorizontal: 6 }}>
          <Image
            source={require("@/assets/images/knowunity.png")}
            style={{ width: 30, height: 30 }}
          />
          <Stack gap={0} inline flex>
            <Typography variant="body1" weight="bold">Fiches de révision pour t’aider</Typography>
            <Typography variant="body2" color="textSecondary" style={{ marginTop: -2 }}>
              avec Knowunity
            </Typography>
          </Stack>

          <TouchableOpacity onPress={() => WebBrowser.openBrowserAsync("https://docs.papillon.bzh/support/kb/partners")}>
            <Stack width={32} height={24}>
              <Icon opacity={0.5}>
                <Papicons name="info" />
              </Icon>
            </Stack>
          </TouchableOpacity>
        </Stack>
      </List.SectionTitle>
      <List.View>
        <Stack card padding={16} gap={16} style={{ marginVertical: 12 }}>
          <CardStack backgroundColor={subjectColor} title={subjectName} emoji={subjectEmoji} />
          <Typography variant="body1">Trouve des fiches et pose des questions à propos de {subjectName} pour t'aider avec tes devoirs.</Typography>

          <View style={{ width: "100%", flexDirection: "row", gap: 12, alignItems: "center" }}>
            <Button
              height={44}
              style={{ flex: 1 }}
              color={subjectColor}
              label="Découvrir les fiches"
              onPress={async () => {
                await trackOptionalEvent("knowunity_discover_sheets_pressed");
                const URL = "https://knowunity.fr/papillon?text=" + new URLSearchParams(formattedTask);
                const isValid = await canOpenURL(URL);

                if (isValid) {
                  await openURL(URL);
                }
              }}
            />

            <TouchableOpacity onPress={() => {
              Alert.alert(
                "Masquer l'intégration Knowunity",
                "Êtes-vous sûr de vouloir masquer cette intégration ?",
                [
                  { text: "Annuler", style: "cancel" },
                  {
                    text: "Masquer",
                    style: "destructive",
                    onPress: () => mutateProperty("personalization", {
                      ...settingsStore,
                      knowunityEnabled: false,
                    }),
                  },
                ]
              );
            }}>
              <Stack width={44} height={44} card radius={100} backgroundColor={theme.colors.card} vAlign="center" hAlign="center">
                <Icon opacity={0.5}>
                  <Papicons name="cross" />
                </Icon>
              </Stack>
            </TouchableOpacity>
          </View>
        </Stack>
      </List.View>
    </List.Section>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
    flexWrap: "wrap",
  },
  bar: {
    height: 9,
    borderRadius: 3,
  },
  cardContainer: {
    justifyContent: "center",
    paddingTop: 35,
    alignItems: "center",
    width: "100%",
    height: 148,
    borderRadius: 10,
    borderWidth: 1,
    overflow: "hidden",
    flexDirection: "row",
  },
  card: {
    gap: 10,
    padding: 15,
    width: 200,
    height: 150,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderWidth: 1,
  },
});
