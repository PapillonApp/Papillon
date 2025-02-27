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

  const { defaultPeriod, evaluation } = getEvaluation();
  if (!notificationsTypesPermissions?.evaluation) {
    return evaluation[defaultPeriod];
  }

  if (__DEV__) {
    await papillonNotify(
      {
        id: "statusBackground",
        title: account.name,
        body: "Récupération des dernières compétences...",
        android: {
          progress: {
            max: 100,
            current: (100 / 6) * 6,
            indeterminate: false,
          },
        },
      },
      "Status"
    );
  }

  await updateEvaluationState(account, defaultPeriod);
  const updatedEvaluation = getEvaluation().evaluation[defaultPeriod];

  const differences = getDifferences(
    evaluation[defaultPeriod] ?? [],
    updatedEvaluation ?? []
  );

  switch (differences.length) {
    case 0:
      break;
    case 1:
      await papillonNotify(
        {
          id: `${account.name}-evaluation`,
          title: `[${account.name}] Nouvelle compétence en ${differences[0].subjectName}`,
          subtitle: defaultPeriod,
          body: `Titre : ${
            differences[0].description || "Compétence sans titre"
          }, Coefficient : ${differences[0].coefficient}`,
          data: {
            accountID: account.localID,
            page: "Evaluation"
          }
        },
        "Evaluation"
      );
      break;
    default:
      const evaluationCounts: Record<string, number> = {};

      differences.forEach((grade) => {
        evaluationCounts[grade.subjectName] =
            (evaluationCounts[grade.subjectName] || 0) + 1;
      });

      const evaluationPreview = Object.entries(evaluationCounts)
        .map(([subject, count]) =>
          count > 1 ? `${count}x ${subject}` : subject
        )
        .join(", ");

      await papillonNotify(
        {
          id: `${account.name}-evaluation`,
          subtitle: defaultPeriod,
          title: `[${account.name}] Nouvelles compétences`,
          body: `
            ${differences.length} nouvelles compétences :<br />
            ${evaluationPreview}
            `,
          data: {
            accountID: account.localID,
            page: "Evaluation"
          }
        },
        "Evaluation"
      );
      break;
  }
  return updatedEvaluation;
};

export { fetchEvaluation };
