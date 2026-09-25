import React, { useMemo, useState } from "react";
import { Alert, Platform, Pressable, TextInput, View } from "react-native";
import { useTheme } from "expo-router/react-navigation";

import { useAccountStore } from "@/stores/account";
import { Services } from "@/stores/account/types";
import { useSettingsStore } from "@/stores/settings";
import type { NotificationCategories, NotificationPreferences, Personalization } from "@/stores/settings/types";
import { getManager } from "@/services/shared";
import { Capabilities } from "@/services/shared/types";
import { isNotificationPaused } from "@/utils/notificationPreferences";
import { isTauriDesktop } from "@/utils/network/fetch";
import { cancelServiceSystemNotifications, cancelSystemNotifications, requestSystemNotificationPermission } from "@/utils/notifications";
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
  dailyTime: "18:00",
  courseLeadMinutes: 15,
  serviceOverrides: {},
  pauseUntil: null,
  pauseIndefinitely: false,
};

const options: Array<{
  id: keyof NotificationCategories;
  capability: Capabilities;
  title: string;
  detail: string;
  icon: string;
}> = [
  { id: "courses", capability: Capabilities.TIMETABLE, title: "Rappel de cours", detail: "Une alerte avant le début de chaque cours.", icon: "Calendar" },
  { id: "homework", capability: Capabilities.HOMEWORK, title: "Devoirs pour demain", detail: "Un rappel quotidien des devoirs à rendre le lendemain.", icon: "List" },
  { id: "grades", capability: Capabilities.GRADES, title: "Nouvelles notes", detail: "Une alerte quand une note est ajoutée.", icon: "Grades" },
  { id: "news", capability: Capabilities.NEWS, title: "Actualités", detail: "Une alerte quand une nouvelle actualité arrive.", icon: "Calendar" },
];

function serviceLabel(serviceId: number): string {
  const labels: Partial<Record<Services, string>> = {
    [Services.PRONOTE]: "PRONOTE",
    [Services.SKOLENGO]: "Skolengo",
    [Services.ECOLEDIRECTE]: "École Directe",
    [Services.TURBOSELF]: "TurboSelf",
    [Services.ARD]: "ARD",
    [Services.IZLY]: "Izly",
    [Services.MULTI]: "Multi",
    [Services.ALISE]: "Alise",
    [Services.APPSCHO]: "AppScho",
    [Services.MOCK_DATA]: "Données fictives",
  };
  return labels[serviceId as Services] ?? "Service scolaire";
}

const notificationCapabilitiesByService: Partial<Record<Services, Capabilities[]>> = {
  [Services.PRONOTE]: [Capabilities.TIMETABLE, Capabilities.HOMEWORK, Capabilities.GRADES, Capabilities.NEWS],
  [Services.SKOLENGO]: [Capabilities.TIMETABLE, Capabilities.HOMEWORK, Capabilities.GRADES, Capabilities.NEWS],
  [Services.ECOLEDIRECTE]: [Capabilities.TIMETABLE, Capabilities.HOMEWORK, Capabilities.GRADES, Capabilities.NEWS],
  [Services.MULTI]: [Capabilities.TIMETABLE, Capabilities.NEWS],
  [Services.APPSCHO]: [Capabilities.TIMETABLE, Capabilities.NEWS],
  [Services.MOCK_DATA]: [Capabilities.TIMETABLE, Capabilities.HOMEWORK, Capabilities.GRADES, Capabilities.NEWS],
};

function nextMidnight(): Date {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(0, 0, 0, 0);
  return date;
}

export default function NotificationSettingsScreen() {
  const { colors } = useTheme();
  const padding = useSafeHorizontalPadding(16);
  const personalization = useSettingsStore(state => state.personalization);
  const mutateSettings = useSettingsStore(state => state.mutateProperty);
  const accounts = useAccountStore(state => state.accounts);
  const activeAccountId = useAccountStore(state => state.lastUsedAccount);
  const manager = getManager(true);
  const preferences = { ...defaults, ...personalization.notificationPreferences };
  const [customPauseMinutes, setCustomPauseMinutes] = useState("60");
  const paused = isNotificationPaused(preferences);
  const pauseStatus = preferences.pauseIndefinitely
    ? "La reprise est manuelle."
    : paused && preferences.pauseUntil
      ? `Reprise prévue le ${new Date(preferences.pauseUntil).toLocaleString("fr-FR", { weekday: "long", hour: "2-digit", minute: "2-digit" })}.`
      : "La synchronisation continue pendant la pause. Les alertes de cette période ne seront pas rattrapées.";

  const providers = useMemo(() => accounts.flatMap(providerAccount => providerAccount.services.map(service => {
    const entry = providerAccount.id === activeAccountId
      ? manager?.getServiceClients().find(client => client.id === service.id)
      : undefined;
    const capabilities = entry?.capabilities ?? notificationCapabilitiesByService[service.serviceId] ?? [];
    const accountName = providerAccount.schoolName?.trim()
      || [providerAccount.firstName, providerAccount.lastName].filter(Boolean).join(" ")
      || "Compte";
    return {
      id: service.id,
      name: `${accountName} · ${entry?.displayName ?? serviceLabel(service.serviceId)}`,
      categories: options.filter(option => capabilities.includes(option.capability)),
    };
  })), [accounts, activeAccountId, manager]);

  const update = (changes: Partial<NotificationPreferences>) => {
    mutateSettings("personalization", {
      notificationPreferences: { ...preferences, ...changes },
    });
  };

  const updatePersonalization = (changes: Partial<Personalization>) => {
    mutateSettings("personalization", changes);
  };

  const setEnabled = async (enabled: boolean) => {
    if (!enabled) {
      update({ enabled: false });
      await cancelSystemNotifications();
      return;
    }
    if (!(await requestSystemNotificationPermission())) {
      const settingsLocation = isTauriDesktop()
        ? "les réglages de Windows"
        : Platform.OS === "web" ? "les réglages du navigateur" : "les réglages de ton appareil";
      Alert.alert("Notifications désactivées", `Autorise les notifications dans ${settingsLocation}, puis réessaie.`);
      return;
    }
    update({ enabled: true });
  };

  const setAutostart = async (enabled: boolean) => {
    try {
      const autostart = await import("@tauri-apps/plugin-autostart");
      if (enabled) await autostart.enable();
      else await autostart.disable();
      updatePersonalization({ desktopStartWithWindows: enabled });
    } catch (error) {
      Alert.alert("Réglage indisponible", `Papillon n'a pas pu modifier le démarrage Windows. ${String(error)}`);
    }
  };

  const pauseFor = (minutes: number) => {
    const resumeAt = new Date(Date.now() + minutes * 60 * 1000);
    update({ pauseUntil: resumeAt.toISOString(), pauseIndefinitely: false });
  };

  const setServiceCategory = (serviceId: string, category: keyof NotificationCategories, enabled: boolean) => {
    update({
      serviceOverrides: {
        ...preferences.serviceOverrides,
        [serviceId]: {
          ...preferences.serviceOverrides?.[serviceId],
          [category]: enabled,
        },
      },
    });
    if (!enabled) void cancelServiceSystemNotifications(category, serviceId);
  };

  const pauseUntilTomorrow = () => {
    update({ pauseUntil: nextMidnight().toISOString(), pauseIndefinitely: false });
  };

  return (
    <List contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: 16, paddingBottom: 36, ...padding }} style={{ flex: 1, backgroundColor: colors.background }}>
      {isTauriDesktop() && <List.Section>
        <List.SectionTitle><List.Label>Application Windows</List.Label></List.SectionTitle>
        <List.Item>
          <List.Leading><Icon><Papicons name="Calendar" /></Icon></List.Leading>
          <View style={{ flex: 1, gap: 3 }}>
            <Typography variant="title">Démarrer avec Windows</Typography>
            <Typography variant="body1" color="textSecondary">Lance Papillon à l’ouverture de ta session, sans droits administrateur.</Typography>
          </View>
          <List.Trailing><NativeSwitch value={personalization.desktopStartWithWindows ?? false} onValueChange={setAutostart} /></List.Trailing>
        </List.Item>
        <List.Item>
          <List.Leading><Icon><Papicons name="Bell" /></Icon></List.Leading>
          <View style={{ flex: 1, gap: 3 }}>
            <Typography variant="title">Continuer en arrière-plan</Typography>
            <Typography variant="body1" color="textSecondary">Fermer la fenêtre la masque dans la zone de notification. Les alertes s’arrêtent si tu quittes Papillon.</Typography>
          </View>
          <List.Trailing><NativeSwitch value={personalization.desktopBackgroundOnClose ?? false} onValueChange={value => updatePersonalization({ desktopBackgroundOnClose: value })} /></List.Trailing>
        </List.Item>
      </List.Section>}

      <List.Section>
        <List.SectionTitle><List.Label>Notifications système</List.Label></List.SectionTitle>
        <List.Item>
          <List.Leading><Icon><Papicons name="Calendar" /></Icon></List.Leading>
          <Typography variant="title">Activer les notifications</Typography>
          <Typography variant="body1" color="textSecondary">Les alertes restent modifiables par catégorie et par service. Sur Windows, une version installée de Papillon est nécessaire.</Typography>
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

      {providers.length > 0 && <List.Section>
        <List.SectionTitle><List.Label>Alertes par service</List.Label></List.SectionTitle>
        {providers.map(provider => <List.Item key={provider.id}>
          <Typography variant="title">{provider.name}</Typography>
          {provider.categories.map(option => {
            const selected = preferences.serviceOverrides?.[provider.id]?.[option.id] ?? preferences[option.id];
            return <View key={`${provider.id}:${option.id}`} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, paddingVertical: 5 }}>
              <Typography variant="body1" color="textSecondary">{option.title}</Typography>
              <NativeSwitch
                value={selected}
                disabled={!preferences.enabled || !preferences[option.id]}
                onValueChange={value => setServiceCategory(provider.id, option.id, value)}
              />
            </View>;
          })}
        </List.Item>)}
      </List.Section>}

      <List.Section>
        <List.SectionTitle><List.Label>Horaires des rappels</List.Label></List.SectionTitle>
        <List.Item>
          <List.Leading><Icon><Papicons name="Clock" /></Icon></List.Leading>
          <View style={{ flex: 1, gap: 3 }}>
            <Typography variant="title">Rappel des devoirs pour demain</Typography>
            <Typography variant="body1" color="textSecondary">Heure quotidienne, réglée par défaut à 18 h.</Typography>
          </View>
          <TextInput
            accessibilityLabel="Heure du rappel des devoirs"
            value={preferences.dailyTime ?? "18:00"}
            onChangeText={value => { if (/^\d{0,2}(:\d{0,2})?$/.test(value)) update({ dailyTime: value }); }}
            onEndEditing={() => { if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(preferences.dailyTime ?? "")) update({ dailyTime: "18:00" }); }}
            keyboardType={Platform.OS === "web" ? "default" : "numbers-and-punctuation"}
            placeholder="18:00"
            placeholderTextColor={colors.text}
            style={{ minWidth: 84, textAlign: "center", color: colors.text, backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderRadius: 10, padding: 9 }}
          />
        </List.Item>
        <List.Item>
          <List.Leading><Icon><Papicons name="Calendar" /></Icon></List.Leading>
          <View style={{ flex: 1, gap: 3 }}>
            <Typography variant="title">Rappel des cours</Typography>
            <Typography variant="body1" color="textSecondary">Délai avant chaque cours, 15 minutes par défaut.</Typography>
          </View>
          <TextInput
            accessibilityLabel="Délai du rappel des cours en minutes"
            value={String(preferences.courseLeadMinutes ?? 15)}
            onChangeText={value => { if (/^\d{0,3}$/.test(value)) update({ courseLeadMinutes: Number(value) }); }}
            onEndEditing={() => {
              const minutes = Number(preferences.courseLeadMinutes ?? 15);
              update({ courseLeadMinutes: Number.isFinite(minutes) ? Math.max(1, Math.min(180, minutes)) : 15 });
            }}
            keyboardType="number-pad"
            placeholder="15"
            placeholderTextColor={colors.text}
            style={{ minWidth: 68, textAlign: "center", color: colors.text, backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderRadius: 10, padding: 9 }}
          />
        </List.Item>
      </List.Section>

      <List.Section>
        <List.SectionTitle><List.Label>Mettre les notifications en pause</List.Label></List.SectionTitle>
        <List.Item>
          <Typography variant="title">{paused ? "Notifications en pause" : "Notifications actives"}</Typography>
          <Typography variant="body1" color="textSecondary">{pauseStatus} La synchronisation continue pendant la pause, sans rattrapage des alertes.</Typography>
        </List.Item>
        {[{ title: "Pause 1 heure", minutes: 60 }, { title: "Pause 4 heures", minutes: 240 }].map(option => (
          <List.Item key={option.minutes} onPress={() => pauseFor(option.minutes)}>
            <Typography variant="title">{option.title}</Typography>
          </List.Item>
        ))}
        <List.Item onPress={pauseUntilTomorrow}>
          <Typography variant="title">Pause jusqu’à demain</Typography>
        </List.Item>
        <List.Item>
          <View style={{ flex: 1, gap: 3 }}>
            <Typography variant="title">Durée personnalisée</Typography>
            <Typography variant="body1" color="textSecondary">Nombre de minutes, de 1 à 1 440.</Typography>
          </View>
          <TextInput
            accessibilityLabel="Durée personnalisée en minutes"
            value={customPauseMinutes}
            onChangeText={value => { if (/^\d{0,4}$/.test(value)) setCustomPauseMinutes(value); }}
            keyboardType="number-pad"
            placeholder="60"
            placeholderTextColor={colors.text}
            style={{ minWidth: 68, textAlign: "center", color: colors.text, backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderRadius: 10, padding: 9 }}
          />
          <Pressable onPress={() => {
            const minutes = Number(customPauseMinutes);
            if (!Number.isInteger(minutes) || minutes < 1 || minutes > 1440) return;
            pauseFor(minutes);
          }} style={{ padding: 8 }}>
            <Typography variant="title" color="primary">Appliquer</Typography>
          </Pressable>
        </List.Item>
        <List.Item>
          <Typography variant="title">En pause jusqu’à reprise manuelle</Typography>
          <List.Trailing><NativeSwitch
            value={preferences.pauseIndefinitely ?? false}
            onValueChange={value => update({ pauseIndefinitely: value, pauseUntil: null })}
          /></List.Trailing>
        </List.Item>
        {paused && !preferences.pauseIndefinitely && <List.Item onPress={() => update({ pauseUntil: null, pauseIndefinitely: false })}>
          <Typography variant="title" color="primary">Reprendre les notifications maintenant</Typography>
        </List.Item>}
      </List.Section>
    </List>
  );
}
