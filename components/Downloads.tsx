import * as Haptics from "expo-haptics";
import { useTheme } from "expo-router/react-navigation";
import { t } from "i18next";
import { useNavigation } from "expo-router";
import React, { useLayoutEffect, useMemo, useState } from "react";
import { ActionSheetIOS, Alert, Image, Platform, StyleSheet, View } from "react-native";

import { AttachmentType } from "@/services/shared/attachment";
import {
  deleteDownload,
  DownloadedFile,
  formatBytes,
  getAttachmentKind,
  getDownloadedFile,
  getExtension,
  getFolderKey,
  openDownloadedFile,
  useDownloadsStore,
} from "@/stores/downloads";
import List from "@/ui/new/List";
import Typography from "@/ui/new/Typography";
import { getSubjectColor } from "@/utils/subjects/colors";
import { getSubjectEmoji } from "@/utils/subjects/emoji";
import { getSubjectName } from "@/utils/subjects/name";

export interface DownloadFolder {
  key: string;
  name: string;
  emoji: string;
  color: string;
  /** Newest first. */
  files: DownloadedFile[];
  size: number;
}

export const getFolderInfo = (key: string) => {
  if (key.startsWith("subject:")) {
    const subject = key.slice("subject:".length);
    return { name: getSubjectName(subject), emoji: getSubjectEmoji(subject), color: getSubjectColor(subject) };
  }
  if (key === "news") return { name: t("Tab_News"), emoji: "📰", color: "#1F7AFC" };
  return { name: t("Settings_Downloads_Other"), emoji: "📁", color: "#888888" };
};

/** Downloads grouped by folder: subjects A→Z, then news, then the rest. */
export const useDownloadFolders = (): DownloadFolder[] => {
  const files = useDownloadsStore(state => state.files);

  return useMemo(() => {
    const folders = new Map<string, DownloadFolder>();
    for (const file of Object.values(files).sort((a, b) => b.downloadedAt - a.downloadedAt)) {
      const key = getFolderKey(file);
      if (!folders.has(key)) folders.set(key, { key, ...getFolderInfo(key), files: [], size: 0 });
      const folder = folders.get(key)!;
      folder.files.push(file);
      folder.size += file.size;
    }
    const rank = (key: string) => (key.startsWith("subject:") ? 0 : key === "news" ? 1 : 2);
    return [...folders.values()].sort((a, b) => rank(a.key) - rank(b.key) || a.name.localeCompare(b.name));
  }, [files]);
};

export const describeFolder = (folder: DownloadFolder) =>
  t("Settings_Downloads_Storage", { count: folder.files.length, size: formatBytes(folder.size) });

export const FolderTile = ({ folder, size = 40 }: { folder: Pick<DownloadFolder, "emoji" | "color">; size?: number }) => (
  <View
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.3,
      borderCurve: "continuous",
      backgroundColor: folder.color + "26",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <Typography style={{ fontSize: size * 0.5, lineHeight: size * 0.62 }}>{folder.emoji}</Typography>
  </View>
);

const EXTENSION_COLORS: Record<string, string> = {
  pdf: "#D60046",
  doc: "#2B6CD4", docx: "#2B6CD4", odt: "#2B6CD4", rtf: "#2B6CD4", txt: "#6B6B6B",
  xls: "#1E8E3E", xlsx: "#1E8E3E", ods: "#1E8E3E", csv: "#1E8E3E",
  ppt: "#E8710A", pptx: "#E8710A", odp: "#E8710A", key: "#E8710A",
  png: "#8E44AD", jpg: "#8E44AD", jpeg: "#8E44AD", gif: "#8E44AD", webp: "#8E44AD", heic: "#8E44AD",
  mp3: "#C2185B", wav: "#C2185B", m4a: "#C2185B", mp4: "#00838F", mov: "#00838F",
  zip: "#795548", rar: "#795548", "7z": "#795548",
};

/** Page-shaped tile labelled with the file's extension. */
export const FileTypeTile = ({ name, url, size = 40 }: { name: string; url: string; size?: number }) => {
  const { colors } = useTheme();
  const ext = getExtension({ name, url });
  const label = ext.length > 0 && ext.length <= 4 ? ext.toUpperCase() : "";

  return (
    <View
      style={{
        width: size * 0.8,
        height: size,
        marginHorizontal: size * 0.1,
        borderRadius: size * 0.16,
        borderCurve: "continuous",
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.text + "22",
        backgroundColor: "#fff",
        justifyContent: "flex-end",
        padding: size * 0.08,
      }}
    >
      {[0.9, 0.7, 0.8].map((width, index) => (
        <View key={index} style={{ height: 2, width: `${width * 100}%`, backgroundColor: "#00000018", borderRadius: 1, marginBottom: size * 0.05 }} />
      ))}
      <Typography
        weight="bold"
        numberOfLines={1}
        adjustsFontSizeToFit
        style={{ fontSize: size * 0.2, lineHeight: size * 0.26, color: EXTENSION_COLORS[ext] ?? "#6B6B6B", marginTop: size * 0.02 }}
      >
        {label}
      </Typography>
    </View>
  );
};

/** Preview of a downloaded file: the image itself, or its type tile. */
export const FileThumbnail = ({ file, size = 40 }: { file: DownloadedFile; size?: number }) => {
  const { colors } = useTheme();

  if (getAttachmentKind({ ...file, type: AttachmentType.FILE }) !== "image") {
    return <FileTypeTile name={file.name} url={file.url} size={size} />;
  }

  return (
    <Image
      source={{ uri: getDownloadedFile(file).uri }}
      resizeMode="cover"
      resizeMethod="resize"
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.22,
        borderCurve: "continuous",
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.text + "22",
        backgroundColor: colors.text + "12",
      }}
    />
  );
};

const formatDate = (timestamp: number) =>
  new Date(timestamp).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

/** Long-press menu for a file: open or delete, without cluttering every row with buttons. */
const showFileMenu = (file: DownloadedFile) => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  const remove = () => {
    deleteDownload(file.id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  if (Platform.OS === "ios") {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        title: file.name,
        options: [t("Settings_Downloads_Open"), t("Settings_Downloads_Delete"), t("Context_Cancel")],
        destructiveButtonIndex: 1,
        cancelButtonIndex: 2,
      },
      index => {
        if (index === 0) openDownloadedFile(file);
        if (index === 1) remove();
      }
    );
  } else {
    Alert.alert(file.name, undefined, [
      { text: t("Context_Cancel"), style: "cancel" },
      { text: t("Settings_Downloads_Delete"), style: "destructive", onPress: remove },
      { text: t("Settings_Downloads_Open"), onPress: () => openDownloadedFile(file) },
    ]);
  }
};

/**
 * One file row. A plain function rather than a component: List only lays out
 * direct List.Item children.
 */
export const renderFileItem = (file: DownloadedFile, showFolder = false) => {
  const details = [formatBytes(file.size), formatDate(file.downloadedAt)];
  if (showFolder) details.unshift(getFolderInfo(getFolderKey(file)).name);

  return (
    <List.Item
      key={file.id}
      id={file.id}
      animated
      onPress={() => openDownloadedFile(file)}
      onLongPress={() => showFileMenu(file)}
    >
      <List.Leading>
        <FileThumbnail file={file} />
      </List.Leading>
      <Typography variant="title" numberOfLines={1}>{file.name}</Typography>
      <Typography color="textSecondary" numberOfLines={1}>{details.join(" · ")}</Typography>
    </List.Item>
  );
};

/** Adds the native header search bar to the current screen and returns what's typed. */
export const useHeaderSearch = () => {
  const navigation = useNavigation();
  const [query, setQuery] = useState("");

  useLayoutEffect(() => {
    navigation.setOptions({
      headerSearchBarOptions: {
        placeholder: t("Settings_Downloads_Search"),
        hideWhenScrolling: false,
        onChangeText: (event: { nativeEvent: { text: string } }) => setQuery(event.nativeEvent.text),
      },
    });
  }, [navigation]);

  return query.trim();
};

export const matchesQuery = (file: DownloadedFile, query: string) =>
  file.name.toLowerCase().includes(query.toLowerCase());
