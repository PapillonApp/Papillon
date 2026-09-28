import { useTheme, useHeaderHeight } from "expo-router/react-navigation";
import { router } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { View, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { WHITE_LABEL_APPS } from "@studentsphere/linksign";
import Typography from '@/ui/new/Typography';
import Stack from '@/ui/components/Stack';
import { Papicons } from "@getpapillon/papicons";
import List from "@/ui/new/List";
import { Dynamic } from "@/ui/components/Dynamic";
import Icon from "@/ui/components/Icon";
import { PapillonZoomIn, PapillonZoomOut } from "@/ui/utils/Transition";
import adjust from "@/utils/adjustColor";
import Button from "@/ui/new/Button";
import Divider from "@/ui/new/Divider";

export const appLogos: Record<string, any> = {
  "edhec": require("@/assets/images/whitelabel-apps/edhec.jpg"),
  "ipparis": require("@/assets/images/whitelabel-apps/ipparis.jpg"),
  "ccihautdefrance": require("@/assets/images/whitelabel-apps/ccihautdefrance.jpg"),
  "mbs": require("@/assets/images/whitelabel-apps/mbs.jpg"),
  "campusdesmetierssaintnicolas": require("@/assets/images/whitelabel-apps/campusdesmetierssaintnicolas.jpg"),
  "epp": require("@/assets/images/whitelabel-apps/epp.jpg"),
  "icn": require("@/assets/images/whitelabel-apps/icn.jpg"),
};

export default function EdusignWhitelabel() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { colors } = theme;
  const { t } = useTranslation();
  const headerHeight = useHeaderHeight();

  const [selectedApp, setSelectedApp] = useState<string | null>(null);

  const handleContinue = () => {
    if (selectedApp) {
      const app = WHITE_LABEL_APPS.find(a => a.package === selectedApp);
      if (app) {
        router.push({
          pathname: "./whitelabel-schools",
          params: { appPackage: app.package, appName: app.appName }
        });
      }
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <List
        animated
        ListHeaderComponent={
          <Stack padding={[4, 0]}>
            <Typography variant="h2">{t("ONBOARDING_SCHOOL_APP")}</Typography>
            <Typography variant="action" color="textSecondary">
              {t("ONBOARDING_WHITELABEL_DESCRIPTION")}
            </Typography>
            <Divider height={18} ghost />
          </Stack>
        }
        contentContainerStyle={{
          padding: 16,
          flexGrow: 1,
          paddingTop: headerHeight + 20,
          paddingBottom: 20
        }}
        style={{ flex: 1 }}
      >
        {WHITE_LABEL_APPS.map((item) => (
          <List.Item
            animated
            key={item.package}
            onPress={() => setSelectedApp(item.package)}
            style={{
              backgroundColor: selectedApp === item.package ? adjust(colors.primary as string, theme.dark ? -0.8 : 0.9) : colors.card,
              minHeight: 62
            }}
          >
            <List.Leading>
              <Stack animated direction="horizontal" hAlign="center" gap={12}>
                {selectedApp === item.package && (
                  <Dynamic animated entering={PapillonZoomIn} exiting={PapillonZoomOut}>
                    <Icon fill={colors.primary as string}><Papicons name="check" /></Icon>
                  </Dynamic>
                )}
                <Dynamic animated>
                  {appLogos[item.id] ? (
                    <Image source={appLogos[item.id]} style={{ width: 32, height: 32, borderRadius: 10 }} />
                  ) : (
                    <View style={{
                      width: 32,
                      height: 32,
                      borderRadius: 10,
                      backgroundColor: (colors.primary as string) + "11",
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}>
                      <Icon fill={(selectedApp === item.package ? colors.primary : colors.text) as string} size={18}>
                        <Papicons name="Box" />
                      </Icon>
                    </View>
                  )}
                </Dynamic>
              </Stack>
            </List.Leading>
            <Dynamic animated><Typography variant="action">{item.appName}</Typography></Dynamic>
          </List.Item>
        ))}
      </List>

      <View
        style={{
          padding: 20,
          paddingBottom: insets.bottom + 20,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          backgroundColor: colors.background
        }}
      >
        <Button
          label={t("ONBOARDING_CONTINUE")}
          onPress={handleContinue}
          disabled={!selectedApp}
        />
      </View>
    </View>
  );
}
