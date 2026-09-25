import { appFetch } from "@/utils/network/fetch";

export interface EducationDirectorySchool {
  uai: string;
  name: string;
  latitude?: number;
  longitude?: number;
  website?: string;
}

interface EducationDirectoryRecord {
  Identifiant_de_l_etablissement?: string;
  Nom_etablissement?: string;
  latitude?: number | string;
  longitude?: number | string;
  Web?: string;
  identifiant_de_l_etablissement?: string;
  nom_etablissement?: string;
  web?: string;
}

export function normalizeUai(value: string): string {
  return value.trim().toUpperCase().replace(/\s+/g, "");
}

export function normalizeSchoolName(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, " ").trim();
}

export async function findEducationSchoolByUai(rawUai: string): Promise<EducationDirectorySchool | null> {
  const uai = normalizeUai(rawUai);
  if (!/^\d{7}[A-Z]$/.test(uai)) {
    throw new Error("Saisis un code UAI composé de 7 chiffres et d’une lettre.");
  }

  const url = new URL("https://data.education.gouv.fr/api/explore/v2.1/catalog/datasets/fr-en-annuaire-education/records");
  url.searchParams.set("where", `identifiant_de_l_etablissement='${uai}'`);
  url.searchParams.set("limit", "1");

  const response = await appFetch(url);
  if (!response.ok) throw new Error(`L’annuaire de l’Éducation nationale a répondu ${response.status}.`);
  const payload = await response.json() as { results?: EducationDirectoryRecord[] };
  const record = Array.isArray(payload.results) ? payload.results[0] : undefined;
  if (!record) return null;

  const latitude = Number(record.latitude);
  const longitude = Number(record.longitude);
  return {
    uai: record.Identifiant_de_l_etablissement ?? record.identifiant_de_l_etablissement ?? uai,
    name: record.Nom_etablissement ?? record.nom_etablissement ?? "Établissement scolaire",
    latitude: Number.isFinite(latitude) ? latitude : undefined,
    longitude: Number.isFinite(longitude) ? longitude : undefined,
    website: record.Web ?? record.web,
  };
}
