import { Papicons } from "@getpapillon/papicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { t } from "i18next";
import React from "react";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import WebView from "react-native-webview";

import { getDownloadedFile, useDownloadsStore } from "@/stores/downloads";
import Icon from "@/ui/components/Icon";
import Typography from "@/ui/new/Typography";

// Android-only image viewer (iOS uses Quick Look). WebView gives pinch-zoom and panning for free.
export default function AttachmentViewer() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const entry = useDownloadsStore(state => state.files[id]);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  if (!entry) return null;
  const file = getDownloadedFile(entry);
  const html = `<html><head><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=6"></head>
    <body style="margin:0;background:#000;display:flex;align-items:center;justify-content:center;min-height:100vh">
    <img src="${file.uri}" style="max-width:100%;max-height:100vh;object-fit:contain"></body></html>`;

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <WebView
        source={{ html, baseUrl: file.parentDirectory.uri }}
        originWhitelist={["*"]}
        allowFileAccess
        allowFileAccessFromFileURLs
        setBuiltInZoomControls
        setDisplayZoomControls={false}
        style={{ flex: 1, backgroundColor: "#000" }}
      />
      <View
        style={{
          position: "absolute",
          top: insets.top + 8,
          left: 16,
          right: 16,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
        }}
      >
        <Pressable
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={t("Global_Back")}
          onPress={() => router.back()}
          style={{ padding: 8, borderRadius: 100, backgroundColor: "#ffffff22" }}
        >
          <Icon papicon size={22} fill="#fff"><Papicons name="Cross" /></Icon>
        </Pressable>
        <Typography variant="title" color="#fff" numberOfLines={1} style={{ flex: 1 }}>
          {entry.name}
        </Typography>
        <Pressable
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={t("Attachment_OpenWith")}
          onPress={() => file.preview({ title: entry.name })}
          style={{ padding: 8, borderRadius: 100, backgroundColor: "#ffffff22" }}
        >
          <Icon papicon size={22} fill="#fff"><Papicons name="ExternalLink" /></Icon>
        </Pressable>
      </View>
    </View>
  );
}
