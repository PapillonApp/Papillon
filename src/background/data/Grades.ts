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

  await papillonNotify(
    {
      id: "statusBackground",
      title: account.name,
      body: "Récupération des dernières notes...",
      android: {
        progress: {
          max: 100,
          current: 100 / 6 * 3,
          indeterminate: false,
        },
      },
    },
    "Status"
  );

  const { defaultPeriod, grades } = getGrades();
  await updateGradeState(account, defaultPeriod);
  const updatedGrade = getGrades().grades[defaultPeriod];

  const differences = getDifferences(
    grades[defaultPeriod] ?? [],
    updatedGrade ?? []
  );

  if (notificationsTypesPermissions?.grades) {
    switch (differences.length) {
      case 0:
        break;
      case 1:
        await papillonNotify(
          {
            id: `${account.name}-grades`,
            title: `[${account.name}] Nouvelle note`,
            subtitle: defaultPeriod,
            body: `Une nouvelle note en ${differences[0].subjectName} a été publiée`,
          },
          "Grades"
        );
        break;
      default:
        await papillonNotify(
          {
            id: `${account.name}-grades`,
            subtitle: defaultPeriod,
            title: `[${account.name}] Nouvelles notes`,
            body: `
            ${differences.length} nouvelles notes ont été publiées :<br />
            ${differences
              .flatMap((element) => {
                return `- ${element.subjectName}`;
              })
              .join("<br />")}
            `,
          },
          "Grades"
        );
        break;
    }
  }

  return updatedGrade;
};

export { fetchGrade };
