import React, {useRef, useState} from "react";
import {ScrollView, Switch, TextInput, View} from "react-native";
import { useTheme } from "@react-navigation/native";
import type { Screen } from "@/router/helpers/types";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  NativeIconGradient,
  NativeItem,
  NativeList,
  NativeListHeader,
  NativeText,
} from "@/components/Global/NativeComponents";
import {
  CheckCircle,
  EyeOff,
  GraduationCap,
  Hourglass,
  LucideIcon,
  Newspaper,
  CalendarDays,
  Book
} from "lucide-react-native";
import { useCurrentAccount } from "@/stores/account";
import {WidgetsSettings} from "@/stores/account/types";
import DynamicWidgetsContainerCard from "@/components/Settings/DynamicWidgetsContainerCard";

type Widget = {
  name: string
  icon: LucideIcon
  description: string
  key: keyof WidgetsSettings
};

const SettingsWidgets: Screen<"SettingsWidgets"> = ({ navigation }) => {
  const theme = useTheme();
  const { colors } = theme;
  const insets = useSafeAreaInsets();
  const account = useCurrentAccount(store => store.account);
  const mutateProperty = useCurrentAccount(store => store.mutateProperty);

  const widgetsConfiguration = account?.personalization?.widgets || {};

  const [eventMaxAge, setEventMaxAge] = useState(widgetsConfiguration.maxEventAge || 5);
  const eventMaxAgeRef = useRef<TextInput>(null);

  const widgets: Widget[] = [
    {
      name: "Vie scolaire",
      icon: CheckCircle,
      description: "Affiche le dernier évènement de vie scolaire.",
      key: "lastAttendanceEvent"
    },
    {
      name: "Actualités",
      icon: Newspaper,
      description: "Affiche la dernière actualité.",
      key: "lastNews"
    },
    {
      name: "Changements EDT",
      icon: CalendarDays,
      description: "Affiche les changements de l'EDT du jour.",
      key: "timetableChangements"
    },
    {
      name: "Devoirs à faire",
      icon: Book,
      description: "Affiche les prochains devoirs non-effectués.",
      key: "nextHomeworks"
    },
    {
      name: "Évaluations",
      icon: GraduationCap,
      description: "Affiche la prochaine évaluation.",
      key: "nextTest"
    }
  ];

  return (
    <ScrollView
      contentContainerStyle={{
        paddingHorizontal: 15,
        paddingBottom: 30,
      }}
    >
      <DynamicWidgetsContainerCard theme={theme} />

      <NativeListHeader label="Widgets" />
      <NativeList>
        {widgets.map(widget => (
          <NativeItem
            trailing={
              <Switch
                value={widgetsConfiguration[widget.key] as boolean ?? false}
                onValueChange={(value) => mutateProperty("personalization", { widgets: {...widgetsConfiguration, [widget.key]: value } })}
              />
            }
            leading={
              <NativeIconGradient
                icon={<widget.icon/>}
                colors={[colors.primary, colors.primary]}
              />
            }
          >
            <NativeText variant="title">
              {widget.name}
            </NativeText>
            <NativeText variant="subtitle">
              {widget.description}
            </NativeText>
          </NativeItem>
        ))}
      </NativeList>
      <NativeListHeader label="Paramètres" />
      <NativeList>
        <NativeItem
          trailing={
            <Switch
              value={widgetsConfiguration.deleteAfterRead ?? false}
              onValueChange={(value) => mutateProperty("personalization", { widgets: {...widgetsConfiguration, deleteAfterRead: value } })}
            />
          }
          leading={
            <NativeIconGradient
              icon={<EyeOff />}
              colors={["#888888", "#888888"]}
            />
          }
        >
          <NativeText variant="title">
            Supprimer après lecture
          </NativeText>
          <NativeText variant="subtitle">
            Masque le widget après lecture.
          </NativeText>
        </NativeItem>
        <NativeItem
          onPress={() => eventMaxAgeRef.current?.focus()}
          chevron={false}
          leading={
            <NativeIconGradient
              icon={<Hourglass />}
              colors={["#888888", "#888888"]}
            />
          }
        >
          <NativeText variant="title">
            Masquer les évènements obsolètes
          </NativeText>
          <NativeText variant="subtitle">
            Affiche uniquement les évènements des {eventMaxAge} derniers jours.
          </NativeText>
        </NativeItem>
        <NativeItem
          onPress={() => eventMaxAgeRef.current?.focus()}
          chevron={false}
        >
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <NativeText
              variant="title"
            >
              Nb. jours :
            </NativeText>
            <TextInput
              style={{
                fontSize: 16,
                fontFamily: "semibold",
                color: theme.colors.text
              }}
              onKeyPress={(event) => {
                if (!/[0-9]/.test(event.nativeEvent.key)) {
                  event.preventDefault();
                }
              }}
              placeholder="5"
              keyboardType="numeric"
              placeholderTextColor={theme.colors.text + "80"}
              value={eventMaxAge.toString()}
              onChangeText={(value) => {
                setEventMaxAge(Number(value));
                mutateProperty("personalization", { widgets: {...widgetsConfiguration, maxEventAge: Number(value) } });
              }}
              ref={eventMaxAgeRef}
            />
          </View>
        </NativeItem>
      </NativeList>
    </ScrollView>
  );
};



export default SettingsWidgets;
