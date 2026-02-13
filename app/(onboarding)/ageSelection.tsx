import { useHeaderHeight } from "@react-navigation/elements";
import { useTheme } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import React, { useState } from "react";
import { FlatList, View } from "react-native";
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
    label: "Collègien",
    color: "#6480F0",
    icon: MiddleSchoolIllustration,
    type: "school"
  },
  {
    key: "high-school",
    label: "Lycéen",
    color: "#ca631e",
    icon: HighSchoolIllustration,
    type: "school"
  },
  {
    key: "sup-school",
    label: "Étudiant",
    color: "#37baad",
    icon: SupSchoolIllustration,
    type: "univ"
  },
  {
    type: 'separator'
  },
  {
    key: "parents",
    label: "Parent d'élève",
    color: "#FF7878",
    icon: ParentsIllustration,
    type: "parents"
  },
  {
    key: "teacher",
    label: "Professeur",
    color: "#ffeb78",
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

  const [selectedLevel, setSelectedLevel] = useState(null);

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        ListHeaderComponent={() => (
          <Stack>
            <Typography variant="h2">Qui est-tu ?</Typography>
            <Typography variant="action" color="textSecondary">Sélectionne ton niveau scolaire</Typography>
            <Divider height={6} ghost />
          </Stack>
        )}
        data={LEVELS}
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
          label="Continuer"
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