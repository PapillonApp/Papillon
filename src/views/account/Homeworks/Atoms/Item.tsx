import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Paperclip } from "lucide-react-native";
import { getSubjectData } from "@/services/shared/Subject";
import { useTheme } from "@react-navigation/native";
import { NativeItem, NativeText } from "@/components/Global/NativeComponents";
import PapillonCheckbox from "@/components/Global/PapillonCheckbox";
import Reanimated, { LinearTransition } from "react-native-reanimated";
import { FadeIn, FadeOut } from "react-native-reanimated";
import { animPapillon } from "@/utils/ui/animations";
import RenderHTML from "react-native-render-html";
import {View} from "react-native";
import { HomeworkReturnType } from "@/services/shared/Homework";
import { differenceInDays } from "date-fns";

const HomeworkItem = ({ homework, navigation, onDonePressHandler, index, total, showSubjectName, groupBySubject }) => {
  const theme = useTheme();
  const [subjectData, setSubjectData] = useState(getSubjectData(homework.subject));

  useEffect(() => {
    const data = getSubjectData(homework.subject);
    setSubjectData(data);
  }, [homework.subject]);

  const [isLoading, setIsLoading] = useState(false);

  const handlePress = useCallback(() => {
    setIsLoading(true);
    onDonePressHandler();
  }, [onDonePressHandler]);

  const [mainLoaded, setMainLoaded] = useState(false);

  useEffect(() => {
    setIsLoading(false);
    setMainLoaded(true);
  }, [homework.done]);

  const daysRemaining = useMemo(() => {
    const today = new Date();
    const dueDate = new Date(homework.due);
    return differenceInDays(dueDate, today);
  }, [homework.due]);

  const getDaysRemainingText = () => {
    if (daysRemaining === 0) return "Ajd";
    if (daysRemaining === 1) return "Dem";
    if (daysRemaining < 0) return `-${Math.abs(daysRemaining)}`;
    return `${daysRemaining}j`;
  };

  return (
    <NativeItem
      animated
      onPress={() => navigation.navigate("HomeworksDocument", { homework })}
      chevron={false}
      key={homework.content}
      entering={FadeIn}
      exiting={FadeOut}
      separator={index !== total - 1}
      leading={
        <Reanimated.View
          layout={animPapillon(LinearTransition)}
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <PapillonCheckbox
            checked={homework.done}
            loading={isLoading}
            onPress={handlePress}
            style={{ marginRight: 1 }}
            color={subjectData.color}
            loaded={mainLoaded}
          />
        </Reanimated.View>
      }
    >
      <Reanimated.View
        layout={animPapillon(LinearTransition)}
        style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
      >
        <Reanimated.View style={{ flex: 1, gap: 4 }} layout={animPapillon(LinearTransition)}>
          {showSubjectName && (
            <View style={{ flexDirection: "row", gap: 10, alignItems: "center", justifyContent: "space-between" }}>
              <NativeText variant="overtitle" style={{ color: subjectData.color, flex: 1 }} numberOfLines={1}>
                {homework.subject}
              </NativeText>
              {homework.returnType && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 4,
                    backgroundColor: theme.colors.text + "11",
                    paddingVertical: 3,
                    marginVertical: -1,
                    paddingHorizontal: 8,
                    borderRadius: 8,
                  }}
                >
                  <NativeText variant="subtitle" style={{ opacity: 0.8 }} numberOfLines={1}>
                    {homework.returnType === HomeworkReturnType.FileUpload
                      ? "À rendre sur l'ENT"
                      : homework.returnType === HomeworkReturnType.Paper
                        ? "À rendre en classe"
                        : null}
                  </NativeText>
                </View>
              )}
            </View>
          )}
          <Reanimated.View
            layout={animPapillon(LinearTransition)}
            key={homework.content}
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200).delay(50)}
            style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
          >
            <View style={{ flex: 1 }}>
              <RenderHTML
                source={{ html: homework.content }}
                defaultTextProps={{
                  style: {
                    color: theme.colors.text,
                    fontFamily: "medium",
                    fontSize: 16,
                    lineHeight: 22,
                  },
                  numberOfLines: 3,
                }}
                contentWidth={300}
              />
            </View>
            {groupBySubject && (
              <View style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: subjectData.color + "20",
                justifyContent: "center",
                alignItems: "center",
                marginLeft: 8,
              }}>
                <NativeText
                  variant="caption"
                  style={{
                    color: subjectData.color,
                    fontWeight: "bold",
                    fontSize: 15,
                  }}
                >
                  {getDaysRemainingText()}
                </NativeText>
              </View>
            )}
          </Reanimated.View>
          {homework.attachments.length > 0 && (
            <Reanimated.View
              layout={animPapillon(LinearTransition)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                marginTop: 4,
                borderWidth: 1,
                alignSelf: "flex-start",
                borderColor: theme.colors.text + "33",
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 9,
                borderCurve: "continuous",
                marginRight: 16,
              }}
            >
              <Paperclip
                size={18}
                strokeWidth={2.5}
                opacity={0.6}
                color={theme.colors.text}
              />
              <NativeText variant="subtitle" numberOfLines={1}>
                {homework.attachments.length > 1 ?
                  `${homework.attachments.length} pièces jointes` :
                  homework.attachments[0].name
                }
              </NativeText>
            </Reanimated.View>
          )}
        </Reanimated.View>
      </Reanimated.View>
    </NativeItem>
  );
};

export default HomeworkItem;