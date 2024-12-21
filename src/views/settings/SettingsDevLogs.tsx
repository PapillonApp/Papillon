import type { Screen } from "@/router/helpers/types";
import { ActivityIndicator, ScrollView, Share, ShareContent, TouchableOpacity } from "react-native";
import {
  NativeIcon,
  NativeItem,
  NativeList,
  NativeListHeader,
  NativeText,
} from "@/components/Global/NativeComponents";
import React, { useEffect, useState } from "react";
import { get_brute_logs, get_logs, Log, delete_logs } from "@/utils/logger/logger";
import {
  CircleAlert,
  CircleX,
  Code,
  Delete,
  ShareIcon,
  TriangleAlert,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PressableScale } from "@/components/Global/PressableScale";
import { FadeInDown, FadeInUp, FadeOutDown, FadeOutUp } from "react-native-reanimated";
import { animPapillon } from "@/utils/ui/animations";

const SettingsDevLogs: Screen<"SettingsDevLogs"> = ({ navigation }) => {
  const [logs, setLogs] = useState<Log[]>([]);
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    get_logs().then((logs) => {
      setLogs(logs);
      setLoading(false);
    });

    navigation.setOptions({
      headerRight: (props) => (
        <TouchableOpacity
          onPress={() => delete_logs()}
        >
          <Delete />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 16,
        paddingBottom: 100 + insets.bottom,
        paddingTop: 0,
      }}
    >
      <NativeListHeader animated label={"Logs"} />

      {loading && (
        <NativeList animated>
          <NativeItem
            leading={
              <ActivityIndicator />
            }
            animated
          >
            <NativeText variant="title">
              Obtention des logs...
            </NativeText>
            <NativeText variant="subtitle">
              Cela peut prendre plusieurs secondes, veuillez patienter.
            </NativeText>
          </NativeItem>
        </NativeList>
      )}

      {logs.length !== 0 && (
        <NativeList animated>
          {logs.map((log, index) => (
            <NativeItem
              animated
              key={index + "log"}
              leading={
                <NativeIcon
                  icon={
                    log.type === "ERROR" ? (
                      <CircleX />
                    ) : log.type === "WARN" ? (
                      <TriangleAlert />
                    ) : log.type === "INFO" ? (
                      <CircleAlert />
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
          ))}
        </NativeList>

      )}
    </ScrollView>
  );
};

export default SettingsDevLogs;
