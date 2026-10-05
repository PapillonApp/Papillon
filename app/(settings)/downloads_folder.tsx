import { Papicons } from "@getpapillon/papicons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useTheme } from "expo-router/react-navigation";
import React, { useEffect, useLayoutEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Alert } from "react-native";

import {
  describeFolder,
  getFolderInfo,
  matchesQuery,
  renderFileItem,
  useDownloadFolders,
  useHeaderSearch,
} from "@/components/Downloads";
import { deleteFolder } from "@/stores/downloads";
import Icon from "@/ui/components/Icon";
import { NativeHeaderPressable, NativeHeaderSide } from "@/ui/components/NativeHeader";
import List from "@/ui/new/List";
import Typography from "@/ui/new/Typography";

export default function SettingsDownloadsFolder() {
  const { key } = useLocalSearchParams<{ key: string }>();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const navigation = useNavigation();
  const query = useHeaderSearch();
  const folder = useDownloadFolders().find(f => f.key === key);
  const { name } = getFolderInfo(key);

  useLayoutEffect(() => {
    navigation.setOptions({ headerTitle: name });
  }, [navigation, name]);

  // Last file deleted: nothing left to show here.
  useEffect(() => {
    if (!folder && router.canGoBack()) router.back();
  }, [folder]);

  const files = useMemo(
    () => (folder?.files ?? []).filter(file => !query || matchesQuery(file, query)),
    [folder, query]
  );

  const confirmDelete = () =>
    Alert.alert(t("Settings_Downloads_DeleteFolder_Confirm", { name }), t("Settings_Downloads_DeleteAll_Confirm_Description"), [
      { text: t("Context_Cancel"), style: "cancel" },
      {
        text: t("Settings_Downloads_Delete"),
        style: "destructive",
        onPress: () => {
          deleteFolder(key);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        },
      },
    ]);

  if (!folder) return null;

  return (
    <>
      <NativeHeaderSide side="Right">
        <NativeHeaderPressable accessibilityLabel={t("Settings_Downloads_Delete")} onPress={confirmDelete}>
          <Icon>
            <Papicons name="Trash" />
          </Icon>
        </NativeHeaderPressable>
      </NativeHeaderSide>

      <List
        animated
        contentInsetAdjustmentBehavior="automatic"
        safeHorizontalPadding={16}
        contentContainerStyle={{ paddingVertical: 16 }}
        style={{ flex: 1, backgroundColor: colors.overground }}
      >
        <List.Section>
          <List.SectionTitle>
            <List.Label>{describeFolder(folder)}</List.Label>
          </List.SectionTitle>
          {files.length === 0 && (
            <List.Item id="no-results">
              <List.Leading>
                <Icon><Papicons name="Search" /></Icon>
              </List.Leading>
              <Typography color="textSecondary">{t("Settings_Downloads_NoResults")}</Typography>
            </List.Item>
          )}
          {files.map(file => renderFileItem(file))}
        </List.Section>
      </List>
    </>
  );
}
