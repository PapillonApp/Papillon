import { error } from "../logger/logger";
export interface Contributor {
  login: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
}

export async function getContributors (): Promise<Contributor[]> {
  try {
    const response = await fetch("https://api.github.com/repos/PapillonApp/Papillon/contributors");
    const allContributors: Contributor[] = await response.json();

    return allContributors
  } catch (err) {
    error("Erreur lors de la récupération des contributeurs:", String(err));
    return [];
  }
}