import { Image, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import React, { useMemo, useState } from "react";
import Reanimated, { FadeInDown } from "react-native-reanimated";

import Typography from "@/ui/components/Typography";
import { useTranslation } from "react-i18next";
import AnimatedPressable from "@/ui/components/AnimatedPressable";
import OnboardingScrollingFlatList from "@/components/onboarding/OnboardingScrollingFlatList";
import OnboardingInput from "@/components/onboarding/OnboardingInput";
import { router } from "expo-router";
import { INSTANCES } from "@studentsphere/linkgor";

const UNIVERSITY_LOGOS: { [key: string]: any } = {
  "3a": require("@/assets/images/univ/3a.webp"),
  "american-business-college": require("@/assets/images/univ/abcp.webp"),
  "business-science-institute": require("@/assets/images/univ/bsi.webp"),
  "cnva": require("@/assets/images/univ/cnva.webp"),
  "ecm": require("@/assets/images/univ/ecm.webp"),
  "emi": require("@/assets/images/univ/emi.webp"),
  "esa": require("@/assets/images/univ/esa.webp"),
  "esail": require("@/assets/images/univ/esail.webp"),
  "esam": require("@/assets/images/univ/esam.webp"),
  "epsi": require("@/assets/images/univ/epsi.webp"),
  "icd-business-school": require("@/assets/images/univ/icd.webp"),
  "icl": require("@/assets/images/univ/icl.webp"),
  "idrac-business-school": require("@/assets/images/univ/idrac.webp"),
  "ieft": require("@/assets/images/univ/ieft.webp"),
  "iet": require("@/assets/images/univ/iet.webp"),
  "ifag": require("@/assets/images/univ/ifag.webp"),
  "igefi": require("@/assets/images/univ/igefi.webp"),
  "igensia-rh": require("@/assets/images/univ/igensiarh.webp"),
  "ihedrea": require("@/assets/images/univ/ihedrea.webp"),
  "ileri": require("@/assets/images/univ/ileri.webp"),
  "imis": require("@/assets/images/univ/imis.webp"),
  "imsi": require("@/assets/images/univ/imsi.webp"),
  "ipi": require("@/assets/images/univ/ipi.webp"),
  "iscpa": require("@/assets/images/univ/iscpa.webp"),
  "ismm": require("@/assets/images/univ/ismm.webp"),
  "sup-de-com": require("@/assets/images/univ/supdecom.webp"),
  "viva-mundi": require("@/assets/images/univ/vivamundi.webp"),
  "wis": require("@/assets/images/univ/wis.webp"),
};

export default function WigorInstancesList() {
  const theme = useTheme();
  const { colors } = theme;

  const [search, setSearch] = useState<string>("");
  const { t } = useTranslation();

  const filteredInstances = useMemo(() => {
    if (!search.trim()) return INSTANCES;
    return INSTANCES.filter((instance) =>
      instance.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <OnboardingScrollingFlatList
      color={"#1E3035"}
      lottie={require("@/assets/lotties/uni-services.json")}
      title={t("ONBOARDING_SELECT_UNIVERSITIESERVICE")}
      step={1}
      totalSteps={2}
      elements={[{ isSearchBar: true }, ...filteredInstances]}
      renderItem={({ item, index }) => {
        const typedItem = item as any;
        if (typedItem.isSearchBar) {
          return (
            <View style={{ marginBottom: 15 }}>
              <OnboardingInput
                placeholder={t("SEARCH_UNIV_PLACEHOLDER")}
                text={search}
                setText={setSearch}
                icon="Search"
                inputProps={{}}
              />
            </View>
          );
        }

        return (
          <Reanimated.View
            entering={FadeInDown.springify()
              .duration(400)
              .delay(index * 80 + 150)}
          >
            <AnimatedPressable
              onPress={() => {
                requestAnimationFrame(() => {
                  router.push({
                    pathname: "/(onboarding)/services/wigor/credentials" as any,
                    params: { instanceId: typedItem.id },
                  });
                });
              }}
              style={{
                paddingHorizontal: 18,
                paddingVertical: 14,
                borderColor: colors.border,
                borderWidth: 1.5,
                borderRadius: 80,
                borderCurve: "continuous",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "flex-start",
                display: "flex",
                gap: 16,
              }}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {UNIVERSITY_LOGOS[typedItem.id] ? (
                  <Image
                    source={UNIVERSITY_LOGOS[typedItem.id]}
                    style={{ width: 32, height: 32 }}
                    resizeMode="cover"
                  />
                ) : (
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      backgroundColor: colors.border,
                      borderRadius: 16,
                    }}
                  />
                )}
              </View>
              <Typography style={{ flex: 1 }} nowrap variant="title">
                {typedItem.name}
              </Typography>
            </AnimatedPressable>
          </Reanimated.View>
        );
      }}
    />
  );
}
