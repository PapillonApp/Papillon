import {
  NativeItem,
  NativeList,
  NativeListHeader,
  NativeText,
} from "@/components/Global/NativeComponents";
import { getSubjectData } from "@/services/shared/Subject";
import { useTheme } from "@react-navigation/native";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { Dimensions, Image, Pressable, ScrollView, Text, View, Platform } from "react-native";
import { GradeTitle } from "./Atoms/GradeTitle";
import * as SystemUI from "expo-system-ui";
import * as StoreReview from "expo-store-review";
import {
  Asterisk,
  Calculator,
  Scale,
  School,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react-native";
import { getAverageDiffGrade } from "@/utils/grades/getAverages";
import type { AverageDiffGrade } from "@/utils/grades/getAverages";
import { Screen } from "@/router/helpers/types";
import InsetsBottomView from "@/components/Global/InsetsBottomView";
import AsyncStorage from "@react-native-async-storage/async-storage";

const GradeDocument: Screen<"GradeDocument"> = ({ route, navigation }) => {
  const { grade, allGrades = [] } = route.params;
  const theme = useTheme();

  const [subjectData, setSubjectData] = useState({
    color: "#888888",
    pretty: "Matière inconnue",
    emoji: "❓",
  });

  const [shouldShowReviewOnClose, setShouldShowReviewOnClose] = useState(false);

  const askForReview = async () => {
    StoreReview.isAvailableAsync().then((available) => {
      if (available) {
        StoreReview.requestReview();
      }
    });
  };

  // on modal closed
  useEffect(() => {
    navigation.addListener("beforeRemove", (e) => {
      if (shouldShowReviewOnClose) {
        AsyncStorage.getItem("review_given").then((value) => {
          if(!value) {
            console.log("Asking for review");
            askForReview();
            AsyncStorage.setItem("review_given", "true");
          }
        });
      }
    });
  });

  useEffect(() => {
    AsyncStorage.getItem("review_openGradeCount").then((value) => {
      if (value) {
        if (parseInt(value) >= 5) {
          AsyncStorage.setItem("review_openGradeCount", "0");
          setShouldShowReviewOnClose(true);
        }
        else {
          AsyncStorage.setItem("review_openGradeCount", (parseInt(value) + 1).toString());
        }
      } else {
        AsyncStorage.setItem("review_openGradeCount", "1");
      }
    });
  }, []);

  const fetchSubjectData = () => {
    const data = getSubjectData(grade.subjectName);
    setSubjectData(data);
  };

  useEffect(() => {
    fetchSubjectData();
  }, [grade.subjectName]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "Note en " + subjectData.pretty,
      presentation: "transparentModal",
      headerStyle: {
        backgroundColor: Platform.OS === "android" ? subjectData.color : undefined,
      },
      headerTintColor: "#ffffff",
    });
  }, [navigation, subjectData]);

  const [gradeDiff, setGradeDiff] = useState({} as AverageDiffGrade);
  const [classDiff, setClassDiff] = useState({} as AverageDiffGrade);

  useEffect(() => {
    const gD = getAverageDiffGrade(
      [grade],
      allGrades,
      "student"
    ) as AverageDiffGrade;
    const cD = getAverageDiffGrade(
      [grade],
      allGrades,
      "average"
    ) as AverageDiffGrade;

    setGradeDiff(gD);
    setClassDiff(cD);
  }, [grade]);

  const lists = [
    {
      title: "Informations",
      items: [
        {
          icon: <Asterisk />,
          title: "Coefficient",
          description: "Coefficient de la note",
          value: "x" + grade.coefficient.toFixed(2),
        },
        grade.outOf.value !== 20 &&
					!grade.student.disabled && {
          icon: <Calculator />,
          title: "Remis sur /20",
          description: "Valeur recalculée sur 20",
          value:
							typeof grade.student.value === "number" &&
							typeof grade.outOf.value === "number"
							  ? ((grade.student.value / grade.outOf.value) * 20).toFixed(2)
							  : "??",
          bareme: "/20",
        },
      ],
    },
    {
      title: "Ma classe",
      items: [
        {
          icon: <Users />,
          title: "Note moyenne",
          description: "Moyenne de la classe",
          value: grade.average.value?.toFixed(2) ?? "??",
          bareme: "/" + grade.outOf.value,
        },
        {
          icon: <UserPlus />,
          title: "Note maximale",
          description: "Meilleure note de la classe",
          value: grade.max.value?.toFixed(2) ?? "??",
          bareme: "/" + grade.outOf.value,
        },
        {
          icon: <UserMinus />,
          title: "Note minimale",
          description: "Moins bonne note de la classe",
          value:
						grade.min.value?.toFixed(2) &&
						grade.min.value.toFixed(2) !== "-1.00"
						  ? grade.min.value?.toFixed(2)
						  : "??",
          bareme: "/" + grade.outOf.value,
        },
      ],
    },
    {
      title: "Influence",
      items: [
        !grade.student.disabled && {
          icon: <Scale />,
          title: "Moyenne générale",
          description: "Impact de la note sur la moyenne générale",
          value:
						gradeDiff.difference === undefined
						  ? "???"
						  : (gradeDiff.difference > 0
						    ? "- "
						    : gradeDiff.difference === 0
						      ? "+/- "
						      : "+ ") +
							  gradeDiff.difference.toFixed(2).replace("-", "") +
							  " pts",
          color:
						gradeDiff.difference === undefined
						  ? void 0
						  : gradeDiff.difference < 0
						    ? "#4CAF50"
						    : gradeDiff.difference === 0
						      ? theme.colors.text
						      : "#F44336",
        },
        !grade.average.disabled && {
          icon: <School />,
          title: "Moyenne de la classe",
          description: "Impact de la note sur la moyenne de la classe",
          value:
						classDiff.difference === undefined
						  ? "???"
						  : (classDiff.difference > 0
						    ? "- "
						    : gradeDiff.difference === 0
						      ? "+/- "
						      : "+ ") +
							  classDiff.difference.toFixed(2).replace("-", "") +
							  " pts",
        },
      ],
    },
  ];

  return (
    <ScrollView
      style={{
        flex: 1,
        borderTopLeftRadius: Platform.OS === "ios" ? 19 : 0,
        borderTopRightRadius: Platform.OS === "ios" ? 19 : 0,
        borderCurve: "continuous",
      }}
      contentContainerStyle={{ flexGrow: 1, alignItems: "center" }}
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      decelerationRate={Platform.OS === "ios" ? "fast" : "normal"}
      snapToInterval={Platform.OS === "ios" ? (Dimensions.get("window").height / 4) : undefined}
    >
      <Pressable
        style={{
          position: "absolute",
          height: "100%",
          width: "100%",
        }}
        onPress={() => navigation.goBack()}
      />
      <View
        style={{
          minHeight: "100%",
          width: "100%",
          maxWidth: 500,
          backgroundColor: theme.colors.background,
          borderRadius: Platform.OS === "ios" ? 19 : 0,
          borderCurve: "continuous",
          marginTop: Platform.OS === "ios" ? Dimensions.get("window").height / 4 : 0,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            borderTopLeftRadius: Platform.OS === "ios" ? 20 : 0,
            borderTopRightRadius: Platform.OS === "ios" ? 20 : 0,
            borderCurve: "continuous",
            minHeight: 180,
            backgroundColor: subjectData.color,
            borderColor: "#ffffff33",
            borderWidth: 1,
            borderBottomWidth: 0,
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
              numberOfLines={1}
            >
              {grade.description || "Note sans description"}
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
              {new Date(grade.timestamp).toLocaleDateString("fr-FR", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </Text>

            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-end",
                justifyContent: "flex-start",
                gap: 2,
                marginTop: 8,
              }}
            >
              <Text
                style={{
                  color: "#ffffff",
                  fontSize: 28,
                  fontFamily: "semibold",
                  opacity: 1,
                }}
                numberOfLines={1}
              >
                {grade.student.disabled ? "N. not" : grade.student.value?.toFixed(2)}
              </Text>
              <Text
                style={{
                  color: "#ffffff",
                  fontSize: 18,
                  fontFamily: "medium",
                  opacity: 0.6,
                  marginBottom: 1,
                }}
                numberOfLines={1}
              >
                /{grade.outOf.value}
              </Text>
            </View>
          </View>
        </View>

        <View
          style={{
            paddingHorizontal: 16,
          }}
        >

          {lists.map((list, index) => (
            <View key={index}>
              <NativeListHeader label={list.title} />

              <NativeList>
                {list.items.map(
                  (item, index) =>
                    item && (
                      <NativeItem
                        key={index}
                        icon={item.icon}
                        trailing={
                          <View
                            style={{
                              marginRight: 10,
                              alignItems: "flex-end",
                              flexDirection: "row",
                              gap: 2,
                            }}
                          >
                            <NativeText
                              style={{
                                fontSize: 18,
                                lineHeight: 22,
                                fontFamily: "semibold",
                                color:
															"color" in item ? item.color : theme.colors.text,
                              }}
                            >
                              {item.value}
                            </NativeText>

                            {"bareme" in item && (
                              <NativeText variant="subtitle">
                                {item.bareme}
                              </NativeText>
                            )}
                          </View>
                        }
                      >
                        <NativeText variant="overtitle">{item.title}</NativeText>

                        {item.description && (
                          <NativeText variant="subtitle">
                            {item.description}
                          </NativeText>
                        )}
                      </NativeItem>
                    )
                )}
              </NativeList>
            </View>
          ))}
        </View>

        <InsetsBottomView />
      </View>
    </ScrollView>
  );
};

export default GradeDocument;
