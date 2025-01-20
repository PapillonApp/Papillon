import type { Screen } from "@/router/helpers/types";
import { ActivityIndicator, ScrollView, TextInput } from "react-native";
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
  Delete,
  Layers,
  TriangleAlert,
  Moon,
  Newspaper,
  Calendar,
  Folder,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PressableScale } from "react-native-pressable-scale";
import {
  FadeInDown,
  FadeOutUp,
} from "react-native-reanimated";
import { animPapillon } from "@/utils/ui/animations";
import { useTheme } from "@react-navigation/native";

const SettingsDevLogs: Screen<"SettingsDevLogs"> = ({ navigation }) => {
  const theme = useTheme();
  const [logs, setLogs] = useState<Log[]>([]);
  const [searchTerms, setSearchTerms] = useState<string>("");
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    get_logs().then((logs) => {
      setLogs(logs);
      setLoading(false);
    });

    navigation.setOptions({
      headerRight: (props) => (
        <PressableScale onPress={() => delete_logs()}>
          <Delete />
        </PressableScale>
      ),
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
        placeholderTextColor={theme.colors.text + "80"}
        style={{
          color: theme.colors.text,
          padding: 8,
          borderRadius: 80,
          fontFamily: "medium",
          fontSize: 16.5,
          flex: 1,
          backgroundColor: theme.colors.border,
          marginTop: 12,
        }}
      />
      <NativeListHeader animated label={"Logs"} />

      {loading && (
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
      )}

      {logs.length !== 0 && (
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
                        ) : log.message === "[timetable:updateClasses" ? (
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
                                    : log.message === "[timetable:updateClasses"
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
                  <NativeText variant="subtitle">{log.date}</NativeText>
                  <NativeText variant="subtitle">{log.from}</NativeText>
                </NativeItem>
              );
            }
            return null;
          })}
        </NativeList>
      )}
    </ScrollView>
  );
};

export default SettingsDevLogs;
