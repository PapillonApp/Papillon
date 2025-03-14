import React, { useState } from "react";
import { ScrollView, TextInput, View } from "react-native";
import type { Screen } from "@/router/helpers/types";
import { useTheme } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SupportContainerCard from "@/components/Settings/SupportContainerCard";
import PapillonCheckbox from "@/components/Global/PapillonCheckbox";
import { NativeItem, NativeList, NativeListHeader, NativeText } from "@/components/Global/NativeComponents";
import { Check, Mail, Tag, Text } from "lucide-react-native";
import ButtonCta from "@/components/FirstInstallation/ButtonCta";
import { get_logs, Log } from "@/utils/logger/logger";
import { useAlert } from "@/providers/AlertProvider";

const SettingsSupport: Screen<"SettingsSupport"> = ({ navigation }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const { showAlert } = useAlert();

  const [sendLogs, setSendLogs] = useState<boolean>(false);
  const [email, setEmail] = useState<string>();
  const [subject, setSubject] = useState<string>();
  const [description, setDescription] = useState<string>();

  const handlePress = async () => {
    const logs: Log[] = await get_logs();
    const formattedLogs = logs
      .filter((log) => log.type === "ERROR")
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .map((log) => {
        if (!log.date) return `[${log.type}] ${log.message}`;

        const logDate = new Date(log.date);
        if (isNaN(logDate.getTime())) return `[${log.type}] ${log.message}`;

        return `[${log.date}] [${log.type}] ${log.message}`;
      })
      .join("<br>");

    const data = {
      email: email,
      title: subject,
      detail: `Description de mon problème:<br>${description} <br><br>Journaux: <br>${formattedLogs}`,
    };

    const response = await fetch("https://api-menthe-et-cristaux.papillon.bzh/api/v1/ticket/public/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (__DEV__) console.log(result);
    setSubject("");
    setEmail("");
    setDescription("");
    setSendLogs(false);
    showAlert({
      title: "Merci de vos retours !",
      message: "Nous avons reçu votre demande et allons la regarder avec la plus grande attention.",
      icon: <Check />,
    });
  };

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 16,
        paddingTop: 0,
        paddingBottom: insets.bottom + 16,
      }}
    >
      <SupportContainerCard
        theme={theme}
      />
      <NativeListHeader
        label="Formulaire"
      />
      <NativeList>
        <NativeItem icon={<Mail />}>
          <NativeText variant="subtitle">Adresse E-Mail</NativeText>
          <TextInput
            style={[{
              fontSize: 16,
              fontFamily: "semibold",
            }, { color: theme.colors.text }]}
            placeholder="exemple@acme.inc"
            autoCapitalize="none"
            autoCorrect={false}
            placeholderTextColor={theme.colors.text + "80"}
            value={email}
            onChangeText={setEmail}
          />
        </NativeItem>
        <NativeItem icon={<Tag />}>
          <NativeText variant="subtitle">Sujet</NativeText>
          <TextInput
            style={[{
              fontSize: 16,
              fontFamily: "semibold",
            }, { color: theme.colors.text }]}
            placeholder="Faites court, mais faites bien"
            placeholderTextColor={theme.colors.text + "80"}
            value={subject}
            multiline={false}
            onChangeText={setSubject}
          />
        </NativeItem>
        <NativeItem icon={<Text />}>
          <NativeText variant="subtitle">Description</NativeText>
          <TextInput
            style={[{
              fontSize: 16,
              lineHeight: 22,
              marginVertical: -4,
              fontFamily: "semibold",
            }, { color: theme.colors.text }]}
            placeholder="Expliquez votre problème de manière détaillée afin de nous aider à résoudre le problème rapidement."
            placeholderTextColor={theme.colors.text + "80"}
            value={description}
            multiline={true}
            onChangeText={setDescription}
          />
        </NativeItem>
      </NativeList>
      <NativeListHeader
        label="Consentement"
      />
      <NativeList>
        <NativeItem
          leading={
            <PapillonCheckbox
              checked={sendLogs}
              onPress={() => {
                setSendLogs(!sendLogs);
              }}
            />
          }>
          <NativeText>J’accepte de transmettre les journaux d'erreurs et les données du formulaire pour le traitement de ma demande</NativeText>
        </NativeItem>
      </NativeList>
      <View style={{ paddingVertical: 20 }}>
        <ButtonCta primary value={"Envoyer mon message"} disabled={!(email && subject && description && sendLogs)} onPress={() => handlePress()} />
      </View>
    </ScrollView>
  );
};

export default SettingsSupport;
