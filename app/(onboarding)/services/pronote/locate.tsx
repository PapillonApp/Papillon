import { Papicons } from "@getpapillon/papicons";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "expo-router";
import React, { memo, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { KeyboardAvoidingView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ActivityIndicator from "@/ui/components/ActivityIndicator";
import { Dynamic } from "@/ui/components/Dynamic";
import Icon from "@/ui/components/Icon";
import Search from "@/ui/components/Search";
import Stack from "@/ui/components/Stack";
import Divider from "@/ui/new/Divider";
import List from "@/ui/new/List";
import Typography from "@/ui/new/Typography";
import { GeographicSearchCities } from "@/utils/native/georeverse";


export interface School {
  name: string,
  distance: number,
  url: string
}

const PronoteSearchHeader = memo(({
  city,
  setCity,
  loading,
  showElse,
  t
}: {
  city: string,
  setCity: (text: string) => void,
  loading: boolean,
  showElse: boolean,
  t: (key: string, options?: any) => string
}) => (
  <Stack padding={[4, 0]}>
    <Typography variant="h2">{t("ONBOARDING_SEARCH_TITLE")}</Typography>
    <Typography variant="action" color="textSecondary">{t("ONBOARDING_PRONOTE_LOCATION_HELP")}</Typography>
    <Divider height={6} ghost />
    <Search placeholder={t("ONBOARDING_METHOD_SEARCH")} style={{ width: "100%" }} value={city} setValue={setCity} onTextChange={setCity} autoFocus={city.trim().length === 0} />
    
    {loading &&
      <Dynamic animated>
        <Stack vAlign="center" hAlign="center" width={"100%"} gap={2}>
          <Divider height={18} ghost />
          <ActivityIndicator />
          <Divider height={12} ghost />
          <Typography align="center" variant="h5">{t("ONBOARDING_SCHOOLS_SEARCHING")}</Typography>
          <Typography align="center" variant="body" color="textSecondary">{t("ONBOARDING_SCHOOLS_SEARCHING_HINT")}</Typography>
        </Stack>
      </Dynamic>
    }

    <Divider height={18} ghost />
  </Stack>
));

export default function PronoteLoginMethod() {
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { t } = useTranslation();

  const [city, setCity] = useState<string>("");
  const [debouncedCity, setDebouncedCity] = useState<string>("");
  const [cities, setCities] = useState<Array<School>>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedCity(city.trim());
    }, 350);

    return () => {
      clearTimeout(timeout);
    };
  }, [city]);

  useEffect(() => {
    if(!debouncedCity || debouncedCity.length < 3) {
      setCities([]);
      setLoading(false);
    } else {
      let canceled = false;

      setLoading(true);
      GeographicSearchCities(debouncedCity)
        .then((cities) => {
          if(canceled) {
            return;
          }
          setCities(cities.sort((a, b) => b.importance - a.importance).splice(0, 10));
        })
        .finally(() => {
          if(canceled) {
            return;
          }
          setLoading(false);
        });

      return () => {
        canceled = true;
      };
    }
  }, [debouncedCity]);

  const selectCity = (city: School) => {
    navigation.navigate(`select`, { city: city });
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" keyboardVerticalOffset={20}>
      <List
        ListHeaderComponent={<PronoteSearchHeader city={city} setCity={setCity} loading={loading && cities.length === 0} showElse={cities.length === 0 && !loading} t={t} />}
        contentContainerStyle={{
          padding: 16,
          flexGrow: 1,
          gap: 10,
          paddingTop: headerHeight + 20,
          paddingBottom: insets.bottom + 20,
        }}
        style={{ flex: 1 }}
        animated
      >
        {cities.length === 0 && !loading && (
          <List.Item animated onPress={() => navigation.navigate("qrcode")}>
            <List.Leading>
              <Icon><Papicons name="qrcode" /></Icon>
            </List.Leading>
            <Typography variant='title'>{t("ONBOARDING_PRONOTE_LOGIN_QRCODE")}</Typography>
            <Typography variant='body' color="textSecondary">
              {t("ONBOARDING_PRONOTE_LOGIN_QRCODE_DESCRIPTION")}
            </Typography>
          </List.Item>
        )}

        {cities.length === 0 && !loading && (
          <List.Item animated onPress={() => navigation.navigate("url")}>
            <List.Leading>
              <Icon><Papicons name="link" /></Icon>
            </List.Leading>
            <Typography variant='title'>{t("ONBOARDING_PRONOTE_LOGIN_URL")}</Typography>
          </List.Item>
        )}

        {cities.map((city, i) => (
          <List.Item animated={true} key={city.id} id={city.id} onPress={() => {selectCity(city)}}>
            <List.Leading>
              <Icon><Papicons name="mappin" /></Icon>
            </List.Leading>
            <Typography variant="title">{city.city}</Typography>
            <Typography variant="body1" color="textSecondary">
              {city.context}
            </Typography>
            <List.Trailing>
              <Typography variant="body1" color="textSecondary">
                {city.postalCode}
              </Typography>
            </List.Trailing>
          </List.Item>
        ))}
      </List>
    </KeyboardAvoidingView>
  )
}
