import React, { useEffect, useState } from "react";
import { ScrollView, Switch } from "react-native";
import type { Screen } from "@/router/helpers/types";
import { useTheme } from "@react-navigation/native";
import { Newspaper } from "lucide-react-native";
import { useSharedValue, withTiming } from "react-native-reanimated";
import { NativeIcon, NativeItem, NativeList, NativeListHeader, NativeText } from "@/components/Global/NativeComponents";
import NotificationContainerCard from "@/components/Settings/NotificationContainerCard";
import { requestNotificationPermission } from "@/background/Notifications";
import { alertExpoGo, isExpoGo } from "@/utils/native/expoGoAlert";
import { useCurrentAccount } from "@/stores/account";
import { useAlert } from "@/providers/AlertProvider";

const SettingsNotifications: Screen<"SettingsNotifications"> = () => {
  const theme = useTheme();
  const { colors } = theme;

  // User data
  const account = useCurrentAccount(store => store.account!);
  const mutateProperty = useCurrentAccount(store => store.mutateProperty);
  const notifications = account.personalization.notifications;

  // Global state
  const [enabled, setEnabled] = useState(notifications?.enabled || false);
  const { showAlert } = useAlert();

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
    if (isExpoGo()) {
      alertExpoGo(showAlert);
      return;
    }

    requestNotificationPermission().then((result) => {
      console.log("Notification permission requested:", result);
    });


    // await mutateProperty("personalization", { notifications: { ...notifications, enabled: newValue } });
    // setEnabled(newValue);
  };

  // Schoolary notifications
  const notificationSchoolary = [
    // {
    //   icon: <NativeIcon icon={<CalendarCheck />} color={colors.primary} />,
    //   title: "Modification de cours",
    //   message: "Cours de mathématiques annulé dans 10 minutes",
    //   personalizationValue: "timeTable",
    // },
    // {
    //   icon: <NativeIcon icon={<BookCheck />} color={colors.primary} />,
    //   title: "Travail à faire pour demain",
    //   message: "N’oublie pas de terminer ton devoir de français pour demain",
    //   personalizationValue: "homework",
    // },
    // {
    //   icon: <NativeIcon icon={<TrendingUp />} color={colors.primary} />,
    //   title: "Nouvelle note",
    //   message: "Nouvelle note disponible : 18/20 en histoire",
    //   personalizationValue: "grades",
    // },
    {
      icon: <NativeIcon icon={<Newspaper />} color={colors.primary} />,
      title: "Nouvelle actualité",
      message: "Nouvelle actualité : \"Les élèves de 3ème partent en voyage scolaire\"",
      personalizationValue: "news",
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
      />

      {notifications?.enabled && (
        <>
          <NativeListHeader label={"Notifications scolaires"} />
          <NativeList>
            {notificationSchoolary.map((notification, index) => (
              <NativeItem
                key={index}
                leading={notification.icon}
                trailing={
                  <Switch
                    trackColor={{
                      false: colors.border,
                      true: colors.primary,
                    }}
                    value={account.personalization.notifications?.[notification.personalizationValue as keyof typeof notifications] ?? false}
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
    </ScrollView>
  );
};

export default SettingsNotifications;
