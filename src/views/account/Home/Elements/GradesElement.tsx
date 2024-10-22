import {
  NativeList,
  NativeListHeader,
} from "@/components/Global/NativeComponents";
import { PapillonNavigation } from "@/router/refs";
import {
  updateGradesAndAveragesInCache,
  updateGradesPeriodsInCache,
} from "@/services/grades";
import { useCurrentAccount } from "@/stores/account";
import { useGradesStore } from "@/stores/grades";
import React, { useEffect, useMemo, useState } from "react";
import GradeItem from "../../Grades/Subject/GradeItem";
import type { Grade } from "@/services/shared/Grade";
import RedirectButton from "@/components/Home/RedirectButton";

const GradesElement: React.FC = () => {
  const account = useCurrentAccount((store) => store.account!);
  const periods = useGradesStore((store) => store.periods);

  const defaultPeriod = useGradesStore((store) => store.defaultPeriod);
  const grades = useGradesStore((store) => store.grades);
  const [userSelectedPeriod, setUserSelectedPeriod] = useState<string | null>(
    null
  );
  const selectedPeriod = useMemo(
    () => userSelectedPeriod ?? defaultPeriod,
    [userSelectedPeriod, defaultPeriod]
  );

  useEffect(() => {
    setTimeout(() => {
      if (!periods.map((period) => period.name).includes(selectedPeriod)) {
        setUserSelectedPeriod(defaultPeriod);
      }
    }, 0);
  }, [account.instance, defaultPeriod]);

  useEffect(() => {
    void (async function () {
      if (!account?.instance) return;
      await updateGradesPeriodsInCache(account);
    })();
  }, [account?.instance]);

  useEffect(() => {
    void (async function () {
      if (!account?.instance || !defaultPeriod) return;
      await updateGradesAndAveragesInCache(account, defaultPeriod);
    })();
  }, [defaultPeriod]);

  const [lastThreeGrades, setLastThreeGrades] = useState<
    Array<{
      subject: { average: { subjectName: string }; grades: any[] };
      grade: Grade;
    }>
  >([]);

  useEffect(() => {
    if (grades && grades[defaultPeriod]) {
      const lastThree = [...grades[defaultPeriod]]
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 3)
        .map((grade) => ({
          subject: { average: { subjectName: grade.subjectName }, grades: [] },
          grade,
        }));

      setLastThreeGrades(lastThree);
    }
  }, [grades]);

  if (!grades || lastThreeGrades.length === 0) {
    return null;
  }

  return (
    <>
      <NativeListHeader
        label="Dernières Notes"
        trailing={
          <RedirectButton
            navigation={PapillonNavigation.current}
            redirect="Grades"
          />
        }
      />
      <NativeList animated>
        {lastThreeGrades.map((item, index) => (
          <GradeItem
            key={index}
            subject={item.subject}
            grade={item.grade}
            navigation={PapillonNavigation.current}
            index={index}
            totalItems={lastThreeGrades.length}
            allGrades={grades[selectedPeriod]}
          />
        ))}
      </NativeList>
    </>
  );
};

export default GradesElement;
