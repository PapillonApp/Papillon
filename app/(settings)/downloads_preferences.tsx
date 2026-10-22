import { Papicons } from "@getpapillon/papicons";
import * as Haptics from "expo-haptics";
import { useTheme } from "expo-router/react-navigation";
import React from "react";
import { useTranslation } from "react-i18next";
import { Alert, View } from "react-native";

import { DownloadFolder, FolderTile, useDownloadFolders } from "@/components/Downloads";
import { clearDownloads, deleteFolder, formatBytes, useDownloadsStore } from "@/stores/downloads";
import Icon from "@/ui/components/Icon";
import NativeSwitch from "@/ui/native/NativeSwitch";
import List from "@/ui/new/List";
import Typography from "@/ui/new/Typography";

const DANGER = "#D60046";

export default function SettingsDownloadsPreferences() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const folders = useDownloadFolders();
  const autoDownload = useDownloadsStore(state => state.autoDownload);
  const setAutoDownload = useDownloadsStore(state => state.setAutoDownload);

  const totalSize = folders.reduce((sum, folder) => sum + folder.size, 0);
  const fileCount = folders.reduce((sum, folder) => sum + folder.files.length, 0);

  const confirm = (title: string, action: string, onConfirm: () => void) =>
    Alert.alert(title, t("Settings_Downloads_DeleteAll_Confirm_Description"), [
      { text: t("Context_Cancel"), style: "cancel" },
      {
        text: action,
        style: "destructive",
        onPress: () => {
          onConfirm();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        },
      },
    ]);

  const confirmFolder = (folder: DownloadFolder) =>
    confirm(t("Settings_Downloads_DeleteFolder_Confirm", { name: folder.name }), t("Settings_Downloads_Delete"), () =>
      deleteFolder(folder.key)
    );

  return (
    <List
      animated
      contentInsetAdjustmentBehavior="automatic"
      safeHorizontalPadding={16}
      contentContainerStyle={{ paddingVertical: 16 }}
      style={{ flex: 1, backgroundColor: colors.overground }}
    >
      <List.Section>
        <List.SectionTitle>
          <List.Label>{t("Settings_Downloads_Preferences")}</List.Label>
        </List.SectionTitle>
        <List.Item id="auto">
          <List.Leading>
            <Icon><Papicons name="ArrowDown" /></Icon>
          </List.Leading>
          <Typography variant="title">{t("Settings_Downloads_Auto")}</Typography>
          <Typography color="textSecondary" numberOfLines={2}>{t("Settings_Downloads_Auto_Description")}</Typography>
          <List.Trailing>
            <NativeSwitch value={autoDownload} onValueChange={setAutoDownload} />
          </List.Trailing>
        </List.Item>
      </List.Section>

      <List.Section>
        <List.SectionTitle>
          <List.Label>{t("Settings_Downloads_StorageTitle")}</List.Label>
        </List.SectionTitle>

        <List.Item id="usage">
          <Typography variant="title">{t("Settings_Downloads_Used", { size: formatBytes(totalSize) })}</Typography>
          <Typography color="textSecondary">
            {t("Settings_Downloads_Storage", { count: fileCount, size: formatBytes(totalSize) })}
          </Typography>
          {totalSize > 0 && (
            <View
              accessible={false}
              style={{
                flexDirection: "row",
                height: 10,
                borderRadius: 5,
                overflow: "hidden",
                gap: 2,
                marginTop: 10,
                backgroundColor: colors.text + "12",
              }}
            >
              {folders.map(folder => (
                <View key={folder.key} style={{ flex: folder.size, minWidth: 3, backgroundColor: folder.color }} />
              ))}
            </View>
          )}
        </List.Item>

        {folders.map(folder => (
          <List.Item key={folder.key} id={folder.key} animated onPress={() => confirmFolder(folder)}>
            <List.Leading>
              <FolderTile folder={folder} size={32} />
            </List.Leading>
            <Typography variant="title" numberOfLines={1}>{folder.name}</Typography>
            <List.Trailing>
              <Typography color="textSecondary">{formatBytes(folder.size)}</Typography>
            </List.Trailing>
          </List.Item>
        ))}
      </List.Section>

      {fileCount > 0 && (
        <List.Section>
          <List.Item
            id="clear"
            onPress={() => confirm(t("Settings_Downloads_DeleteAll_Confirm"), t("Settings_Downloads_DeleteAll"), clearDownloads)}
          >
            <List.Leading>
              <Icon papicon fill={DANGER}><Papicons name="Trash" /></Icon>
            </List.Leading>
            <Typography variant="title" color={DANGER}>{t("Settings_Downloads_DeleteAll")}</Typography>
          </List.Item>
        </List.Section>
      )}
    </List>
  );
}
