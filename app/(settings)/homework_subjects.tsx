import React, { useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import { useTheme } from "expo-router/react-navigation";
import { useTranslation } from "react-i18next";

import { useSettingsStore } from "@/stores/settings";
import Typography from "@/ui/new/Typography";
import Icon from "@/ui/components/Icon";
import { Papicons } from "@getpapillon/papicons";
import { useSafeHorizontalPadding } from "@/ui/hooks/useSafeHorizontalPadding";

export default function HomeworkSubjectsScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const padding = useSafeHorizontalPadding(16);
  const [subject, setSubject] = useState("");
  const subjects = useSettingsStore(state => state.personalization.customHomeworkSubjects ?? []);
  const mutateSettings = useSettingsStore(state => state.mutateProperty);

  const addSubject = () => {
    const name = subject.trim();
    if (!name || subjects.some(item => item.toLocaleLowerCase() === name.toLocaleLowerCase())) return;
    mutateSettings("personalization", { customHomeworkSubjects: [...subjects, name] });
    setSubject("");
  };

  const removeSubject = (name: string) => {
    mutateSettings("personalization", { customHomeworkSubjects: subjects.filter(item => item !== name) });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.overground, padding: 20, ...padding, gap: 16 }}>
      <Typography variant="body1" color="textSecondary">
        {t("Tasks_Custom_Subjects_Description", "Ces matières sont proposées quand tu ajoutes un devoir personnel.")}
      </Typography>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <TextInput
          value={subject}
          onChangeText={setSubject}
          onSubmitEditing={addSubject}
          placeholder={t("Tasks_Custom_Subjects_Placeholder", "Nouvelle matière")}
          placeholderTextColor={colors.text + "80"}
          style={{ flex: 1, color: colors.text, backgroundColor: colors.item, borderColor: colors.border, borderWidth: 1, borderRadius: 14, padding: 12, fontSize: 16 }}
        />
        <Pressable onPress={addSubject} disabled={!subject.trim()} accessibilityRole="button" accessibilityLabel={t("Tasks_Custom_Subjects_Add", "Ajouter la matière")} style={{ opacity: subject.trim() ? 1 : 0.45, backgroundColor: colors.primary, borderRadius: 14, padding: 14 }}>
          <Icon color="white"><Papicons name="Add" /></Icon>
        </Pressable>
      </View>
      <View style={{ gap: 8 }}>
        {subjects.map(item => (
          <View key={item} style={{ minHeight: 54, flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: colors.item, borderRadius: 14, paddingHorizontal: 14 }}>
            <Typography variant="title">{item}</Typography>
            <Pressable onPress={() => removeSubject(item)} accessibilityRole="button" accessibilityLabel={`${t("Context_Delete", "Supprimer")} ${item}`} hitSlop={10}>
              <Icon color="#D60046"><Papicons name="Trash" /></Icon>
            </Pressable>
          </View>
        ))}
      </View>
    </View>
  );
}
