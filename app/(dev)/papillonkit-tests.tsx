import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { useTheme } from "expo-router/react-navigation";
import * as Clipboard from "expo-clipboard";
import { Papicons } from "@getpapillon/papicons";

import Stack from "@/ui/components/Stack";
import Button from "@/ui/new/Button";
import List from "@/ui/new/List";
import Typography from "@/ui/new/Typography";
import {
  buildChecks,
  CHECK_SECTIONS,
  type CheckContext,
  type CheckResult,
  type CheckSection,
  formatDuration,
  formatReport,
  runCheck,
} from "@/utils/devmode/papillonKitChecks";

const SECTION_ICONS: Record<CheckSection, string> = {
  Module: "Gears",
  Données: "User",
  "Siri et Spotlight": "Search",
  Widgets: "Grid",
  "Apple Intelligence": "Sparkles",
};

const PASSED = "#37BB12";
const FAILED = "#C50017";

export default function PapillonKitChecks() {
  const { colors } = useTheme();
  const checks = useMemo(buildChecks, []);
  const [results, setResults] = useState<Record<string, CheckResult>>({});
  const [running, setRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const active = useRef(true);

  const run = useCallback(async () => {
    setRunning(true);
    setCopied(false);
    setResults({});
    const context: CheckContext = {};
    for (const check of checks) {
      if (!active.current) {
        return;
      }
      setResults(current => ({ ...current, [check.id]: { status: "running" } }));
      const result = await runCheck(check, context);
      setResults(current => ({ ...current, [check.id]: result }));
    }
    setRunning(false);
  }, [checks]);

  useEffect(() => {
    active.current = true;
    run();
    return () => {
      active.current = false;
    };
  }, [run]);

  const done = Object.values(results).filter(result => result.status !== "running");
  const passed = done.filter(result => result.status === "passed").length;
  const failed = done.filter(result => result.status === "failed").length;
  const skipped = done.filter(result => result.status === "skipped").length;
  const elapsed = done.reduce((total, result) => total + (result.duration ?? 0), 0);

  const title = running
    ? `Tests en cours… ${done.length}/${checks.length}`
    : failed > 0
      ? `${failed} échec${failed > 1 ? "s" : ""} sur ${checks.length} tests`
      : `${passed} test${passed > 1 ? "s" : ""} réussi${passed > 1 ? "s" : ""}`;

  const subtitle = [
    `${passed} réussi${passed > 1 ? "s" : ""}`,
    `${failed} échec${failed > 1 ? "s" : ""}`,
    `${skipped} ignoré${skipped > 1 ? "s" : ""}`,
    formatDuration(elapsed),
  ].join(" · ");

  const copyReport = async () => {
    await Clipboard.setStringAsync(formatReport(checks, results));
    setCopied(true);
  };

  const statusIcon = (result?: CheckResult) => {
    switch (result?.status) {
      case "running":
        return <ActivityIndicator />;
      case "passed":
        return <Papicons name="Check" color={PASSED} />;
      case "failed":
        return <Papicons name="Cross" color={FAILED} />;
      case "skipped":
        return <Papicons name="Minus" color={String(colors.text) + "66"} />;
      default:
        return <Papicons name="Clock" color={String(colors.text) + "44"} />;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.overground }}>
      <List
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="always"
        contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
      >
        <List.View id="summary">
          <Stack gap={4} style={{ marginBottom: 16 }}>
            <Typography variant="h5" color={!running && failed > 0 ? FAILED : "textPrimary"}>
              {title}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {subtitle}
            </Typography>
          </Stack>
          <Stack direction="horizontal" gap={10} style={{ marginBottom: 8 }}>
            <View style={{ flex: 1 }}>
              <Button label="Relancer" onPress={run} disabled={running} fullWidth />
            </View>
            <View style={{ flex: 1 }}>
              <Button
                label={copied ? "Rapport copié" : "Copier le rapport"}
                onPress={copyReport}
                disabled={running}
                variant="secondary"
                fullWidth
              />
            </View>
          </Stack>
        </List.View>
        {CHECK_SECTIONS.filter(section => checks.some(check => check.section === section)).map(section => (
          <List.Section key={section} id={section}>
            <List.SectionTitle>
              <Papicons name={SECTION_ICONS[section]} color={String(colors.text) + "88"} />
              <List.Label>{section}</List.Label>
            </List.SectionTitle>
            {checks
              .filter(check => check.section === section)
              .map(check => {
                const result = results[check.id];
                return (
                  <List.Item key={check.id} id={check.id}>
                    <List.Leading>{statusIcon(result)}</List.Leading>
                    <Typography variant="action">{check.title}</Typography>
                    {result?.detail ? (
                      <Typography variant="body2" color={result.status === "failed" ? FAILED : "textSecondary"}>
                        {result.detail}
                      </Typography>
                    ) : null}
                    {result?.duration != null ? (
                      <List.Trailing>
                        <Typography variant="body2" color="textSecondary">
                          {formatDuration(result.duration)}
                        </Typography>
                      </List.Trailing>
                    ) : null}
                  </List.Item>
                );
              })}
          </List.Section>
        ))}
      </List>
    </View>
  );
}
