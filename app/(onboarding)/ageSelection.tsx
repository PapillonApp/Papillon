import { useHeaderHeight } from "@react-navigation/elements";
import { useTheme } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import React, { useState } from "react";
import { FlatList, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Stack from "@/ui/components/Stack";
import Button from "@/ui/new/Button";
import Divider from "@/ui/new/Divider";
import Typography from "@/ui/new/Typography";

import HighSchoolIllustration from "./components/ageSelection/illustrations/highSchool";
import MiddleSchoolIllustration from "./components/ageSelection/illustrations/middleSchool";
import ParentsIllustration from "./components/ageSelection/illustrations/parents";
import SupSchoolIllustration from "./components/ageSelection/illustrations/supSchool";
import TeacherIllustration from "./components/ageSelection/illustrations/teacher";
import OnboardingSelector from "./components/OnboardingSelector";

const LEVELS = [
  {
    key: "middle-school",
    labelKey: "ONBOARDING_LEVEL_MIDDLE_SCHOOL",
    color: "#008CFF",
    icon: MiddleSchoolIllustration,
    type: "school"
  },
  {
    key: "high-school",
    labelKey: "ONBOARDING_LEVEL_HIGH_SCHOOL",
    color: "#FFC800",
    icon: HighSchoolIllustration,
    type: "school"
  },
  {
    key: "sup-school",
    labelKey: "ONBOARDING_LEVEL_UNIVERSITY",
    color: "#68F000",
    icon: SupSchoolIllustration,
    type: "univ"
  },
  {
    type: 'separator'
  },
  {
    key: "parents",
    labelKey: "ONBOARDING_LEVEL_PARENT",
    color: "#ff4d4d",
    icon: ParentsIllustration,
    type: "parents"
  },
  {
    key: "teacher",
    labelKey: "ONBOARDING_LEVEL_TEACHER",
    color: "#FF0084",
    icon: TeacherIllustration,
    type: "teacher"
  }
]

export default function AgeSelection() {
  const headerHeight = useHeaderHeight();
  const theme = useTheme();
  const { colors } = theme;
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { t } = useTranslation();

  const [selectedLevel, setSelectedLevel] = useState(null);

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        ListHeaderComponent={() => (
          <Stack>
            <Typography variant="h2">{t("ONBOARDING_AGE_TITLE")}</Typography>
            <Typography variant="action" color="textSecondary">{t("ONBOARDING_AGE_DESCRIPTION")}</Typography>
            <Divider height={6} ghost />
          </Stack>
        )}
        data={LEVELS.map((level) => ("labelKey" in level ? { ...level, label: t(level.labelKey) } : level))}
        renderItem={({ item }) => <OnboardingSelector item={item} selected={selectedLevel} setSelected={setSelectedLevel} />}
        contentContainerStyle={{
          padding: 20,
          flexGrow: 1,
          gap: 10,
          paddingTop: headerHeight + 20
        }}
        initialNumToRender={2}
        maxToRenderPerBatch={2}
        windowSize={3}
        style={{ flex: 1 }}
      />

      <View
        style={{
          padding: 20,
          paddingBottom: insets.bottom + 20,
          borderTopColor: colors.border,
          borderTopWidth: 1
        }}
      >
        <Button
          label={t("ONBOARDING_CONTINUE")}
          onPress={() => {
            navigation.navigate("serviceSelection", {
              type: LEVELS.find((level) => level.key === selectedLevel)?.type
            })
          }}
          disabled={!selectedLevel}
        />
      </View>
    </View>
  );
}
