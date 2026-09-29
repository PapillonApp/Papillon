import { useRoute, useTheme, useHeaderHeight } from "expo-router/react-navigation";
import { router, useNavigation } from "expo-router";
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { View, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { getWhiteLabelSchools, getWhiteLabelSsoConfig, createWhiteLabelSsoAuthURL, WhiteLabelAppSchool, WHITE_LABEL_APPS } from "@studentsphere/linksign";
import { appLogos } from "./whitelabel";

import Typography from '@/ui/new/Typography';
import Stack from '@/ui/components/Stack';
import ActivityIndicator from '@/ui/components/ActivityIndicator';
import { useAlert } from "@/ui/components/AlertProvider";
import Search from "@/ui/components/Search";

import List from "@/ui/new/List";
import { Dynamic } from "@/ui/components/Dynamic";
import Icon from "@/ui/components/Icon";
import { Papicons } from "@getpapillon/papicons";
import { PapillonZoomIn, PapillonZoomOut } from "@/ui/utils/Transition";
import adjust from "@/utils/adjustColor";
import Button from "@/ui/new/Button";
import Divider from "@/ui/new/Divider";

export default function EdusignWhitelabelSchools() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { colors } = theme;
  const route = useRoute();
  const alert = useAlert();
  const { t } = useTranslation();
  const headerHeight = useHeaderHeight();
  const { appPackage, appName } = (route.params || {}) as any;
  const currentApp = WHITE_LABEL_APPS.find(a => a.package === appPackage);
  const appLogo = currentApp?.id ? appLogos[currentApp.id] : undefined;
  const finalAppName = appName || currentApp?.appName || t("ONBOARDING_YOUR_SCHOOL");

  const [schools, setSchools] = useState<WhiteLabelAppSchool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingSso, setIsCheckingSso] = useState(false);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSchools = schools.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const selectedSchool = schools.find(s => s.schoolId === selectedSchoolId) || null;

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const data = await getWhiteLabelSchools(appPackage);
        setSchools(data);
      } catch (e) {
        alert.showAlert({
          title: t("Alert_Error"),
          description: t("Alert_Schools_Load_Error"),
          icon: "AlertTriangle",
          color: "#D60046",
          withoutNavbar: true
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchSchools();
  }, [appPackage]);

  const handleContinueWithSchool = async (schoolId: string) => {
    setSelectedSchoolId(schoolId);
    setIsCheckingSso(true);
    try {
      const ssoConfig = await getWhiteLabelSsoConfig(schoolId);
      if (ssoConfig) {
        const url = createWhiteLabelSsoAuthURL(ssoConfig);
        router.push({
          pathname: "./browser",
          params: {
            ssoUrl: url,
            ssoConfig: JSON.stringify(ssoConfig),
            isWhitelabelApp: 'true'
          }
        });

        setTimeout(() => setIsCheckingSso(false), 500);
        return;
      }
    } catch {

    } finally {
      setIsCheckingSso(false);
    }

    const school = schools.find(s => s.schoolId === schoolId);
    if (!school) return;

    router.push({
      pathname: "./whitelabel-login",
      params: {
        appPackage,
        appName: finalAppName,
        schoolId: school.schoolId,
        schoolName: school.name,
        schoolLogoUrl: school.logoUrl || undefined,
      }
    });
  };

  const handleContinue = () => {
    if (selectedSchoolId) {
      handleContinueWithSchool(selectedSchoolId);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <List
        animated
        ListHeaderComponent={
          <Stack padding={[4, 0]}>
            <Typography variant="h2">{appName}</Typography>
            <Typography variant="action" color="textSecondary">
              {t("ONBOARDING_SELECT_SCHOOL")}
            </Typography>
            <Divider height={6} ghost />
            <Search
              placeholder={t("ONBOARDING_SEARCH_SCHOOL_PLACEHOLDER")}
              style={{ width: "100%" }}
              value={searchQuery}
              setValue={setSearchQuery}
              onTextChange={setSearchQuery}
            />
            {isLoading && (
              <Dynamic animated>
                <Stack vAlign="center" hAlign="center" width={"100%"} gap={2}>
                  <Divider height={18} ghost />
                  <ActivityIndicator size={30} color={colors.primary as string} />
                  <Divider height={12} ghost />
                  <Typography align="center" variant="h5">{t("ONBOARDING_SCHOOLS_SEARCHING")}</Typography>
                  <Typography align="center" variant="body" color="textSecondary">{t("ONBOARDING_SCHOOLS_SEARCHING_HINT")}</Typography>
                </Stack>
              </Dynamic>
            )}
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
        {!isLoading && filteredSchools.map((item) => (
          <List.Item
            animated
            key={item.schoolId}
            onPress={() => setSelectedSchoolId(item.schoolId)}
            style={{
              backgroundColor: selectedSchoolId === item.schoolId ? adjust(colors.primary as string, theme.dark ? -0.8 : 0.9) : colors.card,
              minHeight: 62
            }}
          >
            <List.Leading>
              <Stack animated direction="horizontal" hAlign="center" gap={12}>
                {selectedSchoolId === item.schoolId && (
                  <Dynamic animated entering={PapillonZoomIn} exiting={PapillonZoomOut}>
                    <Icon fill={colors.primary as string}><Papicons name="check" /></Icon>
                  </Dynamic>
                )}
                <Dynamic animated>
                  {item.logoUrl ? (
                    <Image source={{ uri: item.logoUrl }} style={{ width: 32, height: 32, borderRadius: 10 }} />
                  ) : (
                    <View style={{
                      width: 32,
                      height: 32,
                      borderRadius: 10,
                      backgroundColor: (colors.primary as string) + "11",
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}>
                      <Icon fill={(selectedSchoolId === item.schoolId ? colors.primary : colors.text) as string} size={18}>
                        <Papicons name="Building" />
                      </Icon>
                    </View>
                  )}
                </Dynamic>
              </Stack>
            </List.Leading>
            <Dynamic animated><Typography variant="action">{item.name}</Typography></Dynamic>
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
          disabled={!selectedSchoolId || isLoading || isCheckingSso}
        />
      </View>
    </View>
  );
}
