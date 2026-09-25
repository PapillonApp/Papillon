import { geolocation } from "@blockshub/pawnote-lts";
import { router, useNavigation } from "expo-router";
import { useTheme } from "expo-router/react-navigation";
import React, { useState } from "react";
import { ActivityIndicator, TextInput, View } from "react-native";

import { findEducationSchoolByUai, normalizeSchoolName } from "@/utils/pronote/uaiSearch";
import Button from "@/ui/new/Button";
import List from "@/ui/new/List";
import Typography from "@/ui/new/Typography";
import Icon from "@/ui/components/Icon";
import { Papicons } from "@getpapillon/papicons";
import { useSafeHorizontalPadding } from "@/ui/hooks/useSafeHorizontalPadding";

export default function PronoteSearchByUai() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const padding = useSafeHorizontalPadding(16);
  const [uai, setUai] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const searchUai = async () => {
    if (loading) return;
    setLoading(true);
    setMessage("");
    try {
      const school = await findEducationSchoolByUai(uai);
      if (!school) {
        setMessage("Aucun établissement ne correspond à ce code UAI.");
        return;
      }

      if (school.latitude === undefined || school.longitude === undefined) {
        setMessage(`${school.name} a été trouvé, mais son instance PRONOTE n’a pas pu être localisée. Essaie avec l’adresse PRONOTE.`);
        return;
      }

      const located = await geolocation({ latitude: school.latitude, longitude: school.longitude });
      const nearby = Array.isArray(located) ? located : [];
      const expectedName = normalizeSchoolName(school.name);
      const match = nearby.find(candidate => {
        const candidateName = normalizeSchoolName(candidate.name);
        return candidateName === expectedName
          || candidateName.startsWith(`${expectedName} `)
          || (candidateName.split(" ").length >= 2 && expectedName.startsWith(`${candidateName} `));
      });

      if (!match || !/^https?:\/\//i.test(match.url)) {
        setMessage(`${school.name} a été trouvé, mais aucune adresse PRONOTE valide n’a été reconnue. Essaie avec l’adresse PRONOTE.`);
        return;
      }

      (navigation as unknown as {
        navigate: (routeName: string, params: { url: string; school: { name: string; uai: string } }) => void;
      }).navigate("browser", { url: match.url, school: { name: school.name, uai: school.uai } });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "La recherche UAI a échoué.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <List contentContainerStyle={{ padding: 16, paddingBottom: 32, ...padding, gap: 12 }} style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ gap: 8 }}>
        <Typography variant="h2">Rechercher par code UAI</Typography>
        <Typography variant="body1" color="textSecondary">Saisis le code de ton établissement. Papillon vérifiera ensuite qu’une adresse PRONOTE correspondante est disponible.</Typography>
        <TextInput
          accessibilityLabel="Code UAI de l’établissement"
          autoCapitalize="characters"
          autoCorrect={false}
          value={uai}
          onChangeText={setUai}
          onSubmitEditing={() => void searchUai()}
          placeholder="0751234A"
          placeholderTextColor={colors.text}
          style={{ color: colors.text, backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12 }}
        />
        <Button label={loading ? "Recherche…" : "Rechercher"} fullWidth height={44} onPress={() => void searchUai()} disabled={loading || !uai.trim()} />
        {loading && <ActivityIndicator color={colors.primary} />}
        {message.length > 0 && <Typography variant="body1" color="textSecondary">{message}</Typography>}
      </View>

      <List.Item onPress={() => router.navigate("/(onboarding)/services/pronote/url")}>
        <List.Leading><Icon><Papicons name="link" /></Icon></List.Leading>
        <Typography variant="title">Saisir l’adresse PRONOTE manuellement</Typography>
      </List.Item>
    </List>
  );
}
