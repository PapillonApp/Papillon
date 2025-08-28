import { createAppAuth } from '@octokit/auth-app';
import { Octokit } from "@octokit/rest";
import { OctokitResponse } from "@octokit/types"
import * as github from '@actions/github';
import autoLabel, { editInvalidLabel } from './utils/auto-label';
import fileChecks from './utils/file-related';
import checkDescription from './utils/check-description';

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

  if (!issueNumber) return;

  const messages = await octokit.rest.issues.listComments({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: issueNumber,
  });

  let message = `# 🦋 Merci pour ta contribution sur Papillon\nMerci pour l'intérêt que tu portes au projet **Papillon** ! `;

  if ((labels.errors.length > 0 || size.errors.length > 0 || description.errors.length > 0) && pull) {
    await editInvalidLabel(context, octokit, "add");
    message += `\n\nMalheureusement, ta Pull Request ne respecte pas entièrement nos règles de contribution et nécessite d'être modifiée avant de pouvoir être lue.\n## ⛔️ Liste des changements à effectuer\n${[...labels.errors, ...size.errors, ...description.errors].map(err => `- ${err}`).join("\n")}`;
  } else {
    message += `\n\nTa Pull Request respecte toutes les règles de contribution. Elle est donc prête pour une revue par les mainteneurs.`;
    await editInvalidLabel(context, octokit, "remove");
  }

  if (size.warnings.length > 0) {
    message += `\n\n## ⚠️ Suggestion pour améliorer la vitesse de traitement\n${size.warnings.map(w => `- ${w}`).join("\n")}`;
  }

  if (size.dependencies && Object.keys(size.dependencies).length > 0) {
    message += `\n\n## 📦 Ajout de dépendances\n| Nom de la dépendance | Impact (Socket.dev) |\n|----------------------|------------------------|\n${Object.entries(size.dependencies).map(([name, badge]) => `| \`${name}\` | ${badge} |`).join("\n")}`;
  }

  message += "\n\nNous espérons te revoir très bientôt avec une nouvelle proposition !\nÀ très vite sur **Papillon** 🦋";

  const botMessage = messages.data.find(msg => msg.performed_via_github_app?.slug === "raphckrman");

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

export interface labelResponse {
    errors: string[]
    labels: string[]
}

export interface sizeResponse {
    errors: string[]
    warnings: string[]
    files: OctokitResponse<{
        sha: string;
        filename: string;
        status: "added" | "removed" | "modified" | "renamed" | "copied" | "changed" | "unchanged";
        additions: number;
        deletions: number;
        changes: number;
        blob_url: string;
        raw_url: string;
        contents_url: string;
        patch?: string;
        previous_filename?: string;
    }[], 200>,
    dependencies?: Record<string, string>
}

export interface descriptionSize {
    errors: string[]
}