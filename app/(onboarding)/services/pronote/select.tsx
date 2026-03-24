import { Papicons } from "@getpapillon/papicons";
import { useHeaderHeight } from "@react-navigation/elements";
import { useRoute, useTheme } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import { geolocation } from "pawnote";
import React, { memo, useEffect, useState } from "react";
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


export interface School {
  name: string,
  distance: number,
  url: string
}

const PronoteSearchHeader = memo(({
  search,
  setSearch,
  loading
}: {
  search: string,
  setSearch: (text: string) => void,
  loading: boolean
}) => (
  <Stack padding={[4, 0]}>
    <Typography variant="h2">Quel est votre établissement ?</Typography>
    <Typography variant="action" color="textSecondary">Pour vous connecter, nous avons besoin de l'emplacement de votre établissement.</Typography>
    <Divider height={6} ghost />
    <Search placeholder="Rechercher un établissement" style={{ width: "100%" }} value={search} setValue={setSearch} onTextChange={setSearch} />

    {loading &&
      <Dynamic animated>
        <Stack vAlign="center" hAlign="center" width={"100%"} gap={2}>
          <Divider height={18} ghost />
          <ActivityIndicator />
          <Divider height={12} ghost />
          <Typography variant="h5">Recherche des établissements...</Typography>
          <Typography variant="body" color="textSecondary">Cela peut prendre quelques secondes.</Typography>
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

  const { params } = useRoute();
  const { city } = params;

  const [search, setSearch] = useState<string>("");
  const [schools, setSchools] = useState<Array<School>>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if(!city) {return;}
    navigation.setOptions({ headerTitle: "Établissements à " + city.city });
    geolocation({ latitude: city?.latitude ?? 0, longitude: city?.longitude ?? 0 }).then((schoolsFound) => {
      setSchools(schoolsFound);
      setLoading(false);
    });
  });

  const filteredSchools = schools.filter(school => school.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" keyboardVerticalOffset={20}>
      <List
        ListHeaderComponent={<PronoteSearchHeader search={search} setSearch={setSearch} loading={loading} />}
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
          <List.Item key={i} onPress={() => {}}>
            <List.Leading>
              <Icon><Papicons name="mappin" /></Icon>
            </List.Leading>
            <Typography variant="action">{school.name}</Typography>
          </List.Item>
        ))}
      </List>
    </KeyboardAvoidingView>
  )
}
