import {
  WearCanteenCard,
  WearCourseItem,
  WearGradeItem,
  WearGradesSummary,
  WearHomeworkItem,
  WearSubjectAverage,
  WearSyncPayload,
} from "@/modules/papillon-wear";
import { Balance } from "@/services/shared/balance";
import { GradeScore, Subject } from "@/services/shared/grade";
import { Homework } from "@/services/shared/homework";
import { Course, CourseStatus } from "@/services/shared/timetable";
import { Services } from "@/stores/account/types";
import { AppColors, Colors } from "@/utils/colors";
import { generateId } from "@/utils/generateId";
import {
  formatGradeScoreForDisplay,
  getDisplayDenominator,
  getGradeDisplayScale,
  GradeDisplayScale,
} from "@/utils/grades/scale";
import {
  getCodeType,
  getServiceColor,
  getServiceName,
} from "@/utils/services/helper";
import { getSubjectColor } from "@/utils/subjects/colors";
import { getSubjectEmoji } from "@/utils/subjects/emoji";
import { getSubjectName } from "@/utils/subjects/name";

export interface SubjectResolver {
  getName: (subject: string) => string;
  getColor: (subject: string) => string;
  getEmoji: (subject: string) => string;
}

const defaultSubjectResolver: SubjectResolver = {
  getName: getSubjectName,
  getColor: getSubjectColor,
  getEmoji: getSubjectEmoji,
};

export function stripHtmlForWear(raw: string): string {
  if (!raw) {
    return "";
  }
  return raw
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/p>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

export function resolveAccentColorHex(colorEnum?: Colors): string {
  const found = AppColors.find(item => item.colorEnum === colorEnum);
  return found?.mainColor ?? "#26B290";
}

function getCourseStatusLabel(course: Course): string | null {
  if (course.customStatus && course.customStatus.trim().length > 0) {
    return course.customStatus.trim();
  }
  if (course.status === CourseStatus.CANCELED) {
    return "Annulé";
  }
  if (course.status === CourseStatus.EDITED) {
    return "Modifié";
  }
  if (course.status === CourseStatus.EVALUATED) {
    return "Évaluation";
  }
  return null;
}

export function buildWearTimetable(
  courses: Course[],
  resolver: SubjectResolver = defaultSubjectResolver
): WearCourseItem[] {
  return [...courses]
    .sort((a, b) => a.from.getTime() - b.from.getTime())
    .slice(0, 20)
    .map(course => ({
      id: course.id,
      subject: resolver.getName(course.subject),
      emoji: resolver.getEmoji(course.subject),
      color: course.backgroundColor || resolver.getColor(course.subject),
      room: course.room || null,
      teacher: course.teacher || null,
      from: course.from.getTime(),
      to: course.to.getTime(),
      statusLabel: getCourseStatusLabel(course),
      isCanceled: course.status === CourseStatus.CANCELED,
    }));
}

export function buildWearGradesSummary(
  params: {
    periodName: string;
    subjects: Subject[];
    studentOverall: GradeScore | null;
    classOverall: GradeScore | null;
    scale?: GradeDisplayScale;
  },
  resolver: SubjectResolver = defaultSubjectResolver
): WearGradesSummary {
  const scale = getGradeDisplayScale(params.scale);
  const scaleLabel = getDisplayDenominator(scale);

  const overallFormatted = params.studentOverall
    ? formatGradeScoreForDisplay(params.studentOverall, { value: 20 }, scale)
    : null;
  const classFormatted = params.classOverall
    ? formatGradeScoreForDisplay(params.classOverall, { value: 20 }, scale)
    : null;

  const allGrades = params.subjects.flatMap(subject =>
    (subject.grades ?? []).map(grade => ({
      grade,
      subject,
    }))
  );
  allGrades.sort(
    (a, b) =>
      (b.grade.givenAt?.getTime() ?? 0) - (a.grade.givenAt?.getTime() ?? 0)
  );

  const recentGrades: WearGradeItem[] = allGrades
    .slice(0, 12)
    .map(({ grade, subject }) => {
      const formatted = formatGradeScoreForDisplay(
        grade.studentScore,
        grade.outOf,
        scale
      );
      return {
        id: grade.id,
        subject: resolver.getName(subject.name),
        emoji: resolver.getEmoji(subject.name),
        color: resolver.getColor(subject.name),
        description: grade.description || resolver.getName(subject.name),
        score: formatted.value,
        outOf: formatted.denominator,
        coefficient: grade.coefficient ?? 1,
        givenAt: grade.givenAt?.getTime() ?? 0,
        isBonus: Boolean(grade.bonus),
      };
    });

  const subjectAverages: WearSubjectAverage[] = params.subjects.map(subject => {
    const studentFormatted = formatGradeScoreForDisplay(
      subject.studentAverage,
      subject.outOf,
      scale
    );
    const classAvgFormatted = subject.classAverage
      ? formatGradeScoreForDisplay(subject.classAverage, subject.outOf, scale)
      : null;

    return {
      id: subject.id,
      subject: resolver.getName(subject.name),
      emoji: resolver.getEmoji(subject.name),
      color: resolver.getColor(subject.name),
      studentAverage: studentFormatted.value,
      classAverage: classAvgFormatted ? classAvgFormatted.value : null,
      outOf: studentFormatted.denominator || scaleLabel,
    };
  });

  return {
    periodName: params.periodName || "Période actuelle",
    overallAverage: overallFormatted ? overallFormatted.value : null,
    classAverage: classFormatted ? classFormatted.value : null,
    scale: scaleLabel,
    recentGrades,
    subjects: subjectAverages,
  };
}

export function buildWearHomework(
  homeworks: Homework[],
  resolver: SubjectResolver = defaultSubjectResolver
): WearHomeworkItem[] {
  return [...homeworks]
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
    .slice(0, 25)
    .map(hw => ({
      id:
        hw.id ||
        generateId(
          hw.subject +
            hw.content +
            hw.createdByAccount +
            hw.dueDate.toDateString()
        ),
      subject: resolver.getName(hw.subject),
      emoji: resolver.getEmoji(hw.subject),
      color: resolver.getColor(hw.subject),
      content: stripHtmlForWear(hw.content),
      dueDate: hw.dueDate.getTime(),
      isDone: Boolean(hw.isDone),
      isEvaluation: Boolean(hw.evaluation),
    }));
}

export interface WalletWithCode {
  wallet: Balance;
  serviceId: Services;
  qrData: string | null;
}

export function buildWearCards(items: WalletWithCode[]): WearCanteenCard[] {
  return items.map(({ wallet, serviceId, qrData }) => {
    const lunchRemaining =
      wallet.lunchPrice > 0
        ? Math.floor(wallet.amount / wallet.lunchPrice)
        : wallet.lunchRemaining > 0
          ? wallet.lunchRemaining
          : null;
    const rawCodeType = getCodeType(serviceId);
    const codeType: "QR" | "CODE39" =
      rawCodeType === "CODE39" ? "CODE39" : "QR";

    return {
      id: `${wallet.createdByAccount}:${wallet.label}`,
      serviceName: getServiceName(serviceId),
      label: wallet.label,
      amountFormatted: `${(wallet.amount / 100).toFixed(2)} ${wallet.currency}`,
      lunchRemaining,
      qrData: qrData && qrData.trim().length > 0 ? qrData.trim() : null,
      codeType,
      accentColor: getServiceColor(serviceId),
    };
  });
}

export function buildWearSyncPayload(
  input: {
    accountName: string;
    className?: string | null;
    schoolName?: string | null;
    colorSelected?: Colors;
    courses: Course[];
    periodName: string;
    subjects: Subject[];
    studentOverall: GradeScore | null;
    classOverall: GradeScore | null;
    scale?: GradeDisplayScale;
    homeworks: Homework[];
    wallets: WalletWithCode[];
    now?: number;
  },
  resolver: SubjectResolver = defaultSubjectResolver
): WearSyncPayload {
  return {
    version: 1,
    updatedAt: input.now ?? Date.now(),
    accountName: input.accountName || "Papillon",
    className: input.className ?? null,
    schoolName: input.schoolName ?? null,
    accentColor: resolveAccentColorHex(input.colorSelected),
    timetable: buildWearTimetable(input.courses, resolver),
    grades: buildWearGradesSummary(
      {
        periodName: input.periodName,
        subjects: input.subjects,
        studentOverall: input.studentOverall,
        classOverall: input.classOverall,
        scale: input.scale,
      },
      resolver
    ),
    homework: buildWearHomework(input.homeworks, resolver),
    cards: buildWearCards(input.wallets),
  };
}
