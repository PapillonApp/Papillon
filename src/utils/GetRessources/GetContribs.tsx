import axios from 'axios';
import teams from '../../utils/data/teams.json';

interface Contributor {
  login: string;
  avatar_url: string;
  html_url: string;
}

export async function getContributors(): Promise<Contributor[]> {
  try {
    const response = await axios.get('https://api.github.com/repos/PapillonApp/Papillon/contributors');
    const allContributors: Contributor[] = response.data;

    // Créer un ensemble des URLs GitHub de l'équipe
    const teamGithubUrls = new Set(
      teams
        .filter(member => member.github)
        .map(member => member.github.toLowerCase())
    );

    // Filtrer les contributeurs pour exclure les membres de l'équipe
    const filteredContributors = allContributors.filter(contributor => 
      !teamGithubUrls.has(contributor.html_url.toLowerCase())
    );

    // Retourner les contributeurs sans trier par nombre de contributions
    return filteredContributors;
  } catch (error) {
    console.error('Erreur lors de la récupération des contributeurs:', error);
    return [];
  }
}