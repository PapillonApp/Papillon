import axios from "axios";
import teams from "@/utils/data/teams.json";
import { error } from "@/utils/logger/logger";

export interface Contributor {
  login: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
}

export async function getContributors (): Promise<Contributor[]> {
  try {
    const { data: allContributors } = await axios.get<Contributor[]>("https://api.github.com/repos/PapillonApp/Papillon/contributors");

    const teamGithubUsernames = new Set(
      teams
        .filter((team): team is { name: string; description: string; link: string; ppimage: string; github: string, location: string } => Boolean(team.github))
        .map(({ github }) => github.split("/").pop()?.toLowerCase() ?? "")
    );

    return allContributors.filter(({ login }) =>
      !teamGithubUsernames.has(login.toLowerCase())
    );
  } catch (err) {
    error("Erreur lors de la récupération des contributeurs:" + err, "getContributors");
    return [];
  }
}
