import { Octokit } from '@octokit/rest';

export async function postWelcomeMessage(
  octokit: any,
  owner: string,
  repo: string,
  issueNumber: number,
  author: string
) {
  const message = `
# 🦋 Merci pour ta contribution sur Papillon

Merci pour l'intérêt que tu portes au projet **Papillon** !
Nous espérons te revoir très bientôt avec une nouvelle issue !

À très vite sur **Papillon** 🦋
`.trim();

  const comments = await octokit.rest.issues.listComments({
    owner,
    repo,
    issue_number: issueNumber,
  });

  const botComment = comments.data.find((comment: any) => 
    comment.body && comment.body.includes("Merci pour ta contribution sur Papillon")
  );

  if (!botComment) {
    await octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: issueNumber,
      body: message,
    });
  }
}
