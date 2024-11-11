import { NativeList, NativeListHeader } from "@/components/Global/NativeComponents";
import { useCurrentAccount } from "@/stores/account";
import React, { useCallback, useEffect, useMemo } from "react";
import { useHomeworkStore } from "@/stores/homework";
import { toggleHomeworkState, updateHomeworkForWeekInCache } from "@/services/homework";
import HomeworkItem from "../../Homeworks/Atoms/Item";
import type { Homework } from "@/services/shared/Homework";
import {debounce} from "lodash";
import { PapillonNavigation } from "@/router/refs";
import RedirectButton from "@/components/Home/RedirectButton";
import { dateToEpochWeekNumber } from "@/utils/epochWeekNumber";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {RouteParameters} from "@/router/helpers/types";

interface HomeworksElementProps {
  onImportance: (value: number) => unknown
  navigation: NativeStackNavigationProp<RouteParameters, "HomeScreen", undefined>
}

const HomeworksElement: React.FC<HomeworksElementProps> = ({ navigation, onImportance }) => {
  const account = useCurrentAccount(store => store.account!);
  const homeworks = useHomeworkStore(store => store.homeworks);

  const actualDay = useMemo(()=>new Date(), []);

  const ImportanceHandler = () => {
    if (!homeworks[dateToEpochWeekNumber(actualDay)]) return;

    let score = 0;
    const hw = homeworks[dateToEpochWeekNumber(actualDay)]
      .filter(hw => hw.due / 1000 >= Date.now() / 1000 && hw.due / 1000 <= Date.now() / 1000 + 7 * 24 * 60 * 60)
      .filter(hw => !hw.done);

    const date = new Date();
    if (date.getHours() >= 17 && date.getHours() < 22)
      score += 4;
    if (hw.length > 0)
      score += 3;
    onImportance(score);
  };

  const updateHomeworks = useCallback(async () => {
    await updateHomeworkForWeekInCache(account, actualDay);
    ImportanceHandler();
  }, [account, actualDay]);

  const debouncedUpdateHomeworks = useMemo(() => debounce(updateHomeworks, 500), [updateHomeworks]);

  useEffect(() => {
    debouncedUpdateHomeworks();
  }, [account.instance, actualDay]);

  const handleDonePress = useCallback(
    async (homework: Homework) => {
      await toggleHomeworkState(account, homework);
      await updateHomeworks();
    },
    [account, updateHomeworks]
  );

  if (
    !homeworks[dateToEpochWeekNumber(actualDay)]?.filter(
      (hw) => hw.due / 1000 >= startTime && hw.due / 1000 <= endTime
    ) &&
    !homeworks[dateToEpochWeekNumber(actualDay) + 1]?.filter(
      (hw) => hw.due / 1000 >= startTime && hw.due / 1000 <= endTime
    )
  ) {
    return null;
  }
  const startTime = Date.now() / 1000; // Convertir en millisecondes
  const endTime = startTime + 7 * 24 * 60 * 60 * 1000; // Ajouter 7 jours en millisecondes

  const hwFinalList = homeworks[dateToEpochWeekNumber(actualDay)]?.filter(hw => hw.due / 1000 >= startTime && hw.due / 1000 <= endTime);

  if(hwFinalList.length === 0) {
    return null;
  }

  return (
    <>
      <NativeListHeader animated label="Travail à faire"
        trailing={(
          <RedirectButton navigation={PapillonNavigation.current} redirect="Homeworks" />
        )}
      />
      <NativeList>
        {hwFinalList.map((hw, index) => (
          <HomeworkItem
            navigation={navigation}
            homework={hw}
            key={index}
            index={index}
            total={homeworks[dateToEpochWeekNumber(actualDay) + 1]?.length || 0}
            onDonePressHandler={() => {
              handleDonePress(hw);
            }}
          />
        ))}
        {new Date().getDay() >= 2 && homeworks[dateToEpochWeekNumber(actualDay) + 1]?.filter(hw => hw.due / 1000 >= startTime && hw.due / 1000 <= endTime).map((hw, index) => (
          <HomeworkItem
            homework={hw}
            key={index}
            index={index}
            navigation={navigation}
            total={homeworks[dateToEpochWeekNumber(actualDay) + 1].length}
            onDonePressHandler={() => {
              handleDonePress(hw);
            }}
          />
        ))}
      </NativeList>
    </>
  );
};

export default HomeworksElement;
