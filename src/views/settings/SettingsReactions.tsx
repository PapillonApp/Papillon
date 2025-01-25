import React from "react";
import { ScrollView, View } from "react-native";
import type { Screen } from "@/router/helpers/types";
import { useTheme } from "@react-navigation/native";
import { useGradesStore } from "@/stores/grades";
import ReelGallery from "@/components/Settings/ReelGallery";
import MissingItem from "@/components/Global/MissingItem";
import { useTranslation } from "react-i18next";

const SettingsReactions: Screen<"SettingsReactions"> = ({ navigation }) => {
  const theme = useTheme();
  const reelsObject = useGradesStore((store) => store.reels);
  const reels = Object.values(reelsObject);
  const { t } = useTranslation();

  navigation.setOptions({
    headerTitle: t("settings.sections.general.reactions.title"),
  });

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 16,
        paddingTop: 16,
      }}
    >
      {reels.length === 0 ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <MissingItem
            animatedEmoji
            title={t("settings.sections.general.reactions.noReactionsTitle")}
            description={t(
              "settings.sections.general.reactions.noReactionsSubtitle"
            )}
          />
        </View>
      ) : (
        <ReelGallery reels={reels} />
      )}
    </ScrollView>
  );
};

export default SettingsReactions;
