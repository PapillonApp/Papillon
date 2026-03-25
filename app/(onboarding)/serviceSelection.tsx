import { Papicons } from "@getpapillon/papicons";
import { useHeaderHeight } from "@react-navigation/elements";
import { useRoute, useTheme } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Image, ScrollView, View } from "react-native";
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

export default function ServiceSelection() {
  const headerHeight = useHeaderHeight();
  const theme = useTheme();
  const { colors } = theme;
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { params } = useRoute();
  const { type } = params;

  const [selectedService, setSelectedService] = useState(null);

  const services = GetSupportedServices((path: { pathname: string, options?: UnknownInputParams }) => {
    router.push({
      pathname: path.pathname as unknown as RelativePathString,
      params: path.options ?? {} as unknown as UnknownInputParams
    });
  });

  const filteredServices = useMemo(() => {
    return services.filter((service) => service.type.includes(type));
  }, [services, type]);

  const titleString = useMemo(() => {
    switch (type) {
    case "univ":
      return "Quel service souhaites-tu utiliser ?";
    default:
      return "Quelle application utilises-tu habituellement ?";
    }
  }, [type]);


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

  if (!["school", "univ"].includes(type)) {
    return (
      <ScrollView
        contentContainerStyle={{
          padding: 20,
          flexGrow: 1,
          gap: 10,
          paddingTop: headerHeight + 32,
          paddingBottom: insets.bottom + 20
        }}
      >
        <Stack
          vAlign="center"
          hAlign="center"
          gap={8}
        >
          <Image
            source={require("@/assets/images/icon.png")}
            style={{ width: 86, height: 86, borderRadius: 24 }}
          />
          <Divider height={8} ghost />
          <Typography variant="h3" align="center">Papillon n'est pas encore disponible pour vous.</Typography>
          <Typography align="center" variant="body1" color="textSecondary">Les comptes parents et professeurs ne sont pas compatibles avec Papillon pour le moment.</Typography>
          <Divider height={16} ghost />
          <Button
            label="Retour"
            variant="secondary"
            onPress={() => {
              router.back();
            }}
            fullWidth
          />
        </Stack>
      </ScrollView>
    )
  }

  return (
    <View style={{ flex: 1 }}>
      <List
        ListHeaderComponent={() => (
          <Stack padding={[4, 0]}>
            <Typography variant="h2">{titleString}</Typography>
            <Typography variant="action" color="textSecondary">Sélectionne le service que tu as l’habitude d’utiliser dans ton établissement.</Typography>
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
          backgroundColor: colors.background
        }}
      >
        <Button
          label="Continuer"
          onPress={() => { loginToService(selectedService) }}
          disabled={!selectedService || !hasServiceRoute}
        />
      </View>
    </View>
  );
}