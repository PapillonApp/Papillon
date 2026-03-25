import { Papicons } from "@getpapillon/papicons";
import { useHeaderHeight } from "@react-navigation/elements";
import { router, useNavigation } from "expo-router";
import React, { memo, useEffect, useState } from "react";
import { KeyboardAvoidingView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SearchSchools } from "skolengojs";

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
  city,
  setCity,
  loading,
  showElse
}: {
  city: string,
  setCity: (text: string) => void,
  loading: boolean,
  showElse: boolean
}) => (
  <Stack padding={[4, 0]}>
    <Typography variant="h2">Dans quelle ville se trouve ton établissement ?</Typography>
    <Typography variant="action" color="textSecondary">Pour vous connecter, nous avons besoin de l&apos;emplacement de ton établissement.</Typography>
    <Divider height={6} ghost />
    <Search placeholder="Rechercher une ville" style={{ width: "100%" }} value={city} setValue={setCity} onTextChange={setCity} autoFocus={city.trim().length === 0} />
    
    {loading &&
      <Dynamic animated>
        <Stack vAlign="center" hAlign="center" width={"100%"} gap={2}>
          <Divider height={18} ghost />
          <ActivityIndicator />
          <Divider height={12} ghost />
          <Typography align="center" variant="h5">Recherche des établissements...</Typography>
          <Typography align="center" variant="body" color="textSecondary">Cela peut prendre quelques secondes.</Typography>
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

  const [city, setCity] = useState<string>("");
  const [debouncedCity, setDebouncedCity] = useState<string>("");
  const [schools, setSchools] = useState<Array<School>>([]);
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
      setSchools([]);
      setLoading(false);
    } else {
      let canceled = false;

      setLoading(true);
      SearchSchools(debouncedCity, 50)
        .then((schools) => {
          if(canceled) {
            return;
          }
          console.log(schools);
          setSchools(schools);
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

  const selectSchool = (school: School) => {
    router.push(`/(onboarding)/services/skolengo/webview?ref=${JSON.stringify(school)}`);
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" keyboardVerticalOffset={20}>
      <List
        ListHeaderComponent={<PronoteSearchHeader city={city} setCity={setCity} loading={loading && schools.length === 0} showElse={schools.length === 0 && !loading} />}
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
        {schools.map((school, i) => (
          <List.Item animated={true} key={school.id} id={school.id} onPress={() => {selectSchool(school)}}>
            <List.Leading>
              <Icon><Papicons name="mappin" /></Icon>
            </List.Leading>
            <Typography variant="title">{school.name}</Typography>
            <Typography variant="body" color="textSecondary">
              {school.location.city} ({school.location.zipCode})
            </Typography>
          </List.Item>
        ))}
      </List>
    </KeyboardAvoidingView>
  )
}
