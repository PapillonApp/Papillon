import { Papicons } from "@getpapillon/papicons";
import { useTheme } from "expo-router/react-navigation";
import { t } from "i18next";
import React, { useEffect } from "react";
import { Pressable, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

import { FileThumbnail, FileTypeTile } from "@/components/Downloads";
import { Attachment, AttachmentType } from "@/services/shared/attachment";
import {
  cancelDownload,
  DownloadOrigin,
  downloadAttachment,
  formatBytes,
  getAttachmentId,
  getAttachmentKind,
  useDownloadsStore,
} from "@/stores/downloads";
import ActivityIndicator from "@/ui/components/ActivityIndicator";
import Icon from "@/ui/components/Icon";
import Typography from "@/ui/new/Typography";

interface AttachmentProps {
  attachment: Attachment;
  origin: DownloadOrigin;
}

const useAttachmentState = ({ attachment, origin }: AttachmentProps) => {
  const id = getAttachmentId(attachment, origin);
  return {
    id,
    progress: useDownloadsStore(state => state.progress[id]),
    failed: useDownloadsStore(state => state.failed[id]),
    file: useDownloadsStore(state => state.files[id]),
  };
};

const ProgressBar = ({ value }: { value: number }) => {
  const { colors } = useTheme();
  const width = useSharedValue(value);

  useEffect(() => {
    width.value = withTiming(value, { duration: 200 });
  }, [value]);

  const style = useAnimatedStyle(() => ({ width: `${Math.max(width.value, 0.03) * 100}%` }));

  return (
    <View style={{ height: 4, borderRadius: 2, backgroundColor: colors.text + "18", overflow: "hidden" }}>
      <Animated.View style={[{ height: "100%", borderRadius: 2, backgroundColor: colors.primary }, style]} />
    </View>
  );
};

/** Leading of an attachment row: link icon, image preview once downloaded, or the file type tile. */
export const AttachmentLeading = (props: AttachmentProps) => {
  const { attachment } = props;
  const { file } = useAttachmentState(props);
  if (attachment.type === AttachmentType.LINK) return <Icon><Papicons name="Link" /></Icon>;
  if (file) return <FileThumbnail file={file} size={36} />;
  return <FileTypeTile name={attachment.name} url={attachment.url} size={36} />;
};

/** Second line of an attachment row: progress while downloading, offline state, or the URL. */
export const AttachmentSubtitle = (props: AttachmentProps) => {
  const { attachment } = props;
  const { progress, failed, file } = useAttachmentState(props);

  if (progress !== undefined) {
    return (
      <View style={{ gap: 6, paddingTop: 4 }}>
        <Typography variant="body2" color="textSecondary">
          {t("Attachment_Downloading", { progress: progress >= 0 ? `${Math.round(progress * 100)} %` : "" })}
        </Typography>
        {progress >= 0 && <ProgressBar value={progress} />}
      </View>
    );
  }

  if (failed) {
    return <Typography variant="body1" color="#D60046" numberOfLines={1}>{t("Attachment_Failed")}</Typography>;
  }

  if (file) {
    return (
      <Typography variant="body1" color="textSecondary" numberOfLines={1}>
        {t("Attachment_Offline", { size: formatBytes(file.size) })}
      </Typography>
    );
  }

  return <Typography variant="body1" color="textSecondary" numberOfLines={1}>{attachment.url}</Typography>;
};

/** Trailing control: download, cancel, or a check once it's saved. Nothing for links. */
export const AttachmentAction = (props: AttachmentProps) => {
  const { attachment, origin } = props;
  const { colors } = useTheme();
  const { id, progress, failed, file } = useAttachmentState(props);

  if (!getAttachmentKind(attachment)) return null;

  if (progress !== undefined) {
    return (
      <Pressable
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel={t("Attachment_Cancel")}
        onPress={() => cancelDownload(id)}
        style={{ alignItems: "center", justifyContent: "center", width: 28, height: 28 }}
      >
        {progress < 0 && <ActivityIndicator size={28} />}
        <View style={{ position: "absolute" }}>
          <Icon papicon size={16} fill={colors.text + "88"}><Papicons name="Cross" /></Icon>
        </View>
      </Pressable>
    );
  }

  if (file) {
    return <Icon papicon size={22} fill={colors.primary}><Papicons name="Check" /></Icon>;
  }

  return (
    <Pressable
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel={t("Attachment_Download")}
      onPress={() => downloadAttachment(attachment, origin).catch(() => { })}
    >
      <Icon papicon size={22} fill={failed ? "#D60046" : colors.text + "88"}>
        <Papicons name={failed ? "AlertTriangle" : "ArrowDown"} />
      </Icon>
    </Pressable>
  );
};
