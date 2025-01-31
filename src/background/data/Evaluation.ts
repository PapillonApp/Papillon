import { getCurrentAccount } from "../utils/accounts";
import { papillonNotify } from "../Notifications";
import { Evaluation } from "@/services/shared/Evaluation";
import { getEvaluation, updateEvaluationState } from "../utils/evaluation";

const getDifferences = (
  currentEvaluation: Evaluation[],
  updatedEvaluation: Evaluation[]
): Evaluation[] => {
  return updatedEvaluation.filter(
    (updatedItem) =>
      !currentEvaluation.some(
        (item) =>
          item.levels === updatedItem.levels &&
          item.coefficient === updatedItem.coefficient
      )
  );
};

const fetchEvaluation = async (): Promise<Evaluation[]> => {
  const account = getCurrentAccount();
  const notificationsTypesPermissions = account.personalization.notifications;

  await papillonNotify(
    {
      id: "statusBackground",
      title: account.name,
      body: "Récupération des dernières compétences...",
      android: {
        progress: {
          max: 100,
          current: 100 / 6 * 6,
          indeterminate: false,
        },
      },
    },
    "Status"
  );

  const { defaultPeriod, evaluation } = getEvaluation();
  await updateEvaluationState(account, defaultPeriod);
  const updatedEvaluation = getEvaluation().evaluation[defaultPeriod];

  const differences = getDifferences(
    evaluation[defaultPeriod] ?? [],
    updatedEvaluation ?? []
  );

  if (notificationsTypesPermissions?.evaluation) {
    switch (differences.length) {
      case 0:
        break;
      case 1:
        await papillonNotify(
          {
            id: `${account.name}-evaluation`,
            title: `[${account.name}] Nouvelle compétence`,
            subtitle: defaultPeriod,
            body: `Une nouvelle compétence en ${differences[0].subjectName} a été publiée`,
          },
          "Evaluation"
        );
        break;
      default:
        await papillonNotify(
          {
            id: `${account.name}-evaluation`,
            subtitle: defaultPeriod,
            title: `[${account.name}] Nouvelles compétences`,
            body: `
            ${differences.length} nouvelles compétences ont été publiées :<br />
            ${differences
              .flatMap((element) => {
                return `- ${element.subjectName}`;
              })
              .join("<br />")}
            `,
          },
          "Evaluation"
        );
        break;
    }
  }

  return updatedEvaluation;
};

export { fetchEvaluation };
