import React from "react";
import { Alert, Platform, TextInput, View } from "react-native";
import { useTheme } from "expo-router/react-navigation";

import { useSettingsStore } from "@/stores/settings";
import type { NotificationPreferences } from "@/stores/settings/types";
import { cancelSystemNotifications, requestSystemNotificationPermission } from "@/utils/notifications";
import Icon from "@/ui/components/Icon";
import List from "@/ui/new/List";
import NativeSwitch from "@/ui/native/NativeSwitch";
import Typography from "@/ui/new/Typography";
import { Papicons } from "@getpapillon/papicons";
import { useSafeHorizontalPadding } from "@/ui/hooks/useSafeHorizontalPadding";

const defaults: NotificationPreferences = {
  enabled: false,
  courses: true,
  homework: true,
  grades: false,
  news: false,
  dailyTime: "19:00",
};

const options: Array<{ id: "courses" | "homework" | "grades" | "news"; title: string; detail: string; icon: string }> = [
  { id: "courses", title: "Cours du lendemain", detail: "Un rappel avec les premiers cours de demain.", icon: "Calendar" },
  { id: "homework", title: "Devoirs", detail: "Les devoirs prévus pour demain et tes rappels personnels.", icon: "List" },
  { id: "grades", title: "Nouvelles notes", detail: "Une alerte quand une note est ajoutée.", icon: "Grades" },
  { id: "news", title: "Actualités", detail: "Une alerte quand une nouvelle actualité arrive.", icon: "Calendar" },
];

export default function NotificationSettingsScreen() {
  const { colors } = useTheme();
  const padding = useSafeHorizontalPadding(16);
  const stored = useSettingsStore(state => state.personalization.notificationPreferences);
  const mutateSettings = useSettingsStore(state => state.mutateProperty);
  const preferences = { ...defaults, ...stored };
  const update = (changes: Partial<NotificationPreferences>) => {
    mutateSettings("personalization", { notificationPreferences: { ...preferences, ...changes } });
  };

  const setEnabled = async (enabled: boolean) => {
    if (!enabled) {
      update({ enabled: false });
      await cancelSystemNotifications();
      return;
    }
    if (!(await requestSystemNotificationPermission())) {
      Alert.alert("Notifications désactivées", "Autorise les notifications dans les réglages de Windows ou du navigateur, puis réessaie.");
      return;
    }
    update({ enabled: true });
  };

  return (
    <List contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: 16, paddingBottom: 36, ...padding }} style={{ flex: 1, backgroundColor: colors.overground }}>
      <List.Section>
        <List.SectionTitle><List.Label>Notifications système</List.Label></List.SectionTitle>
        <List.Item>
          <List.Leading><Icon><Papicons name="Calendar" /></Icon></List.Leading>
          <Typography variant="title">Activer les notifications</Typography>
          <Typography variant="body1" color="textSecondary">Papillon peut envoyer des alertes système pour les catégories ci-dessous.</Typography>
          <List.Trailing><NativeSwitch value={preferences.enabled} onValueChange={setEnabled} /></List.Trailing>
        </List.Item>
        {options.map(option => (
          <List.Item key={option.id}>
            <List.Leading><Icon><Papicons name={option.icon} /></Icon></List.Leading>
            <Typography variant="title">{option.title}</Typography>
            <Typography variant="body1" color="textSecondary">{option.detail}</Typography>
            <List.Trailing><NativeSwitch value={preferences[option.id]} onValueChange={value => {
              update({ [option.id]: value });
              if (!value) void cancelSystemNotifications(option.id);
            }} disabled={!preferences.enabled} /></List.Trailing>
          </List.Item>
        ))}
      </List.Section>
      <List.Section>
        <List.SectionTitle><List.Label>Heure des rappels quotidiens</List.Label></List.SectionTitle>
        <List.Item>
          <List.Leading><Icon><Papicons name="Clock" /></Icon></List.Leading>
          <View style={{ flex: 1, gap: 3 }}>
            <Typography variant="title">Heure du rappel</Typography>
            <Typography variant="body1" color="textSecondary">Utilisée pour le résumé des cours et devoirs du lendemain.</Typography>
          </View>
          <TextInput
            accessibilityLabel="Heure des rappels"
            value={preferences.dailyTime}
            onChangeText={value => { if (/^\d{0,2}(:\d{0,2})?$/.test(value)) update({ dailyTime: value }); }}
            onEndEditing={() => { if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(preferences.dailyTime)) update({ dailyTime: "19:00" }); }}
            keyboardType={Platform.OS === "web" ? "default" : "numbers-and-punctuation"}
            placeholder="19:00"
            placeholderTextColor={colors.text + "80"}
            style={{ minWidth: 84, textAlign: "center", color: colors.text, backgroundColor: colors.item, borderColor: colors.border, borderWidth: 1, borderRadius: 10, padding: 9 }}
          />
        </List.Item>
      </List.Section>
    </List>
  );
}
