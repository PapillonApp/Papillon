import { useSettingsStore } from "@/stores/settings";

export const ANONYMOUS_PROFILE_BLUR_RADIUS = 18;
const MASK_BULLET = "•";

export function useAnonymousMode(): boolean {
  return useSettingsStore((state) => Boolean(state.personalization.anonymousMode));
}

export function getDisplayPersonName(
  firstName?: string | null,
  lastName?: string | null,
  anonymousMode?: boolean
): string {
  const fullName = [firstName, lastName]
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(" ");

  if (!fullName) {
    return "";
  }

  return anonymousMode ? maskText(fullName) : fullName;
}

export function getDisplayTeacherName(
  teacher?: string | null,
  anonymousMode?: boolean
): string | undefined {
  const normalizedTeacher = teacher?.trim();
  if (!normalizedTeacher) {
    return undefined;
  }

  return anonymousMode ? maskText(normalizedTeacher) : normalizedTeacher;
}

export function getDisplaySchoolName(
  schoolName?: string | null,
  anonymousMode?: boolean
): string | undefined {
  const normalizedSchoolName = schoolName?.trim();
  if (!normalizedSchoolName) {
    return undefined;
  }

  return anonymousMode ? maskText(normalizedSchoolName) : normalizedSchoolName;
}

export function getDisplayLocationName(
  locationName?: string | null,
  anonymousMode?: boolean
): string | undefined {
  const normalizedLocationName = locationName?.trim();
  if (!normalizedLocationName) {
    return undefined;
  }

  return anonymousMode ? maskText(normalizedLocationName) : normalizedLocationName;
}

export function getDisplayInitials(
  initials?: string | null,
  anonymousMode?: boolean
): string | undefined {
  const normalizedInitials = initials?.trim();
  if (!normalizedInitials) {
    return undefined;
  }

  return anonymousMode ? MASK_BULLET.repeat(Math.max(2, normalizedInitials.length)) : normalizedInitials;
}

function maskText(value: string): string {
  return Array.from(value)
    .map((character) => /\s/.test(character) ? character : MASK_BULLET)
    .join("");
}
