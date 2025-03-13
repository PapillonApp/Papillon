import { NativeItem, NativeList, NativeListHeader } from "@/components/Global/NativeComponents";
import { PapillonNavigation } from "@/router/refs";
import { updateGradesAndAveragesInCache, updateGradesPeriodsInCache } from "@/services/grades";
import { useCurrentAccount } from "@/stores/account";
import { useGradesStore } from "@/stores/grades";
import React, { useEffect, useState } from "react";
import GradeItem from "../../Grades/Subject/GradeItem";
import type { Grade } from "@/services/shared/Grade";
import RedirectButton from "@/components/Home/RedirectButton";
import { FadeInDown, FadeOut } from "react-native-reanimated";
import MissingItem from "@/components/Global/MissingItem";

interface GradesElementProps {
  onImportance: (value: number) => unknown
}

const GradesElement: React.FC<GradesElementProps> = ({ onImportance }) => {
  const account = useCurrentAccount((store) => store.account);

  const defaultPeriod = useGradesStore(store => store.defaultPeriod);
  const grades = useGradesStore((store) => store.grades);

  const [loading, setLoading] = useState(false);

  const ImportanceHandler = () => {
    if (grades && grades[defaultPeriod] && grades[defaultPeriod].length > 0) {
      let score = 0;
      let date = new Date();
      let lastGradeDate = new Date(grades[defaultPeriod][0].timestamp);
      let difference = Math.floor((Math.abs(date.getTime() - lastGradeDate.getTime())) / (1000 * 3600 * 24));
      score += 3 - difference;
      if (score < 0) {
        score = 0;
      }
      onImportance(score);
    } else {
      onImportance(0);
    }
  };

  useEffect(() => {
    void async function () {
      if (account?.instance) {
        setLoading(true);
        await updateGradesPeriodsInCache(account);
        if (defaultPeriod) {
          await updateGradesAndAveragesInCache(account, defaultPeriod);
        }
        setLoading(false);
      }
    }();
  }, [account?.instance]);

  const [lastThreeGrades, setLastThreeGrades] = useState<Array<{
    subject: { average: { subjectName: string }, grades: any[] },
    grade: Grade
  }>>([]);

  useEffect(() => {
    if (grades && grades[defaultPeriod]) {
      const lastThree = [...grades[defaultPeriod]]
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 3)
        .map((grade) => ({
          subject: { average: { subjectName: grade.subjectName }, grades: [] },
          grade
        }));

      setLastThreeGrades(lastThree);
      ImportanceHandler();
    }
  }, [grades]);

  if (loading) {
    return (
      <>
        <NativeListHeader animated label="Notes"
          trailing={(
            <RedirectButton navigation={PapillonNavigation.current} redirect="Grades" />
          )}
        />
        <NativeList
          animated
          key="loadingGrades"
          entering={FadeInDown.springify().mass(1).damping(20).stiffness(300)}
          exiting={FadeOut.duration(300)}
        >
          <NativeItem animated style={{ paddingVertical: 10 }}>
            <MissingItem
              emoji="⏳"
              title="Chargement des notes"
              description="Patiente, s'il te plaît..."
            />
          </NativeItem>
        </NativeList>
      </>
    );
  }

  if (!grades || lastThreeGrades.length === 0) {
    return (
      <NativeList
        animated
        key="emptyGrades"
        entering={FadeInDown.springify().mass(1).damping(20).stiffness(300)}
        exiting={FadeOut.duration(300)}
      >
        <NativeItem animated style={{ paddingVertical: 10 }}>
          <MissingItem
            style={{ marginHorizontal: 16 }}
            emoji="📊"
            title="Aucune note disponible"
            description={
              defaultPeriod
                ? `Tu n'as aucune note au ${defaultPeriod.toLowerCase()}.`
                : "Tu n'as aucune note pour cette période."
            }
          />
        </NativeItem>
      </NativeList>
    );
  }

  return (
    <>
      <NativeListHeader label="Dernières Notes"
        trailing={(
          <RedirectButton navigation={PapillonNavigation.current} redirect="Grades" />
        )}
      />
      <NativeList
        animated
      >
        {lastThreeGrades.map((item, index) => (
          <GradeItem
            key={index}
            subject={item.subject}
            grade={item.grade}
            navigation={PapillonNavigation.current}
            index={index}
            totalItems={lastThreeGrades.length}
            allGrades={grades[defaultPeriod] || []}
          />
        ))}
      </NativeList>
    </>
  );
};

export default GradesElement;
