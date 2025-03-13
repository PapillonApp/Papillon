import React, { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useTheme } from "@react-navigation/native";

import type { Screen } from "@/router/helpers/types";
import {
  NativeItem,
  NativeList,
  NativeListHeader,
  NativeText,
} from "@/components/Global/NativeComponents";
import { useCurrentAccount } from "@/stores/account";
import { Recipient } from "@/services/shared/Recipient";
import { createDiscussion, createDiscussionRecipients } from "@/services/chats";
import { BadgeHelp, PenTool, Send, Tag, Undo2 } from "lucide-react-native";
import InsetsBottomView from "@/components/Global/InsetsBottomView";
import PapillonCheckbox from "@/components/Global/PapillonCheckbox";
import { getProfileColorByName } from "@/services/local/default-personalization";
import InitialIndicator from "@/components/News/InitialIndicator";
import parse_initials from "@/utils/format/format_pronote_initials";
import ButtonCta from "@/components/FirstInstallation/ButtonCta";
import Reanimated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useAlert } from "@/providers/AlertProvider";
import ResponsiveTextInput from "@/components/FirstInstallation/ResponsiveTextInput";

const ChatCreate: Screen<"ChatCreate"> = ({ navigation }) => {
  const theme = useTheme();
  const { colors } = theme;

  const account = useCurrentAccount((state) => state.account!);

  const [recipients, setRecipients] = useState<Recipient[] | null>(null);
  const [selectedRecipients, setSelectedRecipients] = useState<Recipient[]>([]);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    void async function () {
      const recipients = await createDiscussionRecipients(account);
      setSelectedRecipients([]);
      setRecipients(recipients);
      setLoading(false);
    }();
  }, [account?.instance]);

  const toggleRecipientSelection = (recipient: Recipient) => {
    if (selectedRecipients.includes(recipient)) {
      setSelectedRecipients(
        selectedRecipients.filter((r) => r !== recipient)
      );
      return;
    }
    setSelectedRecipients([
      ...selectedRecipients,
      recipient,
    ]);
  };

  const { showAlert } = useAlert();

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 150
        }}
        showsVerticalScrollIndicator={false}
      >
        <NativeListHeader label="Sujet et contenu" />
        <NativeList>
          <NativeItem chevron={false} icon={<Tag />}>
            <NativeText variant="subtitle">Sujet</NativeText>
            <ResponsiveTextInput
              style={[styles.textInput, { color: theme.colors.text }]}
              placeholder="Sujet de ton message"
              placeholderTextColor={theme.colors.text + "80"}
              value={subject}
              onChangeText={setSubject}
            />
          </NativeItem>
          <NativeItem chevron={false} icon={<PenTool />}>
            <NativeText variant="subtitle">Contenu</NativeText>
            <ResponsiveTextInput
              style={{
                fontSize: 16,
                fontFamily: "semibold",
                color: theme.colors.text,
              }}
              placeholder="Entre ton texte"
              placeholderTextColor={theme.colors.text + "80"}
              value={content}
              multiline={true}
              onChangeText={setContent}
            />
          </NativeItem>
        </NativeList>
        <NativeListHeader label="Destinataire(s)" />
        {loading ? (
          <Reanimated.View
            entering={FadeIn.springify().mass(1).damping(20).stiffness(300)}
            exiting={
              Platform.OS === "ios"
                ? FadeOut.springify().mass(1).damping(20).stiffness(300)
                : undefined
            }
            style={{
              justifyContent: "center",
              alignItems: "center",
              paddingTop: 50,
            }}
          >
            <ActivityIndicator size={"large"} />

            <NativeText
              style={{
                color: colors.text,
                fontSize: 18,
                textAlign: "center",
                fontFamily: "semibold",
                marginTop: 10,
              }}
            >
              Chargement des destinataires...
            </NativeText>

            <NativeText
              style={{
                color: colors.text,
                fontSize: 16,
                textAlign: "center",
                fontFamily: "medium",
                marginTop: 4,
                opacity: 0.5,
              }}
            >
              Ça ne devrait pas prendre longtemps...
            </NativeText>
          </Reanimated.View>
        ) : (
          <NativeList>
            {recipients &&
            recipients.map((recipient) => (
              <NativeItem
                key={recipient.name}
                title={recipient.name}
                subtitle={recipient.subject}
                leading={
                  <InitialIndicator
                    initial={parse_initials(recipient.name)}
                    color={getProfileColorByName(recipient.name).bright}
                    textColor={getProfileColorByName(recipient.name).dark}
                    size={38}
                  />
                }
                trailing={
                  <PapillonCheckbox
                    style={{ marginRight: 10 }}
                    checked={selectedRecipients.includes(recipient)}
                    color={getProfileColorByName(recipient.name).dark}
                    onPress={() => toggleRecipientSelection(recipient)}
                  />
                }
              />
            ))}
          </NativeList>
        )}
      </ScrollView>
      <View style={[styles.fixedButtonContainer, {backgroundColor: colors.background}]}>
        <ButtonCta primary value={"Créer la discussion"} disabled={!(content && selectedRecipients.length > 0)} onPress={() => {
          if (!subject) {
            showAlert({
              title: "Veux-tu continuer sans objet ?",
              message: "Tu es sur le point de créer une discussion sans objet. Veux-tu continuer ?",
              icon: <BadgeHelp />,
              actions: [
                {
                  title: "Annuler",
                  icon: <Undo2 />,
                  primary: false,
                  backgroundColor: theme.colors.primary,
                },
                {
                  title: "Continuer",
                  icon: <Send />,
                  onPress: () => {
                    createDiscussion(account, "Aucun objet", content, selectedRecipients);
                    navigation.goBack();
                  },
                }
              ]
            });
          } else {
            createDiscussion(account, subject, content, selectedRecipients);
            navigation.goBack();
          }
        }} />
        <InsetsBottomView />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fixedButtonContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  button: {
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  textInput: {
    fontSize: 16,
    fontFamily: "semibold",
  }
});

export default ChatCreate;
