import { NativeItem, NativeList, NativeListHeader } from "@/components/Global/NativeComponents";
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
import { FadeInDown, FadeOut } from "react-native-reanimated";
import MissingItem from "@/components/Global/MissingItem";

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

  const startTime = Date.now() / 1000;
  const endTime = startTime + 7 * 24 * 60 * 60 * 1000;

  const hwSemaineActuelle = homeworks[dateToEpochWeekNumber(actualDay)]?.filter(
    (hw) => hw.due / 1000 >= startTime && hw.due / 1000 <= endTime
  ) ?? [];
  const truncateContent = (content: string) => {
    if (content.length <= 120) {
      return content;
    }
    const truncated = content.slice(0, 120);
    const lastSpaceIndex = truncated.lastIndexOf(" ");
    return `${truncated.slice(0, lastSpaceIndex)}...`;
  };
  hwSemaineActuelle.forEach(hw => {
    hw.content = truncateContent(hw.content);
  });
  const hwSemaineProchaine = homeworks[dateToEpochWeekNumber(actualDay) + 1]?.filter(
    (hw) => hw.due / 1000 >= startTime && hw.due / 1000 <= endTime
  ) ?? [];

  if (hwSemaineActuelle.length === 0 && hwSemaineProchaine.length === 0) {
    return (
      <>
        <NativeListHeader animated label="Travail à faire"
          trailing={(
            <RedirectButton navigation={PapillonNavigation.current} redirect="Homeworks" />
          )}
        />
        <NativeList
          animated
          key="emptyHomeworks"
          entering={FadeInDown.springify().mass(1).damping(20).stiffness(300)}
          exiting={FadeOut.duration(300)}
        >
          <NativeItem animated style={{ paddingVertical: 10 }}>
            <MissingItem
              emoji="📚"
              title="Aucun devoir"
              description="Tu n'as aucun devoir pour ces deux prochaines semaines."
            />
          </NativeItem>
        </NativeList>
      </>
    );
  }

  return (
    <>
      <NativeListHeader animated label="Travail à faire"
        trailing={(
          <RedirectButton navigation={PapillonNavigation.current} redirect="Homeworks" />
        )}
      />
      <NativeList>
        {hwSemaineActuelle.map((hw, index) => (
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
        {new Date().getDay() >= 2 && hwSemaineProchaine.map((hw, index) => (
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
