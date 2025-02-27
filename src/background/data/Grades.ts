import { getCurrentAccount } from "../utils/accounts";
import { papillonNotify } from "../Notifications";
import { Grade } from "@/services/shared/Grade";
import { getGrades, updateGradeState } from "../utils/grades";

const getDifferences = (
  currentGrade: Grade[],
  updatedGrade: Grade[]
): Grade[] => {
  return updatedGrade.filter(
    (updatedItem) =>
      !currentGrade.some(
        (item) =>
          item.student.value === updatedItem.student.value &&
          item.coefficient === updatedItem.coefficient
      )
  );
};

const fetchGrade = async (): Promise<Grade[]> => {
  const account = getCurrentAccount();
  const notificationsTypesPermissions = account.personalization.notifications;

  const { defaultPeriod, grades } = getGrades();
  if (!notificationsTypesPermissions?.grades) {
    return grades[defaultPeriod];
  }

  if (__DEV__) {
    await papillonNotify(
      {
        id: "statusBackground",
        title: account.name,
        body: "Récupération des dernières notes...",
        android: {
          progress: {
            max: 100,
            current: (100 / 6) * 3,
            indeterminate: false,
          },
        },
      },
      "Status"
    );
  }

  await updateGradeState(account, defaultPeriod);
  const updatedGrade = getGrades().grades[defaultPeriod];

  const differences = getDifferences(
    grades[defaultPeriod] ?? [],
    updatedGrade ?? []
  );

  switch (differences.length) {
    case 0:
      break;
    case 1:
      await papillonNotify(
        {
          id: `${account.name}-grades`,
          title: `[${account.name}] Nouvelle note en ${differences[0].subjectName}`,
          subtitle: defaultPeriod,
          body: `Titre : ${
            differences[0].description || "Note sans titre"
          }, Coefficient : ${differences[0].coefficient}`,
          data: {
            accountID: account.localID,
            page: "Grades"
          }
        },
        "Grades"
      );
      break;
    default:
      const gradeCounts: Record<string, number> = {};

      differences.forEach((grade) => {
        gradeCounts[grade.subjectName] =
            (gradeCounts[grade.subjectName] || 0) + 1;
      });

      const gradePreview = Object.entries(gradeCounts)
        .map(([subject, count]) =>
          count > 1 ? `${count}x ${subject}` : subject
        )
        .join(", ");

      await papillonNotify(
        {
          id: `${account.name}-grades`,
          subtitle: defaultPeriod,
          title: `[${account.name}] Nouvelles notes`,
          body: `
            ${differences.length} nouvelles notes :<br />
            ${gradePreview}
            `,
          data: {
            accountID: account.localID,
            page: "Grades"
          }
        },
        "Grades"
      );
      break;
  }
  return updatedGrade;
};

export { fetchGrade };
