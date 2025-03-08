import type { Screen } from "@/router/helpers/types";
import { ActivityIndicator, ScrollView, TextInput, TouchableOpacity } from "react-native";
import {
  NativeIcon,
  NativeItem,
  NativeList,
  NativeListHeader,
  NativeText,
} from "@/components/Global/NativeComponents";
import React, { useEffect, useState } from "react";
import {
  get_logs,
  Log,
  delete_logs,
} from "@/utils/logger/logger";
import {
  CircleAlert,
  CircleX,
  Code,
  Layers,
  Trash2,
  TriangleAlert,
  Moon,
  Newspaper,
  Calendar,
  Folder,
  X,
  BadgeHelp,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  FadeInDown,
  FadeOutUp,
} from "react-native-reanimated";
import { animPapillon } from "@/utils/ui/animations";
import { useTheme } from "@react-navigation/native";
import { useAlert } from "@/providers/AlertProvider";
import MissingItem from "@/components/Global/MissingItem";
import formatDate from "@/utils/format/format_date_complets";

const SettingsDevLogs: Screen<"SettingsDevLogs"> = ({ navigation }) => {
  const { colors } = useTheme();
  const [logs, setLogs] = useState<Log[]>([]);
  const [searchTerms, setSearchTerms] = useState<string>("");
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const { showAlert } = useAlert();

  useEffect(() => {
    get_logs().then((logs) => {
      setLogs(
        logs.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        )
      );
      setLoading(false);
    });
  }, [navigation]);

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 16,
        paddingBottom: 16 + insets.bottom,
        paddingTop: 0,
      }}
    >
      <TextInput
        placeholder={"Rechercher"}
        value={searchTerms}
        onChangeText={setSearchTerms}
        placeholderTextColor={colors.text + "80"}
        style={{
          color: colors.text,
          padding: 8,
          borderRadius: 80,
          fontFamily: "medium",
          fontSize: 16.5,
          flex: 1,
          backgroundColor: colors.border,
          marginTop: 12,
        }}
      />
      <NativeListHeader
        animated
        label="Logs des 2 dernières semaines"
        trailing={
          logs.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                showAlert({
                  title: "Supprimer les logs ?",
                  message: "Es-tu sûr de vouloir supprimer toutes les logs ?",
                  icon: <BadgeHelp />,
                  actions: [
                    {
                      title: "Annuler",
                      backgroundColor: colors.card,
                      icon: <X color={colors.text} />,
                    },
                    {
                      title: "Supprimer",
                      primary: true,
                      onPress: () => {
                        delete_logs();
                        setLogs([]);
                      },
                      backgroundColor: "#CF0029",
                      icon: <Trash2 color="#FFFFFF" />,
                    },
                  ],
                });
              }}
              style={{
                padding: 5,
                borderRadius: 100,
                backgroundColor: colors.text + "20",
              }}
            >
              <Trash2
                size={25}
                strokeWidth={2}
                color="red"
              />
            </TouchableOpacity>
          )
        }
      />

      {loading ? (
        <NativeList
          animated
          entering={animPapillon(FadeInDown)}
          exiting={animPapillon(FadeOutUp)}
        >
          <NativeItem leading={<ActivityIndicator />} animated>
            <NativeText variant="title">Obtention des logs...</NativeText>
            <NativeText variant="subtitle">
              Cela peut prendre plusieurs secondes, patiente s'il te plaît.
            </NativeText>
          </NativeItem>
        </NativeList>
      ) : logs.length > 0 ? (
        <NativeList
          animated
          entering={animPapillon(FadeInDown)}
          exiting={animPapillon(FadeOutUp)}
        >
          {logs.slice().reverse().map((log, index) => {
            if (log.message.toLowerCase().includes(searchTerms.toLowerCase())) {
              return (
                <NativeItem
                  animated
                  key={index}
                  leading={
                    <NativeIcon
                      icon={
                        log.type === "ERROR" ? (
                          <CircleX />
                        ) : log.type === "WARN" ? (
                          <TriangleAlert />
                        ) : log.type === "INFO" ? (
                          <CircleAlert />
                        ) : log.message.startsWith("User navigate into /") ? (
                          <Layers />
                        ) : log.message === "App in background" ? (
                          <Moon />
                        ) : log.message.toLowerCase().includes("read") ? (
                          <Newspaper />
                        ) : log.message.startsWith("[timetable:updateClasses") ? (
                          <Calendar />
                        ) : log.message.toLowerCase().includes("folder") ? (
                          <Folder />
                        ) : (
                          <Code />
                        )
                      }
                      color={
                        log.type === "ERROR"
                          ? "#BE0B00"
                          : log.type === "WARN"
                            ? "#CF6B0F"
                            : log.type === "INFO"
                              ? "#0E7CCB"
                              : log.message.startsWith("User navigate into /")
                                ? "#28B463"
                                : log.message === "App in background"
                                  ? "#1F618D"
                                  : log.message.toLowerCase().includes("read")
                                    ? "#D4AC02"
                                    : log.message.startsWith("[timetable:updateClasses")
                                      ? "#884EA0"
                                      : log.message.toLowerCase().includes("folder")
                                        ? "#CA6F1E"
                                        : "#AAA"
                      }
                      style={{
                        marginLeft: -6,
                      }}
                    />
                  }
                >
                  <NativeText variant="title">{log.message}</NativeText>
                  <NativeText variant="subtitle">
                    {formatDate(log.date)} à {new Date(log.date).getHours()}:
                    {new Date(log.date).getMinutes()}:
                    {new Date(log.date).getSeconds()}
                  </NativeText>
                  <NativeText variant="subtitle">{log.from}</NativeText>
                </NativeItem>
              );
            }
            return null;
          })}
        </NativeList>
      ) : (
        <NativeList
          animated
          entering={animPapillon(FadeInDown)}
          exiting={animPapillon(FadeOutUp)}
        >
          <NativeItem animated style={{ paddingVertical: 10 }}>
            <MissingItem
              emoji="💾"
              title="Aucune log enregistrée"
              description="Il n'y a pas de logs à te présenter."
            />
          </NativeItem>
        </NativeList>
      )}
    </ScrollView>
  );
};

export default SettingsDevLogs;
