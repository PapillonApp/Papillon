import React, { useEffect, useState } from "react";
import { ScrollView, Switch } from "react-native";
import type { Screen } from "@/router/helpers/types";
import { useTheme } from "@react-navigation/native";
import {
  CalendarCheck,
  BookCheck,
  TrendingUp,
  Newspaper,
  NotepadText,
  BookPlus,
} from "lucide-react-native";
import {
  FadeInDown,
  FadeOutUp,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import {
  NativeIcon,
  NativeItem,
  NativeList,
  NativeListHeader,
  NativeText,
} from "@/components/Global/NativeComponents";
import NotificationContainerCard from "@/components/Settings/NotificationContainerCard";
import {
  createChannelNotification,
  requestNotificationPermission,
} from "@/background/Notifications";
import { useCurrentAccount } from "@/stores/account";
import InsetsBottomView from "@/components/Global/InsetsBottomView";
import { anim2Papillon } from "@/utils/ui/animations";
import { useAlert } from "@/providers/AlertProvider";

const SettingsNotifications: Screen<"SettingsNotifications"> = ({
  navigation,
}) => {
  const theme = useTheme();
  const { colors } = theme;
  const { showAlert } = useAlert();

  // User data
  const account = useCurrentAccount((store) => store.account!);
  const mutateProperty = useCurrentAccount((store) => store.mutateProperty);
  const notifications = account.personalization.notifications;

  // Global state
  const [enabled, setEnabled] = useState<boolean | null | undefined>(
    notifications?.enabled ?? false
  );

  useEffect(() => {
    const handleNotificationPermission = async () => {
      const statut = await requestNotificationPermission(showAlert);
      if (!statut) {
        if (statut === undefined) {
          setEnabled(undefined);
        } else {
          setEnabled(null);
        }

        if (notifications?.enabled) {
          setTimeout(() => {
            mutateProperty("personalization", {
              notifications: { ...notifications, enabled: false },
            });
          }, 1500);
        }
      } else if (enabled !== null) {
        if (enabled) createChannelNotification();
        setTimeout(() => {
          mutateProperty("personalization", {
            notifications: { ...notifications, enabled },
          });
        }, 1500);
      }
    };

    handleNotificationPermission();
  }, [enabled]);

  // Animation states
  const opacity = useSharedValue(0);
  const invertedOpacity = useSharedValue(1);
  const borderRadius = useSharedValue(20);
  const width = useSharedValue("90%");
  const marginBottom = useSharedValue(0);

  // Animation effects
  useEffect(() => {
    opacity.value = withTiming(enabled ? 1 : 0, { duration: 200 });
    invertedOpacity.value = withTiming(enabled ? 0 : 1, { duration: 200 });
    borderRadius.value = withTiming(enabled ? 20 : 13, { duration: 200 });
    width.value = withTiming(enabled ? "90%" : "80%", { duration: 300 });
    marginBottom.value = withTiming(enabled ? 0 : -10, { duration: 200 });
  }, [enabled]);

  const askEnabled = async (newValue: boolean) => {
    setEnabled(newValue);
  };

  // Schoolary notifications
  const notificationSchoolary = [
    {
      icon: <NativeIcon icon={<CalendarCheck />} color={colors.primary} />,
      title: "Changement de cours",
      message: "Musique (10:00-11:00) : Prof. absent",
      personalizationValue: "timetable",
    },
    {
      icon: <NativeIcon icon={<BookCheck />} color={colors.primary} />,
      title: "Nouveau devoir",
      message: "Un nouveau devoir en Mathématiques a été publié",
      personalizationValue: "homeworks",
    },
    {
      icon: <NativeIcon icon={<TrendingUp />} color={colors.primary} />,
      title: "Nouvelle note",
      message: "Une nouvelle note en Anglais a été publiée",
      personalizationValue: "grades",
    },
    {
      icon: <NativeIcon icon={<Newspaper />} color={colors.primary} />,
      title: "Nouvelle actualité",
      message:
        "Chers élèves, chers collègues, Dans le cadre du prix \"Non au harcèlement\", 9 affiches ont été réa...",
      personalizationValue: "news",
    },
    {
      icon: <NativeIcon icon={<NotepadText />} color={colors.primary} />,
      title: "Vie Scolaire",
      message: "Tu as été en retard de 5 min à 11:10",
      personalizationValue: "attendance",
    },
    {
      icon: <NativeIcon icon={<BookPlus />} color={colors.primary} />,
      title: "Nouvelle compétence",
      message: "Une nouvelle compétence en Histoire a été publiée",
      personalizationValue: "evaluation",
    },
  ];

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 16,
        paddingTop: 0,
      }}
    >
      <NotificationContainerCard
        theme={theme}
        isEnable={enabled}
        setEnabled={askEnabled}
        navigation={navigation}
      />

      {enabled && (
        <>
          <NativeListHeader
            label="Notifications scolaires"
            animated
            entering={anim2Papillon(FadeInDown).delay(50)}
            exiting={anim2Papillon(FadeOutUp)}
          />
          <NativeList
            animated
            entering={anim2Papillon(FadeInDown)}
            exiting={anim2Papillon(FadeOutUp).delay(50)}
          >
            {notificationSchoolary.map((notification, index) => (
              <NativeItem
                key={index}
                leading={notification.icon}
                animated
                entering={anim2Papillon(FadeInDown).delay(70 * index)}
                trailing={
                  <Switch
                    trackColor={{
                      false: colors.border,
                      true: colors.primary,
                    }}
                    value={
                      account.personalization.notifications?.[
                        notification.personalizationValue as keyof typeof notifications
                      ] ?? false
                    }
                    onValueChange={(value) => {
                      mutateProperty("personalization", {
                        notifications: {
                          ...notifications,
                          [notification.personalizationValue]: value,
                        },
                      });
                    }}
                    style={{
                      marginRight: 10,
                    }}
                  />
                }
              >
                <NativeText variant="title">{notification.title}</NativeText>
                <NativeText
                  style={{
                    color: colors.text + "80",
                  }}
                >
                  {notification.message}
                </NativeText>
              </NativeItem>
            ))}
          </NativeList>
        </>
      )}

      <InsetsBottomView />
    </ScrollView>
  );
};

export default SettingsNotifications;
