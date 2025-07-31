import AnimatedNumber from "@/components/Global/AnimatedNumber";
import { NativeItem, NativeList, NativeListHeader, NativeText } from "@/components/Global/NativeComponents";
import { useAlert } from "@/providers/AlertProvider";
import { PrimaryAccount } from "@/stores/account/types";
import { anim2Papillon } from "@/utils/ui/animations";
import { adjustColor } from "@/utils/ui/colors";
import { defaultProfilePicture } from "@/utils/ui/default-profile-picture";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { ChevronDown, ChevronUp, Info } from "lucide-react-native";
import { memo, useState, useMemo, useCallback } from "react";
import { Image, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import Reanimated, { FadeIn, FadeInDown, FadeOut, FadeOutUp, LinearTransition } from "react-native-reanimated";

const GradesScodocUE = memo(({ account, navigation, selectedPeriod }: { account: PrimaryAccount, navigation: any, selectedPeriod: string }) => {
  const theme = useTheme();
  const colors = theme.colors;
  const { showAlert } = useAlert();

  const data = account.serviceData.semestres;
  // @ts-expect-error
  const grades = data[selectedPeriod];

  const ues = grades["relevé"]["ues"];
  const uekeys = Object.keys(ues);

  if (uekeys.length === 0) return null;

  const ressources = grades["relevé"]["ressources"];
  const saes = grades["relevé"]["saes"];

  const finalUes = useMemo(() => uekeys.map(ue => ({
    name: ue,
    ...ues[ue]
  })), [uekeys, ues]);

  const handleAlert = useCallback(() => showAlert({
    title: "Unités d'enseignement",
    message: `Les données, rangs et notes sont fournies par les services de ${account.identityProvider?.name}.`,
    icon: <Info />,
  }), [account.identityProvider?.name, showAlert]);

  return (
    <Reanimated.View
      layout={anim2Papillon(LinearTransition)}
      entering={anim2Papillon(FadeInDown).duration(300)}
      exiting={anim2Papillon(FadeOutUp).duration(100)}
    >
      <NativeListHeader
        animated
        label="Unités d'enseignement"
        style={{
          marginTop: 16,
          marginBottom: -14,
        }}
        trailing={
          <TouchableOpacity
            style={{
              width: 24,
              height: 24,
            }}
            onPress={handleAlert}
          >
            <Image
              style={{
                width: 24,
                height: 24,
                borderRadius: 8,
                borderColor: colors.text + "32",
                borderWidth: 1,
              }}
              source={defaultProfilePicture(account.service, account.identityProvider?.name || "")}
            />
          </TouchableOpacity>
        }
      />

      <NativeList animated layout={anim2Papillon(LinearTransition)}>
        {finalUes.map((ue, i) => {
          const [opened, setOpened] = useState(false);

          const grades = useMemo(() => {
            const result: Array<{key: string, type: "ressources" | "saes"}> = [];
            Object.keys(ue.ressources).forEach(res => result.push({ key: res, type: "ressources" }));
            Object.keys(ue.saes).forEach(sae => result.push({ key: sae, type: "saes" }));
            return result;
          }, [ue.ressources, ue.saes]);

          const navigateToSubject = useCallback(() => {
            navigation.navigate("GradeSubject", { subject: {
              average: {
                subjectName: ue.name + " > " + ue.titre,
                average: { value: parseFloat(ue.moyenne.value) },
                classAverage: { value: parseFloat(ue.moyenne.moy) },
                min: { value: parseFloat(ue.moyenne.min) },
                max: { value: parseFloat(ue.moyenne.max) },
                outOf: { value: 20 },
              },
              rank: {
                value: ue.moyenne.rang,
                outOf: ue.moyenne.total,
              }
            } });
          }, [navigation, ue]);

          const ueColor = adjustColor(ue.color, theme.dark ? 180 : -100);
          const backgroundColor = (ue.color || colors.primary) + "26";
          const borderColor = ueColor + "32";

          return (
            <View key={`${ue.name ?? ue.moyenne.value}-ue:${i}`}>
              <NativeItem
                chevron={false}
                style={{ backgroundColor }}
                leading={
                  <TouchableOpacity
                    style={{
                      width: 48,
                      height: 30,
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 8,
                      borderColor,
                      borderWidth: 1,
                    }}
                    onPress={navigateToSubject}
                  >
                    <NativeText
                      variant="subtitle"
                      style={{ color: ueColor }}
                    >
                      {ue.name}
                    </NativeText>
                  </TouchableOpacity>
                }
                trailing={
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 0, marginLeft: 6 }}>
                    <TouchableOpacity onPress={navigateToSubject}>
                      <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 2 }}>
                        <AnimatedNumber
                          value={ue.moyenne.value}
                          style={{
                            fontSize: 18,
                            lineHeight: 20,
                            fontFamily: "semibold",
                          }}
                          contentContainerStyle={null}
                        />
                        <NativeText style={{ fontSize: 15, lineHeight: 15, opacity: 0.6 }}>
                          /20
                        </NativeText>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => setOpened(!opened)}
                      style={{ zIndex: 1000, padding: 8 }}
                    >
                      <Reanimated.View
                        key={`openUE-${opened}`}
                        entering={FadeIn.duration(100)}
                        exiting={FadeOut.duration(100)}
                      >
                        {opened ? <ChevronUp opacity={0.7} size={24} color={colors.text} /> : <ChevronDown opacity={0.7} size={24} color={colors.text} />}
                      </Reanimated.View>
                    </TouchableOpacity>
                  </View>
                }
              >
                <TouchableOpacity onPress={() => setOpened(!opened)}>
                  <NativeText
                    variant="body"
                    numberOfLines={2}
                    style={{ color: ueColor }}
                  >
                    {ue.titre}
                  </NativeText>
                </TouchableOpacity>
              </NativeItem>

              {opened && grades.map((gra, i) => (
                <NativeItem
                  key={`${gra.key}-grade:${i}-ue:${ue.name ?? ue.moyenne.value}`}
                  separator={i !== grades.length - 1}
                  entering={i < 16 ? anim2Papillon(FadeInDown).delay(40 * i) : FadeIn.duration(100)}
                  exiting={FadeOut.duration(100)}
                  leading={
                    <NativeText
                      variant="subtitle"
                      style={{ width: 48 }}
                      numberOfLines={2}
                    >
                      {gra.key}
                    </NativeText>
                  }
                  trailing={
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 2, marginHorizontal: 6 }}>
                      <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "flex-end", gap: 2, marginHorizontal: 6 }}>
                        <NativeText variant="title">
                          {ue[gra.type][gra.key].moyenne}
                        </NativeText>
                        <NativeText variant="subtitle">
                          /20
                        </NativeText>
                      </View>

                      <View style={{ width: 50, flexDirection: "row", alignItems: "center", justifyContent: "flex-end" }}>
                        <NativeText
                          variant="body"
                          style={{
                            alignSelf: "flex-end",
                            fontSize: 14,
                            fontFamily: "semibold",
                            color: colors.primary,
                            paddingVertical: 2,
                            paddingHorizontal: 6,
                            borderRadius: 7,
                            overflow: "hidden",
                            backgroundColor: colors.primary + "26",
                          }}
                          numberOfLines={1}
                        >
                          x{ue[gra.type][gra.key].coef}
                        </NativeText>
                      </View>
                    </View>
                  }
                >
                  <NativeText numberOfLines={2} variant="body">
                    {gra.type === "ressources" ? ressources[gra.key].titre : saes[gra.key].titre}
                  </NativeText>
                </NativeItem>
              ))}
            </View>
          );
        })}
      </NativeList>
    </Reanimated.View>
  );
});

export default GradesScodocUE;