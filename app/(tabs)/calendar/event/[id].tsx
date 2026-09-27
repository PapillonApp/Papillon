import { Papicons } from "@getpapillon/papicons";
import { useTheme } from "expo-router/react-navigation";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { MoreVertical } from "lucide-react-native";
import { useEffect, useLayoutEffect, useState } from "react";
import React, { Fragment } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { formatDistanceStrict, formatDistanceToNow } from "date-fns";
import * as DateLocale from "date-fns/locale";
import i18n, { t } from "i18next";
import LinearGradient from "react-native-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ModalOverhead from "@/components/ModalOverhead";
import { useDatabase } from "@/database/DatabaseProvider";
import { getCourseById } from "@/database/useTimetable";
import { useEventById } from "@/database/useEventsById";
import { openAttachment, resolvePronoteFileAuth } from "@/services/pronote/files";
import { Course as SharedCourse, CourseStatus } from "@/services/shared/timetable";
import ActionMenu from "@/ui/components/ActionMenu";
import ActivityIndicator from "@/ui/components/ActivityIndicator";
import ConfirmModal from "@/ui/components/ConfirmModal";
import Icon from "@/ui/components/Icon";
import { NativeHeaderPressable, NativeHeaderSide } from "@/ui/components/NativeHeader";
import { useAlert } from "@/ui/components/AlertProvider";
import List from "@/ui/new/List";
import Typography from "@/ui/new/Typography";
import { getAttachmentIcon } from "@/utils/news/getAttachmentIcon";
import { getSubjectColor } from "@/utils/subjects/colors";
import { getSubjectEmoji } from "@/utils/subjects/emoji";
import { getSubjectName } from "@/utils/subjects/name";
import { warn } from "@/utils/logger/logger";
import { getStatusText } from "../components/CalendarDay";
import * as WebBrowser from "expo-web-browser";

export default function EventDetailsScreen() {
  const { id, title } = useLocalSearchParams();
  const database = useDatabase();
  const router = useRouter();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const eventId = Array.isArray(id) ? id[0] : id;
  const event = useEventById(eventId);
  const alert = useAlert();
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [course, setCourse] = useState<SharedCourse | null>(null);
  const [courseChecked, setCourseChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setCourseChecked(false);
    setCourse(null);
    if (!eventId) {
      setCourseChecked(true);
      return () => {
        cancelled = true;
      };
    }
    getCourseById(eventId)
      .then(result => {
        if (!cancelled) {
          setCourse(result ?? null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCourse(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setCourseChecked(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  const headerTitle = course
    ? getSubjectName(course.subject)
    : event
      ? event.title
      : typeof title === "string"
        ? title
        : t("Event_EventDetails");

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle,
    });
  }, [headerTitle, navigation]);

  const handleDelete = (): void => {
    setDeleteVisible(true);
  };

  const confirmDelete = (): void => {
    void (async () => {
      setDeleting(true);
      try {
        await database.write(async () => {
          const eventToDelete = await database.get("events").find(eventId as string);
          await eventToDelete.destroyPermanently();
        });
        setDeleteVisible(false);
        router.back();
      } catch (err) {
        warn(`Error deleting event: ${String(err)}`);
        setDeleteVisible(false);
        alert.showAlert({
          title: "Erreur",
          description: "Une erreur est survenue lors de la suppression de l'événement.",
          icon: "AlertTriangle",
          color: "#E05D34",
        });
      } finally {
        setDeleting(false);
      }
    })();
  };

  if (!courseChecked) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator />
      </View>
    );
  }

  if (course) {
    return (
      <CourseSheet
        course={course}
        topInset={Platform.select({ android: insets.top + 32, default: 0 })}
      />
    );
  }

  if (!event) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background, padding: 16 }]}>
        <Icon opacity={0.5} size={32} style={{ marginBottom: 3 }}>
          <Papicons name="Ghost" />
        </Icon>
        <Typography variant="h4" align="center">
          {t("Event_NotFound_Title")}
        </Typography>
        <Typography variant="body2" color="textSecondary" align="center">
          {t("Event_NotFound_Description")}
        </Typography>
      </View>
    );
  }

  const start = new Date(event.start);
  const end = new Date(event.end);
  const eventColor: string = typeof event.color === "string" && event.color ? event.color : String(colors.primary);

  return (
    <>
      <NativeHeaderSide side="Right">
        <ActionMenu
          actions={[
            {
              id: "delete",
              title: t("Event_DeleteEvent"),
              attributes: {
                destructive: true,
              },
              imageColor: "#ff0000",
              image: Platform.select({
                ios: "trash",
                android: "ic_menu_delete",
              }),
            },
          ]}
          onPressAction={({ nativeEvent }) => {
            if (nativeEvent.event === "delete") {
              handleDelete();
            }
          }}
        >
          <NativeHeaderPressable>
            <MoreVertical color={colors.text} />
          </NativeHeaderPressable>
        </ActionMenu>
      </NativeHeaderSide>

      <List
        contentContainerStyle={styles.listContent}
        style={{ backgroundColor: colors.background }}
      >
        <List.View>
          <ModalOverhead
            subject={event.title}
            title={event.status || undefined}
            color={eventColor}
            emoji=""
            subjectVariant="h3"
            date={start}
            dateFormat={{
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "numeric",
              minute: "numeric",
            }}
            style={{ marginBottom: 24, marginTop: 24 }}
          />
        </List.View>

        {event.canceled ? (
          <List.Section>
            <List.Item>
              <List.Leading>
                <Icon>
                  <Papicons name="Info" />
                </Icon>
              </List.Leading>
              <Typography variant="title">
                {t("Canceled_Course")}
              </Typography>
            </List.Item>
          </List.Section>
        ) : null}

        <List.Section>
          <List.SectionTitle>
            <List.Label>{t("Modal_Course_Time")}</List.Label>
          </List.SectionTitle>

          <List.Item>
            <List.Leading>
              <Icon>
                <Papicons name="Logout" />
              </Icon>
            </List.Leading>
            <Typography variant="title">{t("Modal_Course_Start")}</Typography>
            <Typography variant="body1" color="textSecondary">
              {formatDistanceToNow(start, {
                locale: DateLocale[i18n.language as keyof typeof DateLocale] || DateLocale.enUS,
                addSuffix: true,
              })}
            </Typography>
            <List.Trailing>
              <Typography variant="title">
                {start.toLocaleString(undefined, { hour: "numeric", minute: "numeric" })}
              </Typography>
            </List.Trailing>
          </List.Item>

          <List.Item>
            <List.Leading>
              <Icon>
                <Papicons name="Login" />
              </Icon>
            </List.Leading>
            <Typography variant="title">{t("Modal_Course_End")}</Typography>
            <List.Trailing>
              <Typography variant="title">
                {end.toLocaleString(undefined, { hour: "numeric", minute: "numeric" })}
              </Typography>
            </List.Trailing>
          </List.Item>
        </List.Section>

        <List.Section>
          <List.SectionTitle>
            <List.Label>{t("Modal_Course_Details")}</List.Label>
          </List.SectionTitle>

          {event.teacher ? (
            <List.Item>
              <List.Leading>
                <Icon>
                  <Papicons name="User" />
                </Icon>
              </List.Leading>
              <Typography variant="title">{t("Modal_Course_Teacher")}</Typography>
              <Typography variant="body1" color="textSecondary">
                {event.teacher}
              </Typography>
            </List.Item>
          ) : null}

          <List.Item>
            <List.Leading>
              <Icon>
                <Papicons name="MapPin" />
              </Icon>
            </List.Leading>
            <Typography variant="title">{t("Modal_Course_Room")}</Typography>
            <Typography variant="body1" color="textSecondary">
              {event.room || t("No_Course_Room")}
            </Typography>
          </List.Item>

          <List.Item>
            <List.Leading>
              <Icon>
                <Papicons name="Clock" />
              </Icon>
            </List.Leading>
            <Typography variant="title">{t("Modal_Course_Duration")}</Typography>
            <Typography variant="body1" color="textSecondary">
              {formatDistanceStrict(start, end, {
                locale: DateLocale[i18n.language as keyof typeof DateLocale] || DateLocale.enUS,
              })}
            </Typography>
          </List.Item>
        </List.Section>
      </List>
      <ConfirmModal
        visible={deleteVisible}
        title={t("Event_DeleteEvent")}
        description={t("Event_Confirm_DeleteEvent")}
        icon="Trash"
        destructive
        confirmLabel={t("Event_DeleteEvent")}
        cancelLabel={t("Context_Cancel")}
        loading={deleting}
        onConfirm={confirmDelete}
        onClose={() => !deleting && setDeleteVisible(false)}
      />
    </>
  );
}

const CourseSheet: React.FC<{ course: SharedCourse; topInset: number }> = ({ course, topInset }) => {
  const { colors } = useTheme();
  const alert = useAlert();
  const [downloadingName, setDownloadingName] = useState<string | null>(null);
  const subjectColor = getSubjectColor(course.subject);
  const subjectEmoji = getSubjectEmoji(course.subject);
  const fromMs = course.from instanceof Date ? course.from.getTime() : new Date(course.from as any).getTime();
  const toMs = course.to instanceof Date ? course.to.getTime() : new Date(course.to as any).getTime();
  const validDates = Number.isFinite(fromMs) && Number.isFinite(toMs);
  const startTime = validDates ? Math.floor(fromMs / 1000) : NaN;
  const endTime = validDates ? Math.floor(toMs / 1000) : NaN;
  const isCanceled = course.status === CourseStatus.CANCELED;
  const safeDistanceToNow = (ms: number) => {
    try {
      if (!Number.isFinite(ms)) return "—";
      return formatDistanceToNow(ms, {
        locale: DateLocale[i18n.language as keyof typeof DateLocale] || DateLocale.enUS,
        addSuffix: true,
      });
    } catch {
      return "—";
    }
  };
  const safeDistanceStrict = (a: number, b: number) => {
    try {
      if (!Number.isFinite(a) || !Number.isFinite(b)) return "—";
      return formatDistanceStrict(a, b, {
        locale: DateLocale[i18n.language as keyof typeof DateLocale] || DateLocale.enUS,
      });
    } catch {
      return "—";
    }
  };

  const flags: Array<{ label: string; color: string }> = [];
  if (course.detention) flags.push({ label: t("Course_Flag_Detention", "Retenue"), color: "#B91C1C" });
  if (course.outing) flags.push({ label: t("Course_Flag_Outing", "Sortie"), color: "#15803D" });
  if (course.isTest) flags.push({ label: t("Course_Flag_Test", "Contrôle"), color: "#7C3AED" });
  const virtualUrls = Array.isArray(course.virtualClassrooms)
    ? course.virtualClassrooms.filter(u => typeof u === "string" && u.trim().length > 0)
    : [];
  const virtualUrl = virtualUrls[0] ?? (typeof course.url === "string" && course.url.startsWith("http") ? course.url : null);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {Platform.OS !== "android" && (
        <LinearGradient
          colors={[subjectColor, `${subjectColor}00`]}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 500,
            width: "100%",
            zIndex: 0,
            opacity: 0.6,
          }}
        />
      )}

      <List
        ListHeaderComponent={
          <ModalOverhead
            subject={getSubjectName(course.subject)}
            title={course.customStatus || getStatusText(course.status)}
            color={Platform.OS === "ios" ? subjectColor : String(colors.primary)}
            emoji={subjectEmoji}
            subjectVariant="h3"
            date={new Date(startTime * 1000)}
            dateFormat={{
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "numeric",
              minute: "numeric",
            }}
            style={{
              marginBottom: 24,
              marginTop: 24,
              paddingTop: topInset,
            }}
          />
        }
        style={{ backgroundColor: "transparent", zIndex: 2 }}
        contentContainerStyle={{ padding: 16 }}
      >
        {flags.length > 0 && (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
            {flags.map(f => (
              <View key={f.label} style={{ backgroundColor: f.color + "1A", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 }}>
                <Typography variant="caption" weight="bold" style={{ color: f.color }}>
                  {f.label}
                </Typography>
              </View>
            ))}
          </View>
        )}
        {(getStatusText(course.status) || isCanceled) && (
          <List.Section>
            <List.Item>
              <List.Leading>
                <Icon>
                  <Papicons name="Info" />
                </Icon>
              </List.Leading>
              <Typography variant="title">
                {course.customStatus || getStatusText(course.status) || t("Canceled_Course")}
              </Typography>
            </List.Item>
          </List.Section>
        )}

        <List.Section>
          <List.SectionTitle>
            <List.Label>{t("Modal_Course_Time")}</List.Label>
          </List.SectionTitle>

          <List.Item>
            <List.Leading>
              <Icon>
                <Papicons name="Logout" />
              </Icon>
            </List.Leading>
            <Typography variant="title">{t("Modal_Course_Start")}</Typography>
            <Typography variant="body1" color="textSecondary">
              {safeDistanceToNow(startTime * 1000)}
            </Typography>
            <List.Trailing>
              <Typography variant="title">
                {new Date(startTime * 1000).toLocaleString(undefined, {
                  hour: "numeric",
                  minute: "numeric",
                })}
              </Typography>
            </List.Trailing>
          </List.Item>

          <List.Item>
            <List.Leading>
              <Icon>
                <Papicons name="Login" />
              </Icon>
            </List.Leading>
            <Typography variant="title">{t("Modal_Course_End")}</Typography>
            <List.Trailing>
              <Typography variant="title">
                {new Date(endTime * 1000).toLocaleString(undefined, {
                  hour: "numeric",
                  minute: "numeric",
                })}
              </Typography>
            </List.Trailing>
          </List.Item>
        </List.Section>

        <List.Section>
          <List.SectionTitle>
            <List.Label>{t("Modal_Course_Details")}</List.Label>
          </List.SectionTitle>

          {course.teacher ? (
            <List.Item>
              <List.Leading>
                <Icon>
                  <Papicons name="User" />
                </Icon>
              </List.Leading>
              <Typography variant="title">{t("Modal_Course_Teacher")}</Typography>
              <Typography variant="body1" color="textSecondary">
                {course.teacher}
              </Typography>
            </List.Item>
          ) : null}

          <List.Item>
            <List.Leading>
              <Icon>
                <Papicons name="MapPin" />
              </Icon>
            </List.Leading>
            <Typography variant="title">{t("Modal_Course_Room")}</Typography>
            <Typography variant="body1" color="textSecondary">
              {course.room || t("No_Course_Room")}
            </Typography>
          </List.Item>

          <List.Item>
            <List.Leading>
              <Icon>
                <Papicons name="Clock" />
              </Icon>
            </List.Leading>
            <Typography variant="title">{t("Modal_Course_Duration")}</Typography>
            <Typography variant="body1" color="textSecondary">
              {safeDistanceStrict(startTime * 1000, endTime * 1000)}
            </Typography>
          </List.Item>

          {course.additionalInfo ? (
            <List.Item>
              <List.Leading>
                <Icon>
                  <Papicons name="Info" />
                </Icon>
              </List.Leading>
              <Typography variant="body1" color="textSecondary">
                {course.additionalInfo}
              </Typography>
            </List.Item>
          ) : null}

          {course.exempted ? (
            <List.Item>
              <List.Leading>
                <Icon>
                  <Papicons name="Info" />
                </Icon>
              </List.Leading>
              <Typography variant="body1" color="textSecondary">
                {t("Course_Exempted_Note", "Dispensé de ce cours")}
              </Typography>
            </List.Item>
          ) : null}

          {virtualUrl ? (
            <List.Item
              onPress={() => {
                void WebBrowser.openBrowserAsync(virtualUrl);
              }}
            >
              <List.Leading>
                <Icon>
                  <Papicons name="link" />
                </Icon>
              </List.Leading>
              <Typography variant="title">
                {t("Course_Virtual_Classroom", "Classe virtuelle")}
              </Typography>
              <Typography variant="body1" color="textSecondary" numberOfLines={1}>
                {t("Course_Virtual_Join", "Rejoindre")}
              </Typography>
            </List.Item>
          ) : null}
        </List.Section>

        {Array.isArray(course.content) && course.content.length > 0 && (
          <List.Section>
            <List.SectionTitle>
              <List.Label>{t("Event_Content_Title")}</List.Label>
            </List.SectionTitle>

            {course.content.map((item, index) => (
              <Fragment key={`${item.title ?? ""}-${index}`}>
                {(item.title || item.description) && (
                  <List.Item>
                    <List.Leading>
                      <Icon>
                        <Papicons name="Info" />
                      </Icon>
                    </List.Leading>
                    {!!item.title && (
                      <Typography variant="title" numberOfLines={2}>
                        {item.title}
                      </Typography>
                    )}
                    {!!item.description && (
                      <Typography variant="body1" color="textSecondary" numberOfLines={4}>
                        {item.description.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()}
                      </Typography>
                    )}
                  </List.Item>
                )}
                {(item.attachments ?? []).map((attachment, attachmentIndex) => {
                  const key = `${attachment.name}-${attachmentIndex}`;
                  const isDownloading = downloadingName === key;
                  return (
                    <List.Item
                      key={key}
                      onPress={() => {
                        if (isDownloading) return;
                        setDownloadingName(key);
                        void openAttachment(
                          attachment,
                          resolvePronoteFileAuth(attachment.createdByAccount),
                          alert,
                          course?.from
                        ).finally(() => setDownloadingName(null));
                      }}
                    >
                      <List.Leading>
                        <Icon>
                          <Papicons name={getAttachmentIcon(attachment)} />
                        </Icon>
                      </List.Leading>
                      <Typography variant="title" numberOfLines={2}>
                        {attachment.name}
                      </Typography>
                      {isDownloading ? (
                        <List.Trailing>
                          <ActivityIndicator size={20} />
                        </List.Trailing>
                      ) : (
                        <Typography variant="body1" color="textSecondary" numberOfLines={1}>
                          {attachment.url ? "Ouvrir" : "Indisponible"}
                        </Typography>
                      )}
                    </List.Item>
                  );
                })}
              </Fragment>
            ))}
          </List.Section>
        )}
      </List>
    </View>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    padding: 16,
  },
});
