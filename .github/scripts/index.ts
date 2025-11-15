import { createAppAuth } from '@octokit/auth-app';
import { Octokit } from "@octokit/rest";
import { OctokitResponse } from "@octokit/types"
import * as github from '@actions/github';
import autoLabel, { editInvalidLabel } from './utils/auto-label';
import fileChecks from './utils/file-related';
import checkDescription from './utils/check-description';
import { labelResponse, sizeResponse, descriptionSize } from './utils/types';

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function buildMessage(
  hasErrors: boolean,
  isPR: boolean,
  labels: labelResponse,
  size: sizeResponse,
  description: descriptionSize,
  possessive: string,
  item: string
): string {
  const parts = [
    `# 🦋 Merci pour ta contribution sur Papillon\nMerci pour l'intérêt que tu portes au projet **Papillon** ! `
  ];

  if (hasErrors && isPR) {
    parts.push(`\n\nMalheureusement, ${possessive} ${item} ne respecte pas entièrement nos règles de contribution et nécessite d'être modifiée avant de pouvoir être lue.\n## ⛔️ Liste des changements à effectuer\n${[...labels.errors, ...size.errors, ...description.errors].map(err => `- ${err}`).join("\n")}`);
  } else if (hasErrors) {
    parts.push(`\n\nMalheureusement, ${possessive} ${item} ne respecte pas entièrement nos règles de contribution et nécessite d'être modifiée avant de pouvoir être lue.\n## ⛔️ Liste des changements à effectuer\n${[...labels.errors, ...description.errors].map(err => `- ${err}`).join("\n")}`);
  } else {
    parts.push(`\n\n${capitalize(possessive)} ${item} respecte toutes les règles de contribution. Elle est donc prête pour une revue par les mainteneurs.`);
  }

  if (size.warnings.length > 0) {
    parts.push(`\n\n## ⚠️ Suggestion pour améliorer la vitesse de traitement\n${size.warnings.map(w => `- ${w}`).join("\n")}`);
  }

  if (size.dependencies && Object.keys(size.dependencies).length > 0) {
    parts.push(`\n\n## 📦 Ajout de dépendances\n| Nom de la dépendance | Impact (Socket.dev) |\n|----------------------|------------------------|\n${Object.entries(size.dependencies).map(([name, badge]) => `| \`${name}\` | ${badge} |`).join("\n")}`);
  }

  parts.push("\n\nNous espérons te revoir très bientôt avec une nouvelle proposition !\nÀ très vite sur **Papillon** 🦋");

  return parts.join('');
}

(async () => {
  const appId = Number(process.env.APP_ID);
  const installationId = Number(process.env.INSTALL_ID);
  const privateKey = process.env.PRIVATE_KEY;

  if (!appId || !installationId || !privateKey) throw new Error("You misconfigured your action.");

  const appAuth = createAppAuth({ appId, installationId, privateKey });
  const appAuthentication = await appAuth({ type: "installation" });

  const octokit = new Octokit({ auth: appAuthentication.token });
  const context = github.context;

  const labels = await autoLabel(context, octokit);
  const size = await fileChecks(context, octokit);
  const description = await checkDescription(context, octokit);

  const pull = context.payload.pull_request;
  const issue = context.payload.issue;
  const issueNumber = pull?.number ?? issue?.number;
  const isPR = !!pull;
  const item = isPR ? 'Pull Request' : 'signalement';
  const possessive = isPR ? 'ta' : 'ton';

  if (!issueNumber) return;

  const messages = await octokit.rest.issues.listComments({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: issueNumber,
  });

  const hasErrors = (labels.errors.size > 0) || (isPR && size.errors.size > 0) || (description.errors.size > 0);

  if (hasErrors && isPR) {
    await editInvalidLabel(context, octokit, "add");
  } else if (!hasErrors && isPR) {
    await editInvalidLabel(context, octokit, "remove");
  }

  const message = buildMessage(hasErrors, isPR, labels, size, description, possessive, item);

  const botMessage = messages.data.find((msg: any) => msg.performed_via_github_app?.slug === "papillon-contribution-guard");

  if (botMessage) {
    await octokit.rest.issues.updateComment({
      owner: context.repo.owner,
      repo: context.repo.repo,
      comment_id: botMessage.id,
      body: message,
    });
  } else {
    await octokit.rest.issues.createComment({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: issueNumber,
      body: message,
    });
  }
})();
