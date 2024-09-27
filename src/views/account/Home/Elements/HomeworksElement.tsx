import { NativeList, NativeListHeader } from "@/components/Global/NativeComponents";
import { useCurrentAccount } from "@/stores/account";
import { AccountService } from "@/stores/account/types";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useHomeworkStore } from "@/stores/homework";
import { toggleHomeworkState, updateHomeworkForWeekInCache } from "@/services/homework";
import HomeworkItem from "../../Homeworks/Atoms/Item";
import { Homework } from "@/services/shared/Homework";
import { debounce } from "lodash";
import { PapillonNavigation } from "@/router/refs";
import RedirectButton from "@/components/Home/RedirectButton";
import { dateToEpochWeekNumber } from "@/utils/epochWeekNumber";

const HomeworksElement = ({ navigation }) => {
  const account = useCurrentAccount(store => store.account!);
  const homeworks = useHomeworkStore(store => store.homeworks);

  const actualDay = useMemo(()=>new Date(), []);

  const updateHomeworks = useCallback(async () => {
    await updateHomeworkForWeekInCache(account, actualDay);
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

  if (!homeworks[dateToEpochWeekNumber(actualDay)] || homeworks[dateToEpochWeekNumber(actualDay)]?.filter(hw => new Date(hw.due).getDate() === actualDay.getDate()).length === 0) {
    return null;
  }
  const startTime = Date.now() / 1000; // Convertir en millisecondes
  const endTime = startTime + 7 * 24 * 60 * 60 * 1000; // Ajouter 7 jours en millisecondes

  return (
    <>
      <NativeListHeader animated label="Travail à faire"
        trailing={(
          <RedirectButton navigation={PapillonNavigation.current} redirect="Homeworks" />
        )}
      />
      <NativeList>
        {homeworks[dateToEpochWeekNumber(actualDay)]?.filter(hw => hw.due / 1000 >= startTime && hw.due / 1000 <= endTime).map((hw, index) => (
          <HomeworkItem
            navigation={navigation}
            homework={hw}
            key={index}
            index={index}
            total={homeworks[dateToEpochWeekNumber(actualDay) + 1]?.length || 0}
            onDonePressHandler={() => {
              handleDonePress(hw);
            }}
            showSubjectName={true}
            groupBySubject={true}
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
            showSubjectName={true}
            groupBySubject={true}
          />
        ))}
      </NativeList>
    </>
  );
};

export default HomeworksElement;
