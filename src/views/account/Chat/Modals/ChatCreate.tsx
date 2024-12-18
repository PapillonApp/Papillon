import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  TouchableOpacity,
  ScrollView,
  TextInput,
  View,
  Button,
} from "react-native";
import { useTheme } from "@react-navigation/native";

import type { Screen } from "@/router/helpers/types";
import {
  NativeText,
} from "@/components/Global/NativeComponents";
import { useCurrentAccount } from "@/stores/account";
import { Recipient } from "@/services/shared/Recipient";
import { createDiscussion, createDiscussionRecipients } from "@/services/chats";

const ChatCreate: Screen<"ChatCreate"> = ({
  navigation,
  route,
}) => {
  const theme = useTheme();
  const { colors } = theme;

  const account = useCurrentAccount(state => state.account!);

  const [recipients, setRecipients] = useState<Recipient[] | null>(null);
  const [selectedRecipients, setSelectedRecipients] = useState<Recipient[]>([]);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    void async function () {
      const recipients = await createDiscussionRecipients(account);
      setSelectedRecipients([]);
      setRecipients(recipients);
    }();
  }, [account?.instance]);

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 20,
      }}
    >
      <TextInput value={subject} onChangeText={setSubject} placeholder="Sujet de la discussion" style={{ color: colors.text }} />
      <TextInput value={content} onChangeText={setContent} placeholder="Contenu du premier message" style={{ color: colors.text }} />
      <View>
        <NativeText>Sélectionner les destinataires :</NativeText>
        {recipients?.map((recipient, index) => (
          <TouchableOpacity key={index + "chat-create-recipient"}
            style={{
              padding: 10,
              backgroundColor: selectedRecipients.includes(recipient) ? colors.primary : colors.card,
              margin: 5,
              borderRadius: 5,
            }}
            onPress={() => {
              if (selectedRecipients.includes(recipient)) {
                setSelectedRecipients(selectedRecipients.filter(r => r !== recipient));
                return;
              }

              setSelectedRecipients([...selectedRecipients, recipient]);
            }}
          >
            <NativeText>
              {recipient.name}
            </NativeText>
          </TouchableOpacity>
        )) || (
          <NativeText>
            Chargement des destinataires...
          </NativeText>
        )}
      </View>

      <Button title="Créer la discussion" onPress={async () => {
        await createDiscussion(account, subject, content, selectedRecipients);
        navigation.goBack();
      }} />
    </ScrollView>
  );
};


export default ChatCreate;
