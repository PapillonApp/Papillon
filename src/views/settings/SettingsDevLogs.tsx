import type { Screen } from "@/router/helpers/types";
import { ActivityIndicator, ScrollView } from "react-native";
import {
  NativeIcon,
  NativeItem,
  NativeList,
  NativeListHeader,
  NativeText,
} from "@/components/Global/NativeComponents";
import React, { useEffect, useState } from "react";
import { get_logs, Log, delete_logs } from "@/utils/logger/logger";
import {
  CircleAlert,
  CircleX,
  Code,
  Delete,
  TriangleAlert,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PressableScale } from "react-native-pressable-scale";
import { FadeInDown, FadeOutUp } from "react-native-reanimated";
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
        <PressableScale
          onPress={() => delete_logs()}
        >
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
      <NativeListHeader animated label={"Logs"} />

      {loading && (
        <NativeList
          animated
          entering={animPapillon(FadeInDown)}
          exiting={animPapillon(FadeOutUp)}
        >
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
        <NativeList
          animated
          entering={animPapillon(FadeInDown)}
          exiting={animPapillon(FadeOutUp)}
        >
          {logs.map((log, index) => (
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
