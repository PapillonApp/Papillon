import { PronoteApiClient } from "@/services/pronote/api-client";
import { AttachmentType } from "@/services/shared/attachment";
import { Course, CourseDay, CourseResource, CourseStatus, CourseType, WeekLessonContent } from "@/services/shared/timetable";
import { getWeekRange, getWeekRangeForDate } from "@/utils/services/periods";
import { error } from "@/utils/logger/logger";

/** Heure murale locale "YYYY-MM-DDTHH:mm:ss" (sans offset) : pronotepy expose
 *  des datetimes naïfs en heure de l'établissement, donc on compare mur à mur
 *  (envoyer de l'UTC ".toISOString()" décalait tout de +1/+2h -> contenu jamais
 *  retrouvé en été). */
export function toLocalWallIso(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/** Matière normalisée : Pronote renvoie "MATHEMATIQUES" quand l'EDT dit
 *  "Mathématiques" (casse + accents différents). */
export function normSubject(s: unknown): string {
  try {
    return String(s ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  } catch {
    return "";
  }
}

function toTimeSafe(v: unknown): number {
  try {
    const t = v instanceof Date ? v.getTime() : new Date(v as any).getTime();
    return Number.isFinite(t) ? t : NaN;
  } catch {
    return NaN;
  }
}

function mapRawContent(c: any, accountId: string): CourseResource | null {
  const mapped: CourseResource = {
    title: c?.title ?? undefined,
    description: c?.description ?? undefined,
    category: (typeof c?.category === "number" || typeof c?.category === "string") ? c.category : 0,
    attachments: Array.isArray(c?.files) ? c.files.map((f: any) => ({
      // pronotepy: 0 = lien externe (ouverture navigateur), 1 = fichier.
      type: f?.type === 0 ? AttachmentType.LINK : AttachmentType.FILE,
      name: f?.name ?? "Fichier",
      url: f?.url ?? "",
      createdByAccount: accountId,
    })) : [],
  };
  return (mapped.title || mapped.description || (mapped.attachments?.length ?? 0) > 0) ? mapped : null;
}

/** Matières équivalentes : "Maths" (EDT) vs "MATHEMATIQUES" (cahier),
 *  "FR" vs "Français", "H-G" vs "Histoire-Géographie", etc. */
function subjectsMatch(wantRaw: string, gotRaw: string): boolean {
  const want = wantRaw.trim();
  const got = gotRaw.trim();
  if (!want || !got) return true;
  if (got.includes(want) || want.includes(got)) return true;
  const compact = (s: string) => s.replace(/[^a-z0-9]/g, "");
  const w = compact(want);
  const g = compact(got);
  if (!w || !g) return true;
  if (w === g) return true;
  // Préfixe long commun (>= 4) : maths/mathematiques, philo/philosophie…
  let common = 0;
  while (common < w.length && common < g.length && w[common] === g[common]) common++;
  if (common >= 4) return true;
  // Tokens : "hist geo" vs "histoire geographie", "eps" vs "e p s"…
  const wt = want.split(" ").filter(Boolean);
  const gt = got.split(" ").filter(Boolean);
  for (const a of wt) {
    for (const b of gt) {
      if (a.length >= 3 && (b.startsWith(a) || a.startsWith(b))) return true;
      if (a.length >= 4 && b.length >= 4 && a.slice(0, 4) === b.slice(0, 4)) return true;
    }
  }
  // Alias courts usuels.
  const aliases: Record<string, string[]> = {
    maths: ["mathematiques"], math: ["mathematiques"],
    francais: ["fr", "lettres"], fr: ["francais", "lettres"],
    histoire: ["hg", "hist", "geographie"], geographie: ["hg", "geo", "histoire"],
    physique: ["pc", "chimie", "scphys"], chimie: ["pc", "physique"],
    svt: ["svt", "sciences"], eps: ["eps", "sport"],
    anglais: ["ang", "lv1"], espagnol: ["esp", "lv2"], allemand: ["all", "lv2"],
    philo: ["philosophie"], eco: ["ses", "economie"], ses: ["eco", "economie"],
    techno: ["technologie"], arts: ["plastiques"], musique: ["education"],
  };
  const expand = (s: string): Set<string> => {
    const out = new Set<string>([s, w === s ? s : "", g === s ? s : ""].filter(Boolean));
    out.add(s);
    for (const tok of s.split(" ").filter(Boolean)) {
      out.add(tok);
      out.add(compact(tok));
      const al = aliases[compact(tok)];
      if (al) for (const x of al) out.add(x);
    }
    const full = compact(s);
    const alFull = aliases[full];
    if (alFull) for (const x of alFull) out.add(x);
    return out;
  };
  const wSet = expand(want);
  const gSet = expand(got);
  for (const x of wSet) {
    if (x && gSet.has(x)) return true;
  }
  return false;
}

/** Rattache un contenu batché à un cours : même matière (insensible casse,
 *  accents, abréviations) + débuts à moins de 5 min (instants, même
 *  référentiel mur). Fallback : matière seule dans ±90 min (DST/arrondis). */
export function matchContentForCourse(
  contents: WeekLessonContent[] | undefined,
  course: Pick<Course, "from" | "subject">
): CourseResource[] | null {
  if (!Array.isArray(contents) || contents.length === 0) return null;
  const fromMs = toTimeSafe(course.from);
  if (!Number.isFinite(fromMs)) return null;
  const want = normSubject(course.subject);
  // Passe 1 : heure exacte (±5 min) + matière.
  for (const c of contents) {
    if (!c || c.lessonStart === null) continue;
    const startMs = toTimeSafe(c.lessonStart);
    if (!Number.isFinite(startMs)) continue;
    if (Math.abs(startMs - fromMs) > 5 * 60 * 1000) continue;
    const got = normSubject(c.subject);
    if (subjectsMatch(want, got)) {
      return c.resources.length > 0 ? c.resources : null;
    }
  }
  // Passe 2 : matière + proximité ±90 min (couvre DST, secondes tronquées,
  // créneaux décalés). Prend le plus proche.
  let best: WeekLessonContent | null = null;
  let bestDist = 90 * 60 * 1000;
  for (const c of contents) {
    if (!c || c.lessonStart === null) continue;
    const startMs = toTimeSafe(c.lessonStart);
    if (!Number.isFinite(startMs)) continue;
    const dist = Math.abs(startMs - fromMs);
    if (dist > bestDist) continue;
    const got = normSubject(c.subject);
    if (!want || !got || subjectsMatch(want, got)) {
      if (!Array.isArray(c.resources) || c.resources.length === 0) continue;
      best = c;
      bestDist = dist;
    }
  }
  return best && Array.isArray(best.resources) && best.resources.length > 0 ? best.resources : null;
}

export async function fetchPronoteWeekTimetable(
  authToken: string,
  accountId: string,
  weekNumberRaw: number,
  date: Date,
  childName?: string
): Promise<CourseDay[]> {
  try {
    // La plage est dérivée de `date` (semaine ISO la contenant), PAS de
    // `weekNumberRaw + year` : l'arithmétique week-1/week+1 casse aux
    // frontières d'année (semaine 0/54 -> mauvaise année -> EDT vide).
    let start: Date;
    let end: Date;
    try {
      const d = date instanceof Date && !isNaN(date.getTime()) ? date : new Date();
      ({ start, end } = getWeekRangeForDate(d));
    } catch {
      const year = date ? date.getFullYear() : new Date().getFullYear();
      ({ start, end } = getWeekRange(weekNumberRaw, year));
    }
    const fmtLocalDay = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const fromStr = fmtLocalDay(start);
    const toStr = fmtLocalDay(end);

    const response = await PronoteApiClient.getTimetable(authToken, fromStr, toStr, childName);
    const dayMap: Record<string, Course[]> = {};
    const localDayKey = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

    for (const l of response.lessons || []) {
      const fromDate = new Date(l.start);
      const toDate = new Date(l.end);
      // Leçon corrompue (dates invalides) : on l'ignore au lieu de crasher le tri/l'UI.
      if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) continue;
      // Jour local (cohérent avec la comparaison locale de l'UI), pas UTC.
      const dayKey = localDayKey(fromDate);
      const isDetention = Boolean((l as any).detention ?? (l as any).is_detention ?? false);
      const isOuting = Boolean((l as any).outing ?? (l as any).is_outing ?? false);

      dayMap[dayKey] = dayMap[dayKey] || [];
      dayMap[dayKey].push({
        id: l.id,
        resourceId: (l as any).resource_id ?? l.id,
        subject: l.subject || "Matière",
        subjectId: (l as any).subject_id ?? undefined,
        subjectGroups: Boolean((l as any).subject_groups ?? false),
        from: fromDate,
        to: toDate,
        room: l.room || "",
        teacher: l.teacher || "",
        teacherNames: Array.isArray((l as any).teacher_names) ? (l as any).teacher_names : undefined,
        classrooms: Array.isArray((l as any).classrooms) ? (l as any).classrooms : undefined,
        group: (l as any).group || "",
        groupNames: Array.isArray((l as any).group_names) ? (l as any).group_names : undefined,
        num: typeof (l as any).num === "number" ? (l as any).num : undefined,
        normal: typeof (l as any).normal === "boolean" ? (l as any).normal : (!isDetention && !isOuting),
        detention: isDetention,
        outing: isOuting,
        isTest: Boolean((l as any).test ?? (l as any).is_test ?? false),
        exempted: Boolean((l as any).exempted ?? false),
        virtualClassrooms: Array.isArray((l as any).virtual_classrooms) ? (l as any).virtual_classrooms : undefined,
        backgroundColor: l.backgroundColor || l.color || undefined,
        status: l.canceled ? CourseStatus.CANCELED : undefined,
        customStatus: l.status || undefined,
        additionalInfo: l.memo || undefined,
        url: Array.isArray((l as any).virtual_classrooms) && (l as any).virtual_classrooms.length > 0
          ? (l as any).virtual_classrooms[0]
          : undefined,
        type: isDetention ? CourseType.DETENTION : CourseType.LESSON,
        createdByAccount: accountId,
        kidName: childName,
        // L'EDT est volontairement sans contenu (rapide) ; le contenu se
        // charge à la demande via fetchPronoteCourseResources.
        // Si le backend en renvoie quand même (vieux déploiement), on le mappe.
        content: Array.isArray(l.content) && l.content.length > 0 ? l.content.map((c: any): CourseResource => ({
          title: c?.title ?? undefined,
          description: c?.description ?? undefined,
          category: (typeof c?.category === "number" || typeof c?.category === "string") ? c.category : 0,
          attachments: Array.isArray(c?.files) ? c.files.map((f: any) => ({
            type: f?.type === 0 ? AttachmentType.LINK : AttachmentType.FILE,
            name: f?.name ?? "Fichier",
            url: f?.url ?? "",
            createdByAccount: accountId,
          })) : [],
        })).filter((c: CourseResource) => c.title || c.description || (c.attachments?.length ?? 0) > 0) : [],
      });
    }

    for (const day in dayMap) {
      dayMap[day].sort((a, b) => a.from.getTime() - b.from.getTime());
    }

    return Object.entries(dayMap).map(([day, courses]) => ({
      date: new Date(day),
      courses,
    }));
  } catch (err) {
    error(`Failed to fetch timetable: ${err}`, "fetchPronoteWeekTimetable");
    return [];
  }
}

export async function fetchPronoteCourseResources(
  authToken: string,
  course: Course
): Promise<CourseResource[]> {
  try {
    // Si le cache DB a déjà du contenu, on le renvoie (pas de réseau).
    if (Array.isArray(course.content) && course.content.length > 0) {
      return course.content;
    }
    const fromDate = course.from instanceof Date ? course.from : new Date(course.from);
    // Heure murale (pas d'UTC) : cf. toLocalWallIso.
    const fromWall = toLocalWallIso(fromDate);
    const dateStr = fromWall.split("T")[0];
    const childName = (course as { kidName?: string }).kidName;
    const resourceId = (course as { resourceId?: string }).resourceId;
    // `course.id` en cache = routeId stable ("id-…", generateId), pas l'id
    // Pronote brut (numérique, qui tourne à chaque session). On envoie en
    // priorité le resourceId persisté (id Pronote frais au fetch EDT), sinon
    // l'id brut si course.id n'est pas un routeId. Jamais de hash "id-…"
    // au backend (il ne serait jamais retrouvé dans PageCahierDeTexte).
    const isRouteId = (v: unknown): boolean =>
      typeof v === "string" && (v.startsWith("id-") || (v.length >= 20 && !/^\d+$/.test(v)));
    const rawLessonId =
      typeof resourceId === "string" && resourceId.trim().length > 0 && !isRouteId(resourceId)
        ? resourceId.trim()
        : (typeof course.id === "string" && !isRouteId(course.id) ? course.id : undefined);
    const response = await PronoteApiClient.getLessonContent(authToken, {
      lessonId: rawLessonId,
      lessonStart: fromWall,
      subject: course.subject,
      date: dateStr,
      child: childName,
    });
    const accountId = course.createdByAccount ?? "";
    const mapped: CourseResource[] = (response.contents || []).map((c: any): CourseResource => ({
      title: c?.title ?? undefined,
      description: c?.description ?? undefined,
      category: (typeof c?.category === "number" || typeof c?.category === "string") ? c.category : 0,
      attachments: Array.isArray(c?.files) ? c.files.map((f: any) => ({
        // pronotepy: 0 = lien externe (ouverture navigateur), 1 = fichier.
        type: f?.type === 0 ? AttachmentType.LINK : AttachmentType.FILE,
        name: f?.name ?? "Fichier",
        url: f?.url ?? "",
        createdByAccount: accountId,
      })) : [],
    })).filter((c: CourseResource) => c.title || c.description || (c.attachments?.length ?? 0) > 0);
    return mapped;
  } catch (err) {
    error(`Failed to fetch course resources: ${err}`, "fetchPronoteCourseResources");
    return Array.isArray(course.content) ? course.content : [];
  }
}

/** Contenus de tous les cours d'une fenêtre en UNE requête (GET
 *  /timetable/contents : 1 PageCahierDeTexte / semaine côté backend).
 *  Remplace N appels POST /timetable/lesson-content (1 login + scan chacun).
 *  Les ids Pronote tournant à chaque session, le rattachement se fait via
 *  matchContentForCourse (heure + matière). */
export async function fetchPronoteWeekContents(
  authToken: string,
  accountId: string,
  from: Date,
  to: Date,
  childName?: string
): Promise<WeekLessonContent[]> {
  try {
    const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const f = from instanceof Date && !isNaN(from.getTime()) ? from : new Date();
    const t = to instanceof Date && !isNaN(to.getTime()) ? to : new Date(f.getTime() + 7 * 86400000);
    const response = await PronoteApiClient.getTimetableContents(authToken, fmt(f), fmt(t), childName);
    const out: WeekLessonContent[] = [];
    for (const c of response.contents || []) {
      let start: Date | null = null;
      try {
        // Heure murale établissement (même référentiel que Course.from).
        const raw = String(c?.lesson_start ?? "");
        const m = raw.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/);
        if (m) {
          start = new Date(
            Number(m[1]), Number(m[2]) - 1, Number(m[3]),
            Number(m[4]), Number(m[5]), Number(m[6] ?? "0")
          );
          if (isNaN(start.getTime())) start = null;
        }
      } catch {
        start = null;
      }
      const resources: CourseResource[] = [];
      const one = mapRawContent(c, accountId);
      if (one) resources.push(one);
      if (resources.length === 0) continue;
      out.push({
        lessonId: typeof c?.lesson_id === "string" ? c.lesson_id : undefined,
        lessonStart: start,
        subject: String(c?.subject ?? ""),
        resources,
      });
    }
    return out;
  } catch (err) {
    error(`Failed to fetch week contents: ${err}`, "fetchPronoteWeekContents");
    return [];
  }
}