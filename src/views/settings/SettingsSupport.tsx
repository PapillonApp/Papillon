import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from "react-native";
import type { Screen } from "@/router/helpers/types";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SupportContainerCard from "@/components/Settings/SupportContainerCard";
import PapillonCheckbox from "@/components/Global/PapillonCheckbox";
import { NativeItem, NativeList, NativeListHeader, NativeText } from "@/components/Global/NativeComponents";
import { Check, Mail, Tag, Text, OctagonX } from "lucide-react-native";
import ButtonCta from "@/components/FirstInstallation/ButtonCta";
import { get_logs, Log } from "@/utils/logger/logger";
import { useAlert } from "@/providers/AlertProvider";
import { modelName, osName, osVersion } from "expo-device";
import { useCurrentAccount, useAccounts } from "@/stores/account";
import { AccountService } from "@/stores/account/types";
import PackageJSON from "../../../package.json";

const SettingsSupport: Screen<"SettingsSupport"> = ({ navigation }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const { showAlert } = useAlert();

  const [sendLogs, setSendLogs] = useState<boolean>(false);
  const [email, setEmail] = useState<string>();
  const [subject, setSubject] = useState<string>();
  const [description, setDescription] = useState<string>();

  const currentAccount = useCurrentAccount((store) => store.account!);
  const AccountType = AccountService[currentAccount.service] !== "Local" && currentAccount.service !== AccountService.PapillonMultiService ? AccountService[currentAccount.service] : currentAccount.identityProvider ? currentAccount.identityProvider.name : "Compte local";

  const cantineAccounts = useAccounts((state) =>
    state.accounts.filter((acc) =>
      [AccountService.Turboself, AccountService.ARD, AccountService.Izly, AccountService.Alise].includes(acc.service)
    )
  );

  const serviceNames: Partial<Record<AccountService, string>> = {
    [AccountService.Turboself]: "Turboself",
    [AccountService.ARD]: "ARD",
    [AccountService.Izly]: "Izly",
    [AccountService.Alise]: "Alise",
  };

  const cantineServices = cantineAccounts
    .map((acc) => serviceNames[acc.service] ?? "Inconnu")
    .join(", ") || "Aucun";


  const handlePress = async () => {
    const logs: Log[] = await get_logs();
    const formattedLogs = logs
      .filter((log) => log.type === "ERROR")
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .map((log) => {
        if (!log.date) return `[${log.type}] ${log.message}`;

        const logDate = new Date(log.date);
        if (isNaN(logDate.getTime())) return `[${log.type}] ${log.message}`;

        return `[${log.date}] [${log.type}] [${log.from}] ${log.message}`;
      })
      .join("<br>");

    const isValidEmail = (email: string): boolean => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

    if (!isValidEmail(email ?? "")) {
      showAlert({
        title: "Oups, une erreur s'est produite",
        message: "Ton adresse e-mail n'est pas valide.",
        icon: <OctagonX />,
      });
      return;
    }

    const data = {
      email: email,
      title: subject,
      detail: `<br>💬 𝗗𝗲𝘀𝗰𝗿𝗶𝗽𝘁𝗶𝗼𝗻 𝗱𝘂 𝗽𝗿𝗼𝗯𝗹𝗲̀𝗺𝗲:<br>${(description ?? "").replace(/\n/g, "<br>")} <br><br>🔒 𝗜𝗻𝗳𝗼𝗿𝗺𝗮𝘁𝗶𝗼𝗻𝘀 𝘀𝘂𝗿 𝗹'𝗮𝗽𝗽𝗮𝗿𝗲𝗶𝗹:<br>📱 Modèle de l'appareil: ${modelName}<br>🌐 OS: ${osName} ${osVersion}<br>🦋 Version de Papillon: ${PackageJSON.version} ${Platform.OS}<br><br>⌛ 𝗦𝗲𝗿𝘃𝗶𝗰𝗲𝘀 𝘂𝘁𝗶𝗹𝗶𝘀𝗲́𝘀:<br>⚡ Service scolaire: ${AccountType}<br>🍴 Service de cantine: ${cantineServices}<br><br>❌ 𝗝𝗼𝘂𝗿𝗻𝗮𝘂𝘅 𝗱'𝗲𝗿𝗿𝗲𝘂𝗿𝘀: <br>${formattedLogs}<br>`,
    };

    const response = await fetch("https://api-menthe-et-cristaux.papillon.bzh/api/v1/ticket/public/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    setSubject("");
    setEmail("");
    setDescription("");
    setSendLogs(false);
    showAlert({
      title: "Merci de ton retour !",
      message: "Nous avons reçu ta demande et allons la regarder avec la plus grande attention.",
      icon: <Check />,
    });
  };

  return (
    <KeyboardAvoidingView
      behavior="height"
      keyboardVerticalOffset={insets.top + 64}
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        overflow: "visible",
      }}
    >
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
            <NativeText variant="subtitle">Adresse e-mail</NativeText>
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
              placeholder="Fais court, mais fais bien"
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
            <NativeText>J’accepte de transmettre le modèle et la version de mon appareil, les services connectés ainsi que les données du formulaire pour le traitement de ma demande</NativeText>
          </NativeItem>
        </NativeList>
        <View style={{paddingVertical: 20}}>
          <ButtonCta primary value={"Envoyer mon message"} disabled={!(email && subject && description && sendLogs)} onPress={() => handlePress()} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// Styles
const styles = StyleSheet.create({
  title: {
    color: "#222222",
    fontSize: 15,
  },
  time: {
    color: "#3F3F3F",
    opacity: 0.5,
    textAlign: "right",
    fontFamily: "sfmedium",
    fontSize: 13,
    marginRight: 10,
  },
  message: {
    color: "#3F3F3F",
    fontFamily: "sfmedium",
    fontSize: 14,
    maxWidth: "85%",
    minWidth: "85%",
    lineHeight: 15,
    letterSpacing: -0.4,
  },

  overlay: {
    backgroundColor: "#EEF5F5",
    borderWidth: 1,
    borderColor: "#00000030",
    borderRadius: 20,
    height: 25,
    padding: 9,
    marginHorizontal: 20,
  },

  fixedButtonContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  }
});

export default SettingsSupport;
