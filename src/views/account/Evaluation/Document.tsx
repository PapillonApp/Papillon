import {
  NativeItem,
  NativeList,
  NativeListHeader,
  NativeText,
} from "@/components/Global/NativeComponents";
import { getSubjectData } from "@/services/shared/Subject";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { Image, ScrollView, Text, View, Platform } from "react-native";
import {
  MessageSquareMore,
  User2,
} from "lucide-react-native";
import { Screen } from "@/router/helpers/types";
import InsetsBottomView from "@/components/Global/InsetsBottomView";
import {Skill} from "@/services/shared/Evaluation";
import {SkillLevelBadge} from "@/views/account/Evaluation/Atoms/SkillLevelBadge";

const EvaluationDocument: Screen<"EvaluationDocument"> = ({ route, navigation }) => {
  const { evaluation, allEvaluations = [] } = route.params;
  const theme = useTheme();

  const [subjectData, setSubjectData] = useState({
    color: "#888888",
    pretty: "Matière inconnue",
    emoji: "❓",
  });

  const [skillPerDomain, setSkillPerDomain] = useState<{
    domainName: string;
    skills: Array<Skill>;
  }[]>([]);

  const fetchSubjectData = () => {
    const data = getSubjectData(evaluation.subjectName);
    setSubjectData(data);
  };

  useEffect(() => {
    fetchSubjectData();
  }, [evaluation.subjectName]);

  useEffect(() => {
    const skillsPerDomain = evaluation.skills.reduce((acc, skill) => {
      const domainName = skill.domainName;
      const domainIndex = acc.findIndex((item) => item.domainName === domainName);

      if (domainIndex === -1) {
        acc.push({
          domainName,
          skills: [skill],
        });
      } else {
        acc[domainIndex].skills.push(skill);
      }

      return acc;
    }, [] as { domainName: string; skills: Array<Skill> }[]);

    setSkillPerDomain(skillsPerDomain);
  }, [evaluation]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "Compétence en " + subjectData.pretty,
      headerStyle: {
        backgroundColor: Platform.OS === "android" ? subjectData.color : undefined,
      },
      headerTintColor: "#ffffff",
    });
  }, [navigation, subjectData]);

  return (
    <View
      style={{
        flex: 1,
      }}
    >
      <View
        style={{
          borderCurve: "continuous",
          minHeight: 180,
          backgroundColor: subjectData.color,
        }}
      >
        <View
          style={{
            backgroundColor: "#00000043",
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: -1,
          }}
        >
          <Image
            source={require("../../../../assets/images/mask_stars_settings.png")}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              tintColor: "#ffffff",
              opacity: 0.15,
            }}
          />
        </View>

        {Platform.OS === "ios" &&
            <View
              style={{
                backgroundColor: "#ffffff",
                width: 60,
                height: 4,
                borderRadius: 2,
                alignSelf: "center",
                opacity: 0.3,
                marginVertical: 8,
              }}
            />
        }

        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 16,
            gap: 6,
            flex: 1,
            justifyContent: "flex-end",
          }}
        >
          <Text
            style={{
              color: "#ffffff",
              fontSize: 14,
              letterSpacing: 1,
              textTransform: "uppercase",
              fontFamily: "semibold",
              opacity: 0.6,
            }}
            numberOfLines={1}
          >
            {subjectData.pretty}
          </Text>
          <Text
            style={{
              color: "#ffffff",
              fontSize: 17,
              fontFamily: "semibold",
              opacity: 1,
            }}
            numberOfLines={2}
          >
            {evaluation.name}
          </Text>
          <Text
            style={{
              color: "#ffffff",
              fontSize: 15,
              fontFamily: "medium",
              opacity: 0.6,
            }}
            numberOfLines={1}
          >
            {new Date(evaluation.timestamp).toLocaleDateString("fr-FR", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </Text>
        </View>
      </View>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        style={{
          flex: 1,
          width: "100%",
          maxWidth: 500,
          backgroundColor: theme.colors.background,
          borderCurve: "continuous",
          overflow: "hidden",
        }}
        contentContainerStyle={{
          width: "100%",
        }}
      >
        <View
          style={{
            paddingHorizontal: 16,
          }}
        >
          {skillPerDomain.map((domain, index) => (
            <View key={index}>
              <NativeListHeader label={domain.domainName} />
              <NativeList>
                {domain.skills.map((skill, index) => (
                  <NativeItem
                    key={index}
                    leading={<SkillLevelBadge skillLevel={skill.level} />}
                    trailing={<NativeText variant="subtitle" style={{fontSize: 18, marginLeft: 10}}>
                      {skill.pillarPrefixes.join(", ")}
                    </NativeText>}
                  >
                    <NativeText variant={"title"}>{skill.itemName}</NativeText>
                    <NativeText variant={"subtitle"}>{`Coefficient x${skill.coefficient.toFixed(2)}`}</NativeText>
                  </NativeItem>
                ))}
              </NativeList>
            </View>
          ))}
          <NativeListHeader label={"Détails"} />
          <NativeList>
            <NativeItem
              icon={<User2/>}
            >
              <NativeText variant="overtitle">Déposé par </NativeText>
              <NativeText
                variant={"subtitle"}
              >
                {evaluation.teacher}
              </NativeText>
            </NativeItem>
            {evaluation.description !== "" && (
              <NativeItem
                icon={<MessageSquareMore/>}
              >
                <NativeText variant="overtitle">Détails</NativeText>
                <NativeText
                  variant={"subtitle"}
                >
                  {evaluation.description}
                </NativeText>
              </NativeItem>
            )}
          </NativeList>
        </View>
        <InsetsBottomView />
      </ScrollView>
    </View>
  );
};

export default EvaluationDocument;
