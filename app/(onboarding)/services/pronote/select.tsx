import { useHeaderHeight } from "@react-navigation/elements";
import { useRoute, useTheme } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import { geolocation } from "pawnote";
import React, { memo, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Image, KeyboardAvoidingView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ActivityIndicator from "@/ui/components/ActivityIndicator";
import { Dynamic } from "@/ui/components/Dynamic";
import Search from "@/ui/components/Search";
import Stack from "@/ui/components/Stack";
import Divider from "@/ui/new/Divider";
import List from "@/ui/new/List";
import Typography from "@/ui/new/Typography";


export interface School {
  name: string,
  distance: number,
  url: string
}

const PronoteSearchHeader = memo(({
  search,
  setSearch,
  loading,
  t
}: {
  search: string,
  setSearch: (text: string) => void,
  loading: boolean,
  t: (key: string, options?: any) => string
}) => (
  <Stack padding={[4, 0]}>
    <Typography variant="h2">{t("ONBOARDING_SELECT_SCHOOL")}</Typography>
    <Typography variant="action" color="textSecondary">{t("ONBOARDING_PRONOTE_LOCATION_HELP")}</Typography>
    <Divider height={6} ghost />
    <Search placeholder={t("ONBOARDING_SEARCH_SCHOOL_PLACEHOLDER")} style={{ width: "100%" }} value={search} setValue={setSearch} onTextChange={setSearch} />

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

export default function PronoteLoginSelectEtab() {
  const headerHeight = useHeaderHeight();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { t } = useTranslation();

  const { params } = useRoute();
  const { city } = params;

  const [search, setSearch] = useState<string>("");
  const [schools, setSchools] = useState<Array<School>>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if(!city) {return;}
    navigation.setOptions({ headerTitle: t("ONBOARDING_SCHOOLS_IN_CITY", { city: city.city }) });
    geolocation({ latitude: city?.latitude ?? 0, longitude: city?.longitude ?? 0 }).then((schoolsFound) => {
      setSchools(schoolsFound);
      setLoading(false);
    });
  }, [city, navigation, t]);

  const filteredSchools = schools.filter(school => school.name.toLowerCase().includes(search.toLowerCase()));

  const selectSchool = (school: School) => {
    navigation.navigate("browser", { url: school.url, school });
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" keyboardVerticalOffset={20}>
      <List
        animated
        ListHeaderComponent={<PronoteSearchHeader search={search} setSearch={setSearch} loading={loading} t={t} />}
        contentContainerStyle={{
          padding: 16,
          flexGrow: 1,
          gap: 10,
          paddingTop: headerHeight + 20,
          paddingBottom: insets.bottom + 20,
        }}
        style={{ flex: 1 }}
      >

        {filteredSchools.map((school, i) => (
          <List.Item animated={true} id={school.url} key={school.url} onPress={() => selectSchool(school)}>
            <List.Leading>
              <Image
                source={require("@/assets/images/service_pronote.png")}
                style={{ width: 32, height: 32, borderRadius: 8 }}
              />
            </List.Leading>
            <Typography variant="title" numberOfLines={2}>
              {school.name}
            </Typography>
            <Typography variant="body" color="textSecondary" numberOfLines={1}>
              {school.url}
            </Typography>
          </List.Item>
        ))}
      </List>
    </KeyboardAvoidingView>
  )
}
