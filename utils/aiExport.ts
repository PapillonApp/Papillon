import * as FileSystem from "expo-file-system/legacy";
import { Platform, Share } from "react-native";

import { getDatabaseInstance } from "@/database/DatabaseProvider";
import { Grade, Period } from "@/database/models/Grades";
import Homework from "@/database/models/Homework";
import Subject from "@/database/models/Subject";
import { getDateRangeOfWeek, getWeekNumberFromDate } from "@/database/useHomework";
import { getManager } from "@/services/shared";
import { useAccountStore } from "@/stores/account";

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function countWords(text: string): number {
  const clean = stripHtml(text);
  if (!clean) return 0;
  return clean.split(/\s+/).filter(w => w.length > 0).length;
}

function getSubjectCategory(name: string): string {
  const n = normalizeText(name);
  if (/math/.test(n)) return "sciences";
  if (/physique|chimie|\bpc\b/.test(n)) return "sciences";
  if (/svt|biologie|sciences de la vie|sciences nat/.test(n)) return "sciences";
  if (/\bsciences?\b/.test(n)) return "sciences";
  if (/francais|français|litterature/.test(n)) return "langues";
  if (/anglais|espagnol|allemand|italian|latin|\bgrec\b|arabe|russe|langue/.test(n)) return "langues";
  if (/histoire|geo\b|geographie/.test(n)) return "sciences_humaines";
  if (/\bemc\b|civique|morale|citoyennete/.test(n)) return "sciences_humaines";
  if (/philo/.test(n)) return "philosophie";
  if (/\bses\b|economie|eco\b/.test(n)) return "sciences_economiques";
  if (/\beps\b|sport|education physique/.test(n)) return "sport";
  if (/arts?\s*plastiques|dessin/.test(n)) return "arts";
  if (/musique/.test(n)) return "arts";
  if (/techno|informatique|\bnsi\b|\bsnt\b/.test(n)) return "technologie";
  if (/management|droit/.test(n)) return "sciences_economiques";
  return "autres";
}

function computeRichness(
  rawContent: string,
  hasAttachments: boolean,
  isEvaluation: boolean
) {
  const norm = normalizeText(stripHtml(rawContent));
  const wordCount = countWords(rawContent);

  const hasTime = /\d+\s*(min|heure|h\b|heur)/.test(norm);
  const hasChapter = /chapitre|lecon|partie|livre|page/.test(norm);
  const hasScope = /tout|entire|chapitres|lecons/.test(norm);
  const hasAction = /apprendre|reviser|faire|lire|ecrire|rediger|calculer|resoudre|preparer|finir|terminer/.test(norm);
  const hasContext = /pour\b|afin\b|sur\b|concernant|portant sur/.test(norm);

  const specificity = Math.min(10, Math.max(1,
    (wordCount >= 5 ? 2 : 0) +
    (wordCount >= 10 ? 2 : 0) +
    (hasChapter ? 2 : 0) +
    (hasScope ? 1 : 0) +
    (hasContext ? 2 : 0) +
    (isEvaluation ? 1 : 0)
  ));

  const actionability = Math.min(10, Math.max(1,
    (hasAction ? 4 : 0) +
    (hasAttachments ? 2 : 0) +
    (wordCount >= 8 ? 2 : 0) +
    (hasTime ? 2 : 0)
  ));

  const contextDepth = Math.min(10, Math.max(1,
    (hasChapter ? 3 : 0) +
    (hasContext ? 2 : 0) +
    (wordCount >= 15 ? 3 : 0) +
    (isEvaluation ? 1 : 0) +
    (hasTime ? 1 : 0)
  ));

  const overallScore = (specificity + actionability + contextDepth) / 3;

  return {
    overall_score: Math.round(overallScore * 10) / 10,
    specificity: Math.round(specificity * 10) / 10,
    actionability: Math.round(actionability * 10) / 10,
    context_depth: Math.round(contextDepth * 10) / 10,
    components: {
      has_topic: hasChapter || hasScope,
      has_scope: hasScope,
      has_instructions: hasAction,
      has_materials: hasAttachments,
      has_time_indicator: hasTime,
      word_count: wordCount,
    },
  };
}

function safeScore(raw: string | undefined | null): number | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.value === "number" && !parsed.disabled) {
      return Math.round(parsed.value * 100) / 100;
    }
    return null;
  } catch {
    return null;
  }
}

function safeScoreOutOf(raw: string | undefined | null): number | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed?.outOf ?? null;
  } catch {
    return null;
  }
}

function buildSchoolYearWeeks(): number[] {
  const now = new Date();
  const currentWeek = getWeekNumberFromDate(now);
  const currentMonth = now.getMonth();

  const weeks: number[] = [];

  if (currentMonth < 8) {
    for (let w = -20; w <= 0; w++) weeks.push(w);
    const maxWeek = Math.min(currentWeek + 2, 52);
    for (let w = 1; w <= maxWeek; w++) weeks.push(w);
  } else {
    const maxWeek = Math.min(currentWeek + 2, 52);
    for (let w = 35; w <= maxWeek; w++) weeks.push(w);
  }

  return weeks;
}

export type ExportProgressCallback = (label: string, done: number, total: number, homeworkCount: number) => void;

export async function generateAIExport(
  onProgress?: ExportProgressCallback
): Promise<string> {
  const db = getDatabaseInstance();
  const accountStore = useAccountStore.getState();
  const account = accountStore.accounts.find(
    a => a.id === accountStore.lastUsedAccount
  );
  const manager = getManager();

  const allWeeks = buildSchoolYearWeeks();
  const totalWeeks = allWeeks.length;
  let doneWeeks = 0;
  let runningHomeworkCount = 0;

  for (const week of allWeeks) {
    const { start } = getDateRangeOfWeek(week);
    const label = start.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
    onProgress?.(`Semaine du ${label}`, doneWeeks, totalWeeks, runningHomeworkCount);
    try {
      const fetched = await manager.getHomeworks(week);
      runningHomeworkCount += fetched.length;
    } catch {
      // ignore per-week errors, continue
    }
    doneWeeks++;
  }

  onProgress?.("Lecture de la base de données…", totalWeeks, totalWeeks, runningHomeworkCount);

  const allHomework = await db.get<Homework>("homework").query().fetch();
  const allPeriods = await db.get<Period>("periods").query().fetch();
  const allSubjects = await db.get<Subject>("subjects").query().fetch();
  const allGrades = await db.get<Grade>("grades").query().fetch();

  const gradesBySubjectId: Record<string, Grade[]> = {};
  for (const g of allGrades) {
    if (g.subjectId) {
      (gradesBySubjectId[g.subjectId] ??= []).push(g);
    }
  }


  const periodsExport = allPeriods.map(period => {
    const periodStart = period.start;
    const periodEnd = period.end;

    const periodSubjects = allSubjects.filter(subject => {
      const grades = gradesBySubjectId[subject.id] ?? [];
      return grades.some(
        g => g.givenAt >= periodStart && g.givenAt <= periodEnd
      );
    });

    return {
      name: period.name,
      start: new Date(period.start).toISOString(),
      end: new Date(period.end).toISOString(),
      subjects: periodSubjects.map(subject => {
        const grades = (gradesBySubjectId[subject.id] ?? [])
          .filter(g => g.givenAt >= periodStart && g.givenAt <= periodEnd)
          .slice()
          .sort((a, b) => a.givenAt - b.givenAt);

        return {
          name: subject.name,
          normalized: normalizeText(subject.name),
          category: getSubjectCategory(subject.name),
          student_average: safeScore(subject.studentAverageRaw),
          class_average: safeScore(subject.classAverageRaw),
          max: safeScore(subject.maximumRaw),
          min: safeScore(subject.minimumRaw),
          out_of: safeScoreOutOf(subject.outOfRaw) ?? 20,
          grades_count: grades.length,
          grades: grades.map(grade => {
            const desc = grade.description ?? "";
            return {
              description: desc,
              description_normalized: normalizeText(desc),
              given_at: new Date(grade.givenAt).toISOString(),
              subject: subject.name,
              subject_normalized: normalizeText(subject.name),
              subject_category: getSubjectCategory(subject.name),
              type: "grade",
              student_score: safeScore(grade.studentScoreRaw),
              out_of: safeScoreOutOf(grade.outOfRaw) ?? 20,
              coefficient: grade.coefficient ?? 1,
              average_score: safeScore(grade.averageScoreRaw),
              min_score: safeScore(grade.minScoreRaw),
              max_score: safeScore(grade.maxScoreRaw),
              is_bonus: grade.bonus ?? false,
              is_optional: grade.optional ?? false,
              word_count: countWords(desc),
              richness: computeRichness(desc, false, false),
            };
          }),
        };
      }),
    };
  });

  const allSubjectsExport = allSubjects.map(subject => {
    const grades = (gradesBySubjectId[subject.id] ?? [])
      .slice()
      .sort((a, b) => a.givenAt - b.givenAt);

    return {
      name: subject.name,
      normalized: normalizeText(subject.name),
      category: getSubjectCategory(subject.name),
      period_group_key: subject.periodGradeId ?? null,
      student_average: safeScore(subject.studentAverageRaw),
      class_average: safeScore(subject.classAverageRaw),
      max: safeScore(subject.maximumRaw),
      min: safeScore(subject.minimumRaw),
      out_of: safeScoreOutOf(subject.outOfRaw) ?? 20,
      grades_count: grades.length,
      grades: grades.map(grade => {
        const desc = grade.description ?? "";
        return {
          description: desc,
          description_normalized: normalizeText(desc),
          given_at: new Date(grade.givenAt).toISOString(),
          subject: subject.name,
          subject_normalized: normalizeText(subject.name),
          subject_category: getSubjectCategory(subject.name),
          type: "grade",
          student_score: safeScore(grade.studentScoreRaw),
          out_of: safeScoreOutOf(grade.outOfRaw) ?? 20,
          coefficient: grade.coefficient ?? 1,
          average_score: safeScore(grade.averageScoreRaw),
          min_score: safeScore(grade.minScoreRaw),
          max_score: safeScore(grade.maxScoreRaw),
          is_bonus: grade.bonus ?? false,
          is_optional: grade.optional ?? false,
          word_count: countWords(desc),
          richness: computeRichness(desc, false, false),
        };
      }),
    };
  });

  const homeworkExport = allHomework
    .slice()
    .sort((a, b) => a.dueDate - b.dueDate)
    .map(hw => {
      const content = hw.content ?? "";
      const subject = hw.subject ?? "";
      let attachments: unknown[] = [];
      try {
        const parsed = JSON.parse(hw.attachments ?? "[]");
        attachments = Array.isArray(parsed) ? parsed : [];
      } catch {
        attachments = [];
      }
      const hasAttachments = attachments.length > 0;
      const textContent = stripHtml(content);
      const wc = countWords(content);

      return {
        subject,
        subject_normalized: normalizeText(subject),
        subject_category: getSubjectCategory(subject),
        description: textContent,
        description_html: content,
        description_normalized: normalizeText(textContent),
        due_date: new Date(hw.dueDate).toISOString(),
        is_done: hw.isDone,
        is_evaluation: hw.evaluation,
        type: hw.evaluation ? "evaluation" : "homework",
        has_attachments: hasAttachments,
        attachments_count: attachments.length,
        content_length: textContent.length,
        word_count: wc,
        return_format: hw.returnFormat ?? null,
        richness: computeRichness(content, hasAttachments, hw.evaluation),
        metadata: {
          is_graded: hw.evaluation,
          requires_preparation: !hw.evaluation,
          can_use_documents: hasAttachments,
          is_custom: hw.custom ?? false,
        },
        temporal: {
          urgency: wc > 20 ? "high" : wc > 8 ? "medium" : "low",
          deadline_type: "fixed",
        },
        ai_hints: {
          language: "fr",
          can_generate_exercises: hw.evaluation,
          can_generate_summary: !hw.evaluation && wc > 5,
        },
      };
    });

  const subjectNames = new Set<string>();
  allHomework.forEach(hw => hw.subject && subjectNames.add(hw.subject));
  allSubjects.forEach(s => s.name && subjectNames.add(s.name));
  allGrades.forEach(g => g.subjectName && subjectNames.add(g.subjectName));

  const subjectSummary = Array.from(subjectNames)
    .sort()
    .map(name => ({
      name,
      normalized: normalizeText(name),
      category: getSubjectCategory(name),
      homework_count: allHomework.filter(hw => hw.subject === name).length,
      evaluations_count: allHomework.filter(
        hw => hw.subject === name && hw.evaluation
      ).length,
      grades_count: allGrades.filter(g => g.subjectName === name).length,
      customization: account?.customisation?.subjects?.[name] ?? null,
    }));

  const allTimestamps = [
    ...allHomework.map(hw => hw.dueDate),
    ...allGrades.map(g => g.givenAt),
  ].filter(Boolean);

  const statistics = {
    total_homework: allHomework.length,
    total_evaluations: allHomework.filter(hw => hw.evaluation).length,
    total_grades: allGrades.length,
    total_periods: allPeriods.length,
    total_subjects: subjectNames.size,
    weeks_fetched: totalWeeks,
    date_range: {
      earliest: allTimestamps.length
        ? new Date(Math.min(...allTimestamps)).toISOString()
        : null,
      latest: allTimestamps.length
        ? new Date(Math.max(...allTimestamps)).toISOString()
        : null,
    },
    subjects_by_category: subjectSummary.reduce(
      (acc, s) => {
        acc[s.category] = (acc[s.category] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    ),
    homework_completion_rate:
      allHomework.length > 0
        ? Math.round(
          (allHomework.filter(hw => hw.isDone).length / allHomework.length) *
              1000
        ) / 10
        : null,
  };

  return JSON.stringify(
    {
      metadata: {
        export_date: new Date().toISOString(),
        schema_version: "1.0",
        app: "Papillon v8",
        purpose: "ai_training",
        account: {
          name: account
            ? `${account.firstName} ${account.lastName}`
            : null,
          school: account?.schoolName ?? null,
          class: account?.className ?? null,
          services: account?.services?.map(s => String(s.serviceId)) ?? [],
        },
      },
      statistics,
      subject_summary: subjectSummary,
      periods: periodsExport,
      subjects_with_grades: allSubjectsExport,
      homework: homeworkExport,
    },
    null,
    2
  );
}

export async function exportAndShareAIData(
  onProgress?: ExportProgressCallback
): Promise<void> {
  const json = await generateAIExport(onProgress);

  const filename = `papillon-ai-export-${Date.now()}.json`;
  const fileUri = (FileSystem.documentDirectory ?? "") + filename;

  await FileSystem.writeAsStringAsync(fileUri, json, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  if (Platform.OS === "ios") {
    await Share.share({ url: fileUri, title: "Papillon AI Export" });
  } else {
    await Share.share({
      message: json.slice(0, 60000),
      title: "Papillon AI Export",
    });
  }
}
