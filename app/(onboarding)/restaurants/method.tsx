import { Papicons } from "@getpapillon/papicons";
import { useHeaderHeight } from "@react-navigation/elements";
import { useRoute, useTheme } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Image, ScrollView, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Dynamic } from "@/ui/components/Dynamic";
import Icon from "@/ui/components/Icon";
import Stack from "@/ui/components/Stack";
import Button from "@/ui/new/Button";
import Divider from "@/ui/new/Divider";
import List from "@/ui/new/List";
import Typography from "@/ui/new/Typography";
import { PapillonZoomIn, PapillonZoomOut } from "@/ui/utils/Transition";
import adjust from "@/utils/adjustColor";

import { GetSupportedServices } from './utils/constants';
import { GetSupportedRestaurants } from "../utils/constants";

export default function ServiceSelection() {
  const headerHeight = useHeaderHeight();
  const theme = useTheme();
  const { colors } = theme;
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useTranslation();

  const { params } = useRoute();
  const { type } = params;

  const [selectedService, setSelectedService] = useState(null);

  const services = GetSupportedRestaurants((path: { pathname: string }) => {
    router.push({
      pathname: path.pathname as unknown as RelativePathString,
      params: path.options ?? {} as unknown as UnknownInputParams
    });
  });

  const filteredServices = services;

  const titleString = t("ONBOARDING_RESTAURANT_SELECTION_TITLE");

  const hasServiceRoute = services.find(service => service.name === selectedService)?.route || services.find(service => service.name === selectedService)?.onPress;

  const loginToService = (serviceName: string) => {
    const serviceRoute = services.find(service => service.name === serviceName)?.route;
    if(!serviceRoute) {
      services.find(service => service.name === serviceName)?.onPress();
      return;
    }
    const newRoute = './services/' + serviceRoute;
    router.push(newRoute);
  };

  return (
    <View style={{ flex: 1 }}>
      <List
        ListHeaderComponent={() => (
          <Stack padding={[4, 0]}>
            <Typography variant="h2">{titleString}</Typography>
            <Typography variant="action" color="textSecondary">{t("ONBOARDING_SERVICE_SELECTION_DESCRIPTION")}</Typography>
            <Divider height={18} ghost />
          </Stack>
        )}
        contentContainerStyle={{
          padding: 16,
          flexGrow: 1,
          gap: 10,
          paddingTop: headerHeight + 20
        }}
        style={{ flex: 1 }}
      >
        {filteredServices.map((app) => (
          <List.Item key={app.name} onPress={() => setSelectedService(app.name)} style={{
            backgroundColor: selectedService === app.name ? adjust(colors.primary, theme.dark ? -0.8 : 0.9) : colors.card,
            minHeight: 62
          }}>
            <List.Leading>
              <Stack animated direction="horizontal" hAlign="center" gap={12}>
                {selectedService === app.name && <Dynamic animated entering={PapillonZoomIn} exiting={PapillonZoomOut}><Icon fill={colors.primary}><Papicons name="check" /></Icon></Dynamic>}

                <Dynamic animated>
                  <Image source={app.image} style={{ width: 32, height: 32, borderRadius: 10 }} />
                </Dynamic>
              </Stack>
            </List.Leading>
            <Dynamic animated><Typography variant="action">{app.title}</Typography></Dynamic>
          </List.Item>
        ))}
      </List>

      <View
        style={{
          padding: 20,
          paddingBottom: insets.bottom + 20,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          backgroundColor: colors.background,
          flexDirection: "column",
          gap: 8
        }}
      >
        <Button
          label={t("ONBOARDING_CONTINUE")}
          onPress={() => { loginToService(selectedService) }}
          disabled={!selectedService || !hasServiceRoute}
        />
        <Button
          label={t("ONBOARDING_CANCEL")}
          onPress={() => { router.back() }}
          variant="secondary"
        />
      </View>
    </View>
  );
}
