import React, { useEffect } from "react";
import { View } from "react-native";

import { useSettingsStore } from "@/stores/settings";
import { getGradeDisplayScale } from "@/utils/grades/scale";
import { error } from "@/utils/logger/logger";
import Averages from "../../grades/atoms/Averages";
import { usePeriodsData } from "../../grades/hooks/usePeriodsData";
import { useGradesData } from "../../grades/hooks/useGradesData";

type GradesWidgetProps = {
  onEmptyStateChange?: (isEmpty: boolean) => void;
};

const GradesWidget = ({ onEmptyStateChange }: GradesWidgetProps) => {
  try {
    const { currentPeriod } = usePeriodsData();
    const { grades, history, averages } = useGradesData(currentPeriod);
    const displayScale = getGradeDisplayScale(useSettingsStore(state => state.personalization.gradesDisplayScale));

    useEffect(() => {
      onEmptyStateChange?.(grades.length === 0);
    }, [grades.length, onEmptyStateChange]);

    if (grades.length === 0) {
      return null;
    }

    return (
      <View style={{ width: "100%" }}>
        <Averages history={history} realAverage={averages.student?.value} displayScale={displayScale} />
      </View>
    );
  } catch (err) {
    error(`Error in GradesWidget: ${err}`);
    return null;
  }
};

export default GradesWidget;
