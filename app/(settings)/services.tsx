import { UserX2Icon } from "lucide-react-native";
import React from "react";
import { ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import { useAccountStore } from "@/stores/account";
import Icon from "@/ui/components/Icon";
import Item from "@/ui/components/Item";
import List from "@/ui/components/List";
import Stack from "@/ui/components/Stack";
import Typography from "@/ui/components/Typography";

export default function SettingsServices() {
  const accountStore = useAccountStore();
  const { t } = useTranslation();

  return (
    <ScrollView
      contentContainerStyle={{ padding: 16 }}
      contentInsetAdjustmentBehavior="always"
      style={{ width: '100%', height: '100%' }}
    >
      {accountStore.lastUsedAccount && (
        <List>
          <Item>
            <Typography variant="caption" color="secondary">
              {t('Settings_Services_Title_LastAccountUsed')}
            </Typography>
            <Typography variant="title">
              {accountStore.lastUsedAccount}
            </Typography>
          </Item>
        </List>
      )}

      {accountStore.accounts.length === 0 && (
        <Stack
          vAlign="center"
          hAlign="center"
          padding={16}
          gap={0}
        >
          <Icon opacity={0.5} style={{ marginBottom: 8 }}>
            <UserX2Icon size={36} />
          </Icon>
          <Typography variant="h4" align="center">
            Aucun compte lié
          </Typography>
          <Typography variant="body1" color="secondary" align="center">
            Ajoute un compte en appuyant sur le bouton ci-dessus.
          </Typography>
        </Stack>
      )}
    </ScrollView>
  );
}
