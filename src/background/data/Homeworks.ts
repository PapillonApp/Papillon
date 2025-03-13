import { getCurrentAccount } from "../utils/accounts";
import { papillonNotify } from "../Notifications";
import { getHomeworks, updateHomeworksState } from "../utils/homeworks";
import { Homework } from "@/services/shared/Homework";
import { dateToEpochWeekNumber } from "@/utils/epochWeekNumber";
import parse_homeworks from "@/utils/format/format_pronote_homeworks";

const getDifferences = (
  currentHomeworks: Homework[],
  updatedHomeworks: Homework[]
): Homework[] => {
  return updatedHomeworks.filter(
    (updatedItem) =>
      !currentHomeworks.some(
        (item) =>
          item.due === updatedItem.due && item.content === updatedItem.content
      )
  );
};

const fetchHomeworks = async (): Promise<Homework[]> => {
  const account = getCurrentAccount();
  const notificationsTypesPermissions = account.personalization.notifications;

  // @ts-expect-error
  let firstDate = account.instance?.instance?.firstDate || null;
  if (!firstDate) {
    firstDate = new Date();
    firstDate.setMonth(8);
    firstDate.setDate(1);
  }
  const firstDateEpoch = dateToEpochWeekNumber(firstDate);

  const SemaineAct = dateToEpochWeekNumber(new Date());
  const currentHwSemaineActuelle = getHomeworks()[SemaineAct] ?? [];
  if (!notificationsTypesPermissions?.homeworks) {
    return currentHwSemaineActuelle;
  }

  if (__DEV__) {
    await papillonNotify(
      {
        id: "statusBackground",
        title: account.name,
        body: "Récupération des derniers devoirs...",
        android: {
          progress: {
            max: 100,
            current: (100 / 6) * 2,
            indeterminate: false,
          },
        },
      },
      "Status"
    );
  }

  const currentHwSemaineProchaine = getHomeworks()[SemaineAct + 1] ?? [];

  await updateHomeworksState(account);

  const updatedHwSemaineActuelle = getHomeworks()[SemaineAct] ?? [];
  const updatedHwSemaineProchaine = getHomeworks()[SemaineAct + 1] ?? [];

  const differencesHwSemaineActuelle = getDifferences(
    currentHwSemaineActuelle,
    updatedHwSemaineActuelle
  );
  const differencesHwSemaineProchaine = getDifferences(
    currentHwSemaineProchaine,
    updatedHwSemaineProchaine
  );
  const differences =
      differencesHwSemaineActuelle.length +
      differencesHwSemaineProchaine.length;

  switch (differences) {
    case 0:
      break;
    case 1:
      if (differencesHwSemaineActuelle.length === 1) {
        await papillonNotify(
          {
            id: `${account.name}-homeworks`,
            title: `[${account.name}] Nouveau devoir en ${differencesHwSemaineActuelle[0].subject}`,
            subtitle: `Semaine ${(
              ((SemaineAct - (firstDateEpoch % 52)) % 52) +
                1
            ).toString()}`,
            body: parse_homeworks(differencesHwSemaineActuelle[0].content),
            data: {
              accountID: account.localID,
              page: "Homeworks"
            }
          },
          "Homeworks"
        );
      } else {
        await papillonNotify(
          {
            id: `${account.name}-homeworks`,
            title: `[${account.name}] Nouveau devoir en ${differencesHwSemaineProchaine[0].subject}`,
            subtitle: `Semaine ${(
              ((SemaineAct - (firstDateEpoch % 52)) % 52) +
                2
            ).toString()}`,
            body: parse_homeworks(differencesHwSemaineProchaine[0].content),
            data: {
              accountID: account.localID,
              page: "Homeworks"
            }
          },
          "Homeworks"
        );
      }
      break;
    default:
      const subjectCounts: Record<string, number> = {};

      [
        ...differencesHwSemaineActuelle,
        ...differencesHwSemaineProchaine,
      ].forEach((hw) => {
        subjectCounts[hw.subject] = (subjectCounts[hw.subject] || 0) + 1;
      });

      const subjectPreview = Object.entries(subjectCounts)
        .map(([subject, count]) =>
          count > 1 ? `${count}x ${subject}` : subject
        )
        .join(", ");

      let subtitle = "Semaine ";
      if (differencesHwSemaineActuelle.length > 0) {
        subtitle += (
          ((SemaineAct - (firstDateEpoch % 52)) % 52) +
            1
        ).toString();
      }
      if (differencesHwSemaineProchaine.length > 0) {
        if (differencesHwSemaineActuelle.length > 0) {
          subtitle += `et ${(
            ((SemaineAct - (firstDateEpoch % 52)) % 52) +
              2
          ).toString()}`;
        } else {
          subtitle += (
            ((SemaineAct - (firstDateEpoch % 52)) % 52) +
              2
          ).toString();
        }
      }

      await papillonNotify(
        {
          id: `${account.name}-homeworks`,
          title: `[${account.name}] Nouveaux devoirs`,
          subtitle,
          body: `
            ${differences} nouveaux devoirs :<br />
            ${subjectPreview}
            `,
          data: {
            accountID: account.localID,
            page: "Homeworks"
          }
        },
        "Homeworks"
      );
      break;
  }
  return updatedHwSemaineActuelle ?? updatedHwSemaineProchaine;
};

export { fetchHomeworks };
