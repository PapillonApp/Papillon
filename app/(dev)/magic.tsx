import React, { useState } from "react";
import { ActivityIndicator, Alert, Platform, View } from "react-native";
import { useTheme } from "expo-router/react-navigation";
import { Papicons } from "@getpapillon/papicons";

import { useMagicStore } from "@/stores/magic";
import { useSettingsStore } from "@/stores/settings";
import Icon from "@/ui/components/Icon";
import List from "@/ui/new/List";
import Typography from "@/ui/new/Typography";
import { confirmDestructive, useDevAction } from "@/utils/devmode/actions";
import { MAGIC_URL } from "@/utils/endpoints";
import ModelManager from "@/utils/magic/ModelManager";

const FAILED = "#C50017";
const SAMPLE = "ds analyse de doc";

export default function Magic() {
  const { colors } = useTheme();
  const muted = String(colors.text) + "88";
  const { running, run } = useDevAction();
  const [status, setStatus] = useState(() => ModelManager.getStatus());
  const [refreshResult, setRefreshResult] = useState<{ text: string; failed: boolean } | null>(null);
  const [prediction, setPrediction] = useState<{ text: string; failed: boolean } | null>(null);
  const [resetResult, setResetResult] = useState<{ text: string; failed: boolean } | null>(null);
  const cached = useMagicStore(state => state.processHomeworks.length);
  const customURL = useSettingsStore(state => state.personalization.magicModelURL);
  const sourceURL = customURL || MAGIC_URL;

  const modelState = status.isInitializing ? "Chargement…" : status.hasModel ? "Chargé" : "Absent";

  const details: [string, string | number][] = [
    ["Type", status.modelType || "—"],
    ["Longueur maximale", status.maxLen],
    ["Catégories", status.labelsCount],
    ["Vocabulaire", status.wordIndexSize],
    ["Index hors vocabulaire", status.oovIndex],
  ];

  const refresh = () =>
    run("refresh", async () => {
      const result = await ModelManager.refresh();
      setRefreshResult(
        result.success
          ? { text: result.updated ? "Nouvelle version chargée" : "Déjà à jour", failed: false }
          : { text: result.error ?? "Échec du rafraîchissement", failed: true }
      );
      setStatus(ModelManager.getStatus());
    });

  const predict = () =>
    run("predict", async () => {
      const result = await ModelManager.predict(SAMPLE, true);
      if ("error" in result) {
        setPrediction({ text: result.error, failed: true });
        return;
      }
      const score = result.labelScores[result.predicted];
      setPrediction({
        text: `${result.predicted}${score != null ? ` · ${score.toFixed(3)}` : ""}`,
        failed: false,
      });
    });

  const reset = () =>
    confirmDestructive(
      "Réinitialiser le modèle",
      "Le modèle est supprimé de l'appareil et retéléchargé au prochain démarrage.",
      "Réinitialiser",
      () =>
        run("reset", async () => {
          const result = await ModelManager.reset();
          setResetResult(
            result.success
              ? { text: "Supprimé, retéléchargé au prochain démarrage", failed: false }
              : { text: result.error ?? "Échec de la réinitialisation", failed: true }
          );
          setStatus(ModelManager.getStatus());
        })
    );

  const changeSource = () =>
    Alert.prompt(
      "Source du modèle",
      "URL du dossier qui contient le modèle Magic+.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Enregistrer",
          onPress: (value?: string) => {
            const url = value?.trim();
            if (url) {
              useSettingsStore.getState().mutateProperty("personalization", { magicModelURL: url });
            }
          },
        },
      ],
      "plain-text",
      sourceURL,
      "url"
    );

  const resetSource = () =>
    useSettingsStore.getState().mutateProperty("personalization", { magicModelURL: MAGIC_URL });

  const resultLine = (result: { text: string; failed: boolean } | null, fallback: string) => (
    <Typography variant="body2" color={result?.failed ? FAILED : "textSecondary"} numberOfLines={3}>
      {result?.text ?? fallback}
    </Typography>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.overground }}>
      <List
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="always"
        contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
      >
        <List.Section id="model">
          <List.SectionTitle>
            <Papicons name="Sparkles" color={muted} />
            <List.Label>Modèle</List.Label>
          </List.SectionTitle>
          <List.Item>
            <Typography variant="action">État</Typography>
            <List.Trailing>
              <Typography variant="body1" color={status.hasModel ? "textSecondary" : FAILED}>
                {modelState}
              </Typography>
            </List.Trailing>
          </List.Item>
          {details.map(([label, value]) => (
            <List.Item key={label} id={label}>
              <Typography variant="action">{label}</Typography>
              <List.Trailing>
                <Typography variant="body1" color="textSecondary">
                  {value}
                </Typography>
              </List.Trailing>
            </List.Item>
          ))}
        </List.Section>

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
            <Typography variant="action">Rafraîchir le modèle</Typography>
            {resultLine(refreshResult, "Cherche une nouvelle version sur la source.")}
            {running === "refresh" ? (
              <List.Trailing>
                <ActivityIndicator />
              </List.Trailing>
            ) : null}
          </List.Item>
          <List.Item onPress={predict}>
            <List.Leading>
              <Icon>
                <Papicons name="Play" />
              </Icon>
            </List.Leading>
            <Typography variant="action">Tester une prédiction</Typography>
            {resultLine(prediction, `Classe « ${SAMPLE} ».`)}
            {running === "predict" ? (
              <List.Trailing>
                <ActivityIndicator />
              </List.Trailing>
            ) : null}
          </List.Item>
          <List.Item onPress={reset}>
            <List.Leading>
              <Icon>
                <Papicons name="Trash" />
              </Icon>
            </List.Leading>
            <Typography variant="action">Réinitialiser le modèle</Typography>
            {resultLine(resetResult, "Supprime le modèle téléchargé.")}
            {running === "reset" ? (
              <List.Trailing>
                <ActivityIndicator />
              </List.Trailing>
            ) : null}
          </List.Item>
        </List.Section>

        <List.Section id="cache">
          <List.SectionTitle>
            <Papicons name="Archive" color={muted} />
            <List.Label>Cache</List.Label>
          </List.SectionTitle>
          <List.Item>
            <Typography variant="action">Devoirs analysés</Typography>
            <List.Trailing>
              <Typography variant="body1" color="textSecondary">
                {cached}
              </Typography>
            </List.Trailing>
          </List.Item>
          {cached > 0 ? (
            <List.Item onPress={() => useMagicStore.getState().clear()}>
              <List.Leading>
                <Icon>
                  <Papicons name="Trash" />
                </Icon>
              </List.Leading>
              <Typography variant="action">Vider le cache</Typography>
              <Typography variant="body2" color="textSecondary">
                Les devoirs seront analysés à nouveau.
              </Typography>
            </List.Item>
          ) : null}
        </List.Section>

        <List.Section id="source">
          <List.SectionTitle>
            <Papicons name="Link" color={muted} />
            <List.Label>Source</List.Label>
          </List.SectionTitle>
          <List.Item onPress={Platform.OS === "ios" ? changeSource : undefined}>
            <Typography variant="action">{customURL && customURL !== MAGIC_URL ? "Source personnalisée" : "Source par défaut"}</Typography>
            <Typography variant="body2" color="textSecondary" numberOfLines={3}>
              {sourceURL}
            </Typography>
            {Platform.OS === "ios" ? (
              <List.Trailing>
                <Papicons name="Pen" size={16} color={String(colors.text) + "66"} />
              </List.Trailing>
            ) : null}
          </List.Item>
          {customURL && customURL !== MAGIC_URL ? (
            <List.Item onPress={resetSource}>
              <List.Leading>
                <Icon>
                  <Papicons name="ArrowLeft" />
                </Icon>
              </List.Leading>
              <Typography variant="action">Revenir à la source par défaut</Typography>
            </List.Item>
          ) : null}
        </List.Section>
      </List>
    </View>
  );
}
