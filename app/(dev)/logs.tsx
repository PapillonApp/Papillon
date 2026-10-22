import React, { useMemo, useState } from "react";
import { View } from "react-native";
import { useTheme } from "expo-router/react-navigation";
import * as Clipboard from "expo-clipboard";
import { Papicons } from "@getpapillon/papicons";

import LogIcon from "@/components/Log/LogIcon";
import { useLogStore } from "@/stores/logs";
import { LogType } from "@/stores/logs/types";
import Stack from "@/ui/components/Stack";
import Button from "@/ui/new/Button";
import List from "@/ui/new/List";
import Typography from "@/ui/new/Typography";
import { formatTime } from "@/utils/devmode/actions";

type Filter = "all" | LogType.ERROR | LogType.WARN;

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "Tout" },
  { value: LogType.ERROR, label: "Erreurs" },
  { value: LogType.WARN, label: "Alertes" },
];

const PAGE = 50;

export default function Logs() {
  const { colors } = useTheme();
  const logs = useLogStore(state => state.logs);
  const [filter, setFilter] = useState<Filter>("all");
  const [limit, setLimit] = useState(PAGE);
  const [copied, setCopied] = useState(false);

  const filtered = useMemo(
    () => logs.filter(log => filter === "all" || log.type === filter).reverse(),
    [logs, filter]
  );
  const visible = filtered.slice(0, limit);

  const count = (value: Filter) => (value === "all" ? logs.length : logs.filter(log => log.type === value).length);

  const selectFilter = (value: Filter) => {
    setFilter(value);
    setLimit(PAGE);
    setCopied(false);
  };

  const copyLogs = async () => {
    await Clipboard.setStringAsync(
      filtered.map(log => `[${log.date}] ${log.type} ${log.from ?? "?"} · ${log.message}`).join("\n")
    );
    setCopied(true);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.overground }}>
      <List
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="always"
        contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
      >
        <List.View id="filters">
          <Stack direction="horizontal" gap={8} style={{ marginBottom: 8 }}>
            {FILTERS.map(item => (
              <View key={item.value} style={{ flex: 1 }}>
                <Button
                  label={`${item.label} ${count(item.value)}`}
                  variant={filter === item.value ? "primary" : "secondary"}
                  height={40}
                  fullWidth
                  onPress={() => selectFilter(item.value)}
                />
              </View>
            ))}
          </Stack>
          <Button
            label={copied ? "Journaux copiés" : `Copier ${filtered.length} journaux`}
            variant="ghost"
            height={40}
            fullWidth
            disabled={filtered.length === 0}
            onPress={copyLogs}
            style={{ marginBottom: 16 }}
          />
        </List.View>

        {filtered.length === 0 ? (
          <List.View id="empty">
            <Stack gap={6} hAlign="center" style={{ paddingVertical: 40 }}>
              <Papicons name="Check" color={String(colors.text) + "66"} />
              <Typography variant="body1" color="textSecondary" align="center">
                {filter === "all" ? "Aucun journal depuis le lancement." : "Rien dans cette catégorie."}
              </Typography>
            </Stack>
          </List.View>
        ) : (
          <List.Section id="entries">
            {visible.map((log, index) => (
              <List.Item key={`${log.date}-${index}`} id={`${log.date}-${index}`}>
                <List.Leading>
                  <LogIcon type={log.type} />
                </List.Leading>
                <Typography variant="body2" numberOfLines={8}>
                  {log.message}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {`${formatTime(new Date(log.date).getTime())} · ${log.from ?? "origine inconnue"}`}
                </Typography>
              </List.Item>
            ))}
            {filtered.length > limit ? (
              <List.Item id="more" onPress={() => setLimit(limit + PAGE)}>
                <List.Leading>
                  <Papicons name="Plus" color={String(colors.text)} />
                </List.Leading>
                <Typography variant="action">
                  {`Afficher ${Math.min(PAGE, filtered.length - limit)} de plus`}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {`${filtered.length - limit} restants`}
                </Typography>
              </List.Item>
            ) : null}
          </List.Section>
        )}
      </List>
    </View>
  );
}
