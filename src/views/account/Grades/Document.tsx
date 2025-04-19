import React from "react";
import { NativeItem, NativeList, NativeListHeader, NativeText, } from "@/components/Global/NativeComponents";
import { getSubjectData } from "@/services/shared/Subject";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { Image, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import * as StoreReview from "expo-store-review";
import {
  Asterisk,
  Calculator,
  Scale,
  School,
  UserMinus,
  UserPlus,
  Users,
  Maximize2
} from "lucide-react-native";
import { getAverageDiffGrade } from "@/utils/grades/getAverages";
import type { AverageDiffGrade } from "@/utils/grades/getAverages";
import { Screen } from "@/router/helpers/types";
import InsetsBottomView from "@/components/Global/InsetsBottomView";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useGradesStore } from "@/stores/grades";
import { LinearGradient } from "expo-linear-gradient";
import AnimatedEmoji from "@/components/Grades/AnimatedEmoji";
import GradeModal from "@/components/Grades/GradeModal";


const GradeDocument: Screen<"GradeDocument"> = ({ route, navigation }) => {
  const { grade, allGrades = [] } = route.params;
  const theme = useTheme();
  const [modalOpen, setModalOpen] = useState(false);
  const [isReactionBeingTaken, setIsReactionBeingTaken] = useState(false);

  const [subjectData, setSubjectData] = useState({
    color: "#888888",
    pretty: "Matière inconnue",
    emoji: "❓",
  });

  const [shouldShowReviewOnClose, setShouldShowReviewOnClose] = useState(false);
  const currentReel = useGradesStore((state) => state.reels[grade.id]);
  const reels = useGradesStore((state) => state.reels);

  const askForReview = async () => {
    StoreReview.isAvailableAsync().then((available) => {
      if (available) {
        StoreReview.requestReview();
      }
    });
  };

  useEffect(() => {
    navigation.addListener("beforeRemove", () => {
      if (shouldShowReviewOnClose) {
        AsyncStorage.getItem("review_given").then((value) => {
          if(!value) {
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
    );
    const cD = getAverageDiffGrade(
      [grade],
      allGrades,
      "average"
    );

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
      ].filter((value) => value.value != "??"),
    },
    {
      title: "Influence",
      items: [
        !grade.student.disabled && {
          icon: <Scale />,
          title: "Moyenne générale",
          description: "Impact estimé sur la moyenne générale",
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
          description: "Impact estimé sur la moyenne de la classe",
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

  const deleteReel = (reelId: string) => {
    useGradesStore.setState((store) => {
      const updatedReels = { ...store.reels };
      delete updatedReels[reelId];
      return { reels: updatedReels };
    });
    setModalOpen(false);
  };

  const handleFocus = useCallback(() => {
    // Si on revient de la page de réaction et qu'on a un reel
    if (currentReel && isReactionBeingTaken) {
      setModalOpen(true);
      setIsReactionBeingTaken(false);
    }
  }, [currentReel]);

  useEffect(() => {
    return navigation.addListener("focus", handleFocus);
  }, [navigation, handleFocus]);

  return (
    <View style={{ flex: 1 }}>
      {reels[grade.id] &&
            <GradeModal
              isVisible={modalOpen}
              reel={reels[grade.id]}
              onClose={() => setModalOpen(false)}
              DeleteGrade={() => deleteReel(grade.id)}
            />
      }
      <View style={{ borderCurve: "continuous", minHeight: 180, backgroundColor: "#000000" }}>
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 15,
            opacity: 0.90,
            backgroundColor: subjectData.color,
          }}
        >
          {currentReel ? (
            <>
              <Image
                source={{ uri: `data:image/jpeg;base64,${currentReel.imagewithouteffect}` }}
                style={{
                  position: "absolute",
                  top: -20,
                  right: 0,
                  width: "50%",
                  height: 250,
                  zIndex: 1,
                  transform: [{ scaleX: -1 }],
                }}
              />
              <LinearGradient
                colors={[subjectData.color + "20", subjectData.color]}
                start={[0.7, 0]}
                end={[0, 0]}
                style={{
                  position: "absolute",
                  top: 0,
                  left: "50%",
                  bottom: 0,
                  width: "50%",
                  zIndex: 1,
                }}
              />
            </>
          ) : null}

          <Image
            source={require("../../../../assets/images/mask_stars_settings.png")}
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              objectFit: "cover",
              tintColor: "#ffffff",
              opacity: 0.15,
              zIndex: 1,
            }}
          />
        </View>
        <View style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 20,
        }}>
          {Platform.OS === "ios" && (
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
          )}
          {!reels[grade.id] ? (
            <TouchableOpacity
              style={{
                position: "absolute",
                bottom: 20,
                right: 20,
                paddingHorizontal: 10,
                paddingVertical: 8,
                borderRadius: 100,
                backgroundColor: "#00000043",
                zIndex: 50,
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                gap: 4,
              }}
              onPress={() => {
                setIsReactionBeingTaken(true);
                navigation.navigate("GradeReaction", { grade });
              }}
            >
              <AnimatedEmoji />
              <Text style={{ color: "#FFFFFF", fontSize: 15, fontFamily: "semibold", textAlign: "center", textAlignVertical: "center"  }}>
                RÉAGIR
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={{
                position: "absolute",
                top: 20,
                right: 20,
                padding: 8,
                borderRadius: 100,
                backgroundColor: "#00000043",
                zIndex: 50,
              }}
              onPress={() => setModalOpen(true)}
            >
              <Maximize2 color="white" />
            </TouchableOpacity>
          )}
          <View
            style={{
              paddingHorizontal: 16,
              paddingVertical: 16,
              gap: 6,
              flex: 1,
              justifyContent: "flex-end",
              zIndex: 30,
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
                {grade.student.disabled ? grade.student.status : grade.student.value?.toFixed(2)}
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
      </View>

      {/* Scrollable Content */}
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        style={{
          flex: 1,
          width: "100%",
          backgroundColor: theme.colors.background,
          borderCurve: "continuous",
          overflow: "hidden",
        }}
        contentContainerStyle={{
          width: "100%",
        }}
      >
        <View style={{ paddingHorizontal: 16 }}>
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
                                color: "color" in item ? item.color : theme.colors.text,
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
      </ScrollView>
    </View>
  );
};

export default GradeDocument;
