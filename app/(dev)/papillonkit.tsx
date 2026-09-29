import React, { useCallback, useState } from "react";
import { ActivityIndicator, Platform, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { useTheme } from "expo-router/react-navigation";
import { Papicons } from "@getpapillon/papicons";
import * as PapillonKit from "@getpapillon/papillonkit";
import type { CoursePreview, DebugSnapshot, HomeworkPreview } from "@getpapillon/papillonkit";

import Disclosure from "@/components/Devmode/Disclosure";
import Icon from "@/ui/components/Icon";
import Stack from "@/ui/components/Stack";
import List from "@/ui/new/List";
import Typography from "@/ui/new/Typography";
import { confirmDestructive, describeError, formatDate, formatTime, useDevAction } from "@/utils/devmode/actions";

const FAILED = "#C50017";

const INTELLIGENCE_LABELS: Record<string, string> = {
  available: "Disponible",
  deviceNotEligible: "Appareil non compatible",
  appleIntelligenceNotEnabled: "Désactivée dans Réglages",
  modelNotReady: "Modèle en téléchargement",
  unknown: "État inconnu",
  unsupported: "Non supportée",
};

const WIDGETS = [
  { kind: "Calendar", title: "Emploi du temps" },
  { kind: "Tasks", title: "Tâches" },
] as const;

const courseTitle = (course: CoursePreview) => `${course.emoji} ${course.title}${course.isCanceled ? " (annulé)" : ""}`;

const courseDetail = (course: CoursePreview) =>
  [formatDate(course.from), course.room ? `salle ${course.room}` : null, course.teacher].filter(Boolean).join(" · ");

const homeworkTitle = (homework: HomeworkPreview) => `${homework.emoji} ${homework.title}${homework.isDone ? " (fait)" : ""}`;

const homeworkDetail = (homework: HomeworkPreview) => `Pour le ${formatDate(homework.dueDate)}`;

export default function PapillonKitScreen() {
  const { colors } = useTheme();
  const muted = String(colors.text) + "88";
  const { features } = PapillonKit;
  const { running, run } = useDevAction();
  const [snapshot, setSnapshot] = useState<DebugSnapshot | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showIndexable, setShowIndexable] = useState(false);
  const [clearedAt, setClearedAt] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      setSnapshot(await PapillonKit.getDebugSnapshot());
      setLoadError(null);
    } catch (error) {
      setLoadError(describeError(error));
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const refresh = () =>
    run("refresh", async () => {
      await PapillonKit.refresh();
      await load();
    });

  const reloadWidgets = () =>
    run("widgets", async () => {
      PapillonKit.widgets.reload();
      await load();
    });

  const clearIndex = () =>
    confirmDestructive(
      "Vider l'index Spotlight",
      "Siri et Spotlight ne trouveront plus aucun cours ni devoir jusqu'au prochain rafraîchissement.",
      "Vider",
      () =>
        run("clear", async () => {
          await PapillonKit.clearIndex();
          setClearedAt(Date.now());
        })
    );

  const enabledFeatures = [
    features.siri ? "Siri" : null,
    features.intelligence ? "Apple Intelligence" : null,
    features.widgets ? "widgets" : null,
  ].filter(Boolean);

  const lastRefresh = snapshot?.lastRefresh;
  const courses = snapshot?.upcomingCourses ?? [];
  const homework = snapshot?.upcomingHomework ?? [];

  return (
    <View style={{ flex: 1, backgroundColor: colors.overground }}>
      <List
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="always"
        contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
      >
        <List.Section id="tests">
          <List.Item href="/(dev)/papillonkit-tests">
            <List.Leading>
              <Icon>
                <Papicons name="Check" />
              </Icon>
            </List.Leading>
            <Typography variant="action">Tester le module</Typography>
            <Typography variant="body2" color="textSecondary">
              Vérifie données, Siri, widgets et Apple Intelligence sur cet appareil.
            </Typography>
            <List.Trailing>
              <Disclosure />
            </List.Trailing>
          </List.Item>
        </List.Section>

        {!snapshot ? (
          <List.View id="loading">
            <Stack gap={8} hAlign="center" style={{ paddingVertical: 40 }}>
              {loadError ? (
                <Typography variant="body1" color={FAILED} align="center">
                  {loadError}
                </Typography>
              ) : (
                <ActivityIndicator />
              )}
            </Stack>
          </List.View>
        ) : null}

        {snapshot ? (
          <List.Section id="device">
            <List.SectionTitle>
              <Papicons name="Apple" color={muted} />
              <List.Label>Appareil</List.Label>
            </List.SectionTitle>
            <List.Item>
              <Typography variant="action">Système</Typography>
              <List.Trailing>
                <Typography variant="body1" color="textSecondary">
                  {`iOS ${Platform.Version}`}
                </Typography>
              </List.Trailing>
            </List.Item>
            <List.Item>
              <Typography variant="action">Fonctions actives</Typography>
              <Typography variant="body2" color="textSecondary">
                {enabledFeatures.join(" · ")}
              </Typography>
            </List.Item>
            {features.intelligence ? (
              <List.Item>
                <Typography variant="action">Apple Intelligence</Typography>
                {snapshot.intelligence.status === "available" && !snapshot.intelligence.supportsLocale ? (
                  <Typography variant="body2" color="textSecondary">
                    Langue de l'appareil non supportée
                  </Typography>
                ) : null}
                <List.Trailing>
                  <Typography variant="body1" color="textSecondary">
                    {INTELLIGENCE_LABELS[snapshot.intelligence.status] ?? snapshot.intelligence.status}
                  </Typography>
                </List.Trailing>
              </List.Item>
            ) : null}
          </List.Section>
        ) : null}

        {snapshot ? (
          <List.Section id="data">
            <List.SectionTitle>
              <Papicons name="Folder" color={muted} />
              <List.Label>Données partagées</List.Label>
            </List.SectionTitle>
            {(["storage", "database"] as const).map(key => {
              const group = snapshot.appGroups[key];
              return (
                <List.Item key={key} id={key}>
                  <Typography variant="action">
                    {key === "storage" ? "App Group des comptes" : "App Group de la base"}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" numberOfLines={1}>
                    {group.identifier}
                  </Typography>
                  <List.Trailing>
                    <Typography variant="body1" color={group.reachable ? "textSecondary" : FAILED}>
                      {group.reachable ? "Accessible" : "Inaccessible"}
                    </Typography>
                  </List.Trailing>
                </List.Item>
              );
            })}
            <List.Item>
              <Typography variant="action">Base partagée</Typography>
              {snapshot.database.error || !snapshot.database.exists ? (
                <Typography variant="body2" color={FAILED}>
                  {snapshot.database.error ?? "Papillon n'a pas encore créé la base."}
                </Typography>
              ) : null}
              <List.Trailing>
                <Typography variant="body1" color="textSecondary">
                  {snapshot.database.exists && !snapshot.database.error
                    ? `${snapshot.database.courseCount} cours · ${snapshot.database.homeworkCount} devoirs`
                    : "Illisible"}
                </Typography>
              </List.Trailing>
            </List.Item>
            <List.Item>
              <Typography variant="action">Comptes</Typography>
              <Typography
                variant="body2"
                color={snapshot.accountsError ? FAILED : "textSecondary"}
                numberOfLines={2}
              >
                {snapshot.accountsError ??
                  ((snapshot.accounts ?? [])
                    .map(account => `${account.name}${account.isCurrent ? " (actif)" : ""}`)
                    .join(", ") ||
                    "Aucun")}
              </Typography>
              <List.Trailing>
                <Typography variant="body1" color="textSecondary">
                  {snapshot.accounts?.length ?? 0}
                </Typography>
              </List.Trailing>
            </List.Item>
          </List.Section>
        ) : null}

        {snapshot && features.siri ? (
          <List.Section id="siri">
            <List.SectionTitle>
              <Papicons name="Search" color={muted} />
              <List.Label>Siri et Spotlight</List.Label>
            </List.SectionTitle>
            <List.Item>
              <Typography variant="action">Prochain cours</Typography>
              <Typography variant="body2" color="textSecondary" numberOfLines={2}>
                {snapshot.nextCourse
                  ? `${courseTitle(snapshot.nextCourse)}\n${courseDetail(snapshot.nextCourse)}`
                  : "Aucun cours à venir"}
              </Typography>
            </List.Item>
            <List.Item>
              <Typography variant="action">Prochain devoir</Typography>
              <Typography variant="body2" color="textSecondary" numberOfLines={2}>
                {snapshot.nextHomework
                  ? `${homeworkTitle(snapshot.nextHomework)}\n${homeworkDetail(snapshot.nextHomework)}`
                  : "Aucun devoir à faire"}
              </Typography>
            </List.Item>
            <List.Item onPress={() => setShowIndexable(!showIndexable)}>
              <Typography variant="action">Contenu des 7 prochains jours</Typography>
              <Typography variant="body2" color="textSecondary">
                {`${courses.length} cours · ${homework.length} devoirs`}
              </Typography>
              <List.Trailing>
                <Papicons name={showIndexable ? "ChevronUp" : "ChevronDown"} size={16} color={String(colors.text) + "66"} />
              </List.Trailing>
            </List.Item>
            {showIndexable
              ? courses.map(course => (
                  <List.Item key={`course-${course.id}`} id={`course-${course.id}`}>
                    <Typography variant="body1" numberOfLines={1}>
                      {courseTitle(course)}
                    </Typography>
                    <Typography variant="caption" color="textSecondary" numberOfLines={1}>
                      {courseDetail(course)}
                    </Typography>
                  </List.Item>
                ))
              : null}
            {showIndexable
              ? homework.map(item => (
                  <List.Item key={`homework-${item.id}`} id={`homework-${item.id}`}>
                    <Typography variant="body1" numberOfLines={1}>
                      {homeworkTitle(item)}
                    </Typography>
                    <Typography variant="caption" color="textSecondary" numberOfLines={1}>
                      {homeworkDetail(item)}
                    </Typography>
                  </List.Item>
                ))
              : null}
          </List.Section>
        ) : null}

        {snapshot && features.widgets ? (
          <List.Section id="widgets">
            <List.SectionTitle>
              <Papicons name="Grid" color={muted} />
              <List.Label>Widgets</List.Label>
            </List.SectionTitle>
            <List.Item>
              <Typography variant="action">Données des widgets</Typography>
              <List.Trailing>
                <Typography variant="body1" color="textSecondary">
                  {snapshot.widgets.snapshotDate ? formatDate(snapshot.widgets.snapshotDate) : "Jamais écrites"}
                </Typography>
              </List.Trailing>
            </List.Item>
            {WIDGETS.map(widget => {
              const entry = snapshot.widgets.diagnostics[widget.kind];
              return (
                <List.Item key={widget.kind} id={widget.kind}>
                  <Typography variant="action">{widget.title}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {entry
                      ? `Affiché ${formatDate(entry.date)} · ${entry.itemCount} élément${entry.itemCount > 1 ? "s" : ""}${entry.accountId ? "" : " · aucun compte"}`
                      : "Jamais affiché, pose-le sur l'écran d'accueil."}
                  </Typography>
                  {entry?.error ? (
                    <Typography variant="body2" color={FAILED}>
                      {entry.error}
                    </Typography>
                  ) : null}
                </List.Item>
              );
            })}
          </List.Section>
        ) : null}

        {snapshot ? (
          <List.Section id="actions">
            <List.SectionTitle>
              <Papicons name="Play" color={muted} />
              <List.Label>Actions</List.Label>
            </List.SectionTitle>
            <List.Item onPress={refresh}>
              <List.Leading>
                <Icon>
                  <Papicons name="ArrowDownBox" />
                </Icon>
              </List.Leading>
              <Typography variant="action">Rafraîchir maintenant</Typography>
              <Typography variant="body2" color="textSecondary">
                {lastRefresh
                  ? `Dernier à ${formatTime(lastRefresh.date)}${lastRefresh.index ? ` · ${lastRefresh.index.indexedCourses} cours et ${lastRefresh.index.indexedHomework} devoirs indexés` : ""}`
                  : "Pas encore rafraîchi depuis le lancement"}
              </Typography>
              {lastRefresh?.errors.length ? (
                <Typography variant="body2" color={FAILED}>
                  {lastRefresh.errors.join("\n")}
                </Typography>
              ) : null}
              {running === "refresh" ? (
                <List.Trailing>
                  <ActivityIndicator />
                </List.Trailing>
              ) : null}
            </List.Item>
            {features.widgets ? (
              <List.Item onPress={reloadWidgets}>
                <List.Leading>
                  <Icon>
                    <Papicons name="Grid" />
                  </Icon>
                </List.Leading>
                <Typography variant="action">Recharger les widgets</Typography>
                <Typography variant="body2" color="textSecondary">
                  Réécrit leurs données et demande à iOS de les redessiner.
                </Typography>
                {running === "widgets" ? (
                  <List.Trailing>
                    <ActivityIndicator />
                  </List.Trailing>
                ) : null}
              </List.Item>
            ) : null}
            {features.siri ? (
              <List.Item onPress={clearIndex}>
                <List.Leading>
                  <Icon>
                    <Papicons name="Trash" />
                  </Icon>
                </List.Leading>
                <Typography variant="action">Vider l'index Spotlight</Typography>
                <Typography variant="body2" color="textSecondary">
                  {clearedAt ? `Vidé à ${formatTime(clearedAt)}` : "Retire tous les cours et devoirs de Spotlight."}
                </Typography>
                {running === "clear" ? (
                  <List.Trailing>
                    <ActivityIndicator />
                  </List.Trailing>
                ) : null}
              </List.Item>
            ) : null}
          </List.Section>
        ) : null}
      </List>
    </View>
  );
}
