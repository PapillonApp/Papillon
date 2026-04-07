import { Papicons } from "@getpapillon/papicons";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "expo-router";
import React, { memo, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { KeyboardAvoidingView, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ActivityIndicator from "@/ui/components/ActivityIndicator";
import { Dynamic } from "@/ui/components/Dynamic";
import Icon from "@/ui/components/Icon";
import Search from "@/ui/components/Search";
import Stack from "@/ui/components/Stack";
import Divider from "@/ui/new/Divider";
import List from "@/ui/new/List";
import Typography from "@/ui/new/Typography";
import { School, SchoolsClient } from "webuntis-client";

const client = new SchoolsClient();

const WebUntisSearchHeader = memo(({ school, setSchool, loading, t }: {
  school: string,
  setSchool: (text: string) => void,
  loading: boolean,
  t: (key: string, options?: any) => string
}) => (
  <Stack padding={[4, 0]}>
    <Typography variant="h2">{t("ONBOARDING_WEBUNTIS_SEARCH_TITLE")}</Typography>
    <Typography variant="action" color="textSecondary">{t("ONBOARDING_PRONOTE_LOCATION_HELP")}</Typography>

    <Divider height={6} ghost/>

    <Search placeholder={t("ONBOARDING_METHOD_SEARCH")} style={{ width: "100%" }} value={school}
            setValue={setSchool} onTextChange={setSchool} autoFocus={school.trim().length === 0}/>

    {loading &&
        <Dynamic animated>
            <Stack vAlign="center" hAlign="center" width={"100%"} gap={2}>
                <Divider height={18} ghost/>
                <ActivityIndicator/>
                <Divider height={12} ghost/>
                <Typography align="center" variant="h5">{t("ONBOARDING_SCHOOLS_SEARCHING")}</Typography>
                <Typography align="center" variant="body"
                            color="textSecondary">{t("ONBOARDING_SCHOOLS_SEARCHING_HINT")}</Typography>
            </Stack>
        </Dynamic>
    }

    <Divider height={18} ghost/>
  </Stack>
));

export default function WebUntisLoginLocate() {
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { t } = useTranslation();

  const [school, setSchool] = useState("");
  const [debouncedSchool, setDebouncedSchool] = useState("");
  const [schools, setSchools] = useState<Array<School>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSchool(school.trim());
    }, 350);

    return () => {
      clearTimeout(timeout);
    };
  }, [school]);

  useEffect(() => {
    if ( !debouncedSchool || debouncedSchool.length < 3 ) {
      setSchools([]);
      setLoading(false);

    } else {
      let canceled = false;

      setLoading(true);

      client.search(debouncedSchool)
        .then((results) => {
          if ( canceled ) return;
          setSchools(results.slice(0, 10));
        })
        .finally(() => {
          if ( canceled ) return;
          setLoading(false);
        });

      return () => {
        canceled = true;
      }
    }
  }, [debouncedSchool]);

  const selectSchool = (school: School) => {
    (navigation.navigate as Function)("credentials", { chosenSchool: JSON.stringify(school) });
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}
                          keyboardVerticalOffset={Platform.select({ android: 0, default: 20 })}>
      <List
        ListHeaderComponent={
          <WebUntisSearchHeader
            school={school}
            setSchool={setSchool}
            loading={loading && schools.length === 0}
            t={t}
          />
        }
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
        {schools.length === 0 && !loading && (
          <List.Item animated onPress={() => {
            return navigation.navigate("credentials" as never);
          }}>
            <List.Leading>
              <Icon><Papicons name="password"/></Icon>
            </List.Leading>
            <Typography variant="title">{t("ONBOARDING_WEBUNTIS_LOGIN_CREDENTIALS")}</Typography>
          </List.Item>
        )}

        {schools.map((school, _) => (
          <List.Item animated={true} key={school.schoolId} id={school.schoolId} onPress={() => {
            selectSchool(school)
          }}>
            <List.Leading>
              <Icon><Papicons name="mappin"/></Icon>
            </List.Leading>

            <Typography variant="title">{school.displayName}</Typography>
            <Typography variant="body1" color="textSecondary">{school.address}</Typography>
          </List.Item>
        ))}
      </List>
    </KeyboardAvoidingView>
  )
}
