
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
  } catch (error) {
    console.error("Erreur lors de la récupération des contributeurs:", error);
    return [];
  }
}