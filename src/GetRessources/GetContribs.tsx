import axios from 'axios';
import teams from "@/utils/data/teams.json";

interface Contributor {
  login: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
}

export async function getContributors(): Promise<Contributor[]> {
  try {
    const response = await axios.get('https://api.github.com/repos/PapillonApp/Papillon/contributors');
    const allContributors: Contributor[] = response.data;

    // Filtrer les contributeurs pour exclure les membres de l'équipe
    const filteredContributors = allContributors.filter(contributor => 
      !teams.some(teamMember => teamMember.name === contributor.login)
    );

    // Trier les contributeurs par nombre de contributions (du plus grand au plus petit)
    return filteredContributors.sort((a, b) => b.contributions - a.contributions);
  } catch (error) {
    console.error('Erreur lors de la récupération des contributeurs:', error);
    return [];
  }
}