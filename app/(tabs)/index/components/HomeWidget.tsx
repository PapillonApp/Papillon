import React from "react";
import Stack from '@/ui/components/Stack';
import Icon from '@/ui/components/Icon';
import { t } from 'i18next';
import Typography from '@/ui/components/Typography';
import { Papicons } from '@getpapillon/papicons';
import { Link } from 'expo-router';
import { useTheme } from "expo-router/react-navigation";
import { Platform } from "react-native";
import { LinearTransition } from "react-native-reanimated";
import { ErrorBoundary } from '@/ui/components/ErrorBoundary';
import { ListTouchable } from '@/ui/new/List';
import { Animation } from '@/ui/utils/Animation';
import { PapillonAppearIn, PapillonAppearOut } from '@/ui/utils/Transition';

export interface HomeWidgetItem {
  icon: React.ReactNode;
  title: string;
  redirect?: string;
  onPress?: () => void;
  buttonLabel?: string;
  render?: () => React.ReactNode;
  dev?: boolean;
  hidden?: boolean;
  onDismiss?: () => void;
}

interface HomeWidgetProps {
  item: HomeWidgetItem;
}

const HomeWidgetContent: React.FC<HomeWidgetProps> = ({ item }) => {
  const theme = useTheme();

  if (!item || (item.dev && !__DEV__) || item.hidden) {
    return null;
  }

  return (
    <Stack
      card
      radius={25}
      gap={0}
      entering={PapillonAppearIn}
      exiting={PapillonAppearOut}
      layout={Animation(LinearTransition, "list")}
      style={{ elevation: 2, flex: 1 }}
      backgroundColor={
        Platform.OS === "ios"
          ? theme.colors.card
          : theme.dark
            ? theme.colors.card
            : "#fff"
      }
    >
      <Stack
        direction="horizontal"
        vAlign="center"
        hAlign="center"
        padding={[10, 10]}
        gap={10}
        style={{ marginTop: -1 }}
      >
        <Icon papicon opacity={0.6} style={{ marginLeft: 4 }}>
          {item.icon}
        </Icon>
        <Typography
          nowrap
          style={{ flex: 1, opacity: 0.6 }}
          variant="title"
          color="text"
        >
          {item.title}
        </Typography>
        {item.onDismiss && (
          <ListTouchable hitSlop={10} onPress={item.onDismiss}>
            <Stack
              hAlign="center"
              vAlign="center"
              backgroundColor={theme.colors.text + "11"}
              radius={16}
              style={{ width: 32, height: 32 }}
            >
              <Icon size={16} papicon opacity={0.5}>
                <Papicons name="Cross" />
              </Icon>
            </Stack>
          </ListTouchable>
        )}
        {(item.redirect || item.onPress) && (
          <Stack
            bordered={Platform.OS === "ios"}
            backgroundColor={
              Platform.OS === "ios"
                ? theme.colors.card
                : theme.colors.text + "11"
            }
            radius={20}
            style={{
              overflow: Platform.OS === "android" ? "hidden" : "visible",
            }}
          >
            <Link asChild href={item.redirect ?? "/(features)/soon"}>
              <Link.AppleZoom>
                <ListTouchable>
                  <Stack
                    direction="horizontal"
                    hAlign="center"
                    padding={[12, 6]}
                    gap={6}
                  >
                    <Typography variant="body2" color="secondary" inline>
                      {t("Home_Display_More")}
                    </Typography>
                    <Icon size={20} papicon opacity={0.5}>
                      <Papicons name={"ArrowRightUp"} />
                    </Icon>
                  </Stack>
                </ListTouchable>
              </Link.AppleZoom>
            </Link>
          </Stack>
        )}
      </Stack>
      {item.render && item.render()}
    </Stack>
  );
};

const HomeWidget: React.FC<HomeWidgetProps> = React.memo((props) => (
  <ErrorBoundary fallback={null}>
    <HomeWidgetContent {...props} />
  </ErrorBoundary>
));

export default HomeWidget;
