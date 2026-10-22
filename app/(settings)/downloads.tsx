import { Papicons } from "@getpapillon/papicons";
import { useRouter } from "expo-router";
import { useTheme } from "expo-router/react-navigation";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

import {
  describeFolder,
  FolderTile,
  matchesQuery,
  renderFileItem,
  useDownloadFolders,
  useHeaderSearch,
} from "@/components/Downloads";
import Icon from "@/ui/components/Icon";
import { NativeHeaderPressable, NativeHeaderSide } from "@/ui/components/NativeHeader";
import List from "@/ui/new/List";
import Typography from "@/ui/new/Typography";

const RECENT_COUNT = 5;

export default function SettingsDownloads() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const query = useHeaderSearch();
  const folders = useDownloadFolders();
  const muted = colors.text + "88";

  const all = useMemo(
    () => folders.flatMap(folder => folder.files).sort((a, b) => b.downloadedAt - a.downloadedAt),
    [folders]
  );
  const results = useMemo(() => (query ? all.filter(file => matchesQuery(file, query)) : []), [all, query]);

  return (
    <>
      <NativeHeaderSide side="Right">
        <NativeHeaderPressable
          accessibilityLabel={t("Settings_Downloads_Preferences")}
          onPress={() => router.navigate("/(settings)/downloads_preferences")}
        >
          <Icon>
            <Papicons name="Gears" />
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
        {query ? (
          <List.Section>
            <List.SectionTitle>
              <List.Label>{t("Settings_Downloads_Results")}</List.Label>
            </List.SectionTitle>
            {results.length === 0 && (
              <List.Item id="no-results">
                <List.Leading>
                  <Icon><Papicons name="Search" /></Icon>
                </List.Leading>
                <Typography color="textSecondary">{t("Settings_Downloads_NoResults")}</Typography>
              </List.Item>
            )}
            {results.map(file => renderFileItem(file, true))}
          </List.Section>
        ) : all.length === 0 ? (
          <List.Section>
            <List.Item id="empty">
              <List.Leading>
                <Icon><Papicons name="Folder" /></Icon>
              </List.Leading>
              <Typography variant="title">{t("Settings_Downloads_Empty_Title")}</Typography>
              <Typography color="textSecondary">{t("Settings_Downloads_Empty_Description")}</Typography>
            </List.Item>
          </List.Section>
        ) : (
          [
            <List.Section key="folders">
              <List.SectionTitle>
                <List.Label>{t("Settings_Downloads_Folders")}</List.Label>
              </List.SectionTitle>
              {folders.map(folder => (
                <List.Item
                  key={folder.key}
                  id={folder.key}
                  animated
                  onPress={() =>
                    router.navigate({ pathname: "/(settings)/downloads_folder", params: { key: folder.key } })
                  }
                >
                  <List.Leading>
                    <FolderTile folder={folder} />
                  </List.Leading>
                  <Typography variant="title" numberOfLines={1}>{folder.name}</Typography>
                  <Typography color="textSecondary" numberOfLines={1}>{describeFolder(folder)}</Typography>
                  <List.Trailing>
                    <Icon papicon size={20} fill={muted}><Papicons name="ChevronRight" /></Icon>
                  </List.Trailing>
                </List.Item>
              ))}
            </List.Section>,
            <List.Section key="recent">
              <List.SectionTitle>
                <List.Label>{t("Settings_Downloads_Recent")}</List.Label>
              </List.SectionTitle>
              {all.slice(0, RECENT_COUNT).map(file => renderFileItem(file, true))}
            </List.Section>,
          ]
        )}
      </List>
    </>
  );
}
