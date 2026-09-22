import React from "react";
import { View } from "react-native";

import { useSettingsStore } from "@/stores/settings";
import { getGradeDisplayScale } from "@/utils/grades/scale";
import Averages from "../../grades/atoms/Averages";
import { UseGradesDataResult } from "../../grades/hooks/useGradesData";

type GradesWidgetProps = {
  history: UseGradesDataResult["history"];
  averages: UseGradesDataResult["averages"];
};

// The data lives in HomeScreen: the widget is only mounted once there are grades,
// so it can't be the one deciding whether it should be shown.
const GradesWidget = ({ history, averages }: GradesWidgetProps) => {
  const displayScale = getGradeDisplayScale(useSettingsStore(state => state.personalization.gradesDisplayScale));

  return (
    <View style={{ width: "100%" }}>
      <Averages compact history={history} realAverage={averages.student?.value} displayScale={displayScale} />
    </View>
  );
};

export default GradesWidget;
