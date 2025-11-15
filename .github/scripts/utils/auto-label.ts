import * as github from '@actions/github';
import { Context } from '@actions/github/lib/context';
import { Octokit } from '@octokit/rest';
import { labelResponse } from './types';

const commitLabelMap: Record<string, string> = {
  fix: "type: bug",
  docs: "type: documentation",
  feat: "type: enhancement",
  perf: "type: performance",
  question: "type: question",
  refactor: "type: refactor",
  test: "type: tests",
  chore: "type: chores",
  ci: "type: tests",
};

const areaLabelMap: Record<string, string[]> = {
  "area: i18n": ["locales", "fr.json", "en.json"],
  "area: ui": ["ui", "components"],
  "area: cache": ["database", "DatabaseProvider.tsx", "schema"],
  "area: backend": ["services", "stores"],
};

const issueLabelMap: Record<string, string[]> = {
  "type: bug": ["bug", "crash", "problèmes"],
  "type: enhancement": ["feature", "ajouter"],
};

function checkConventionalCommits(commits: any[], labels: Set<string>, errors: Set<string>): void {
  const conventionalError = "Afin d'améliorer nos processus d'automatisation et de garantir une meilleure lisibilité de l'historique Git, nous demandons à tous nos contributeurs de suivre la convention [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).";

  for (const commit of commits) {
    const match = commit.commit.message.match(/^(\w+)(\(.+\))?:/);
    const prefix = match?.[1].toLowerCase();

    if (prefix && commitLabelMap[prefix]) {
      const label = commitLabelMap[prefix];
      if (label) labels.add(label);
    } else {
      labels.add("status: invalid");
      errors.add(conventionalError);
    }
  }
}

function checkAreaLabels(files: any[], labels: Set<string>): void {
  for (const [label, patterns] of Object.entries(areaLabelMap)) {
    if (patterns.some(pattern => files.some((f: any) => f.filename.includes(pattern)))) {
      labels.add(label);
    }
  }
}

function checkIssueLabels(content: string, labels: Set<string>): void {
  for (const [label, keywords] of Object.entries(issueLabelMap)) {
    if (keywords.some(keyword => content.includes(keyword.toLowerCase()))) {
      labels.add(label);
    }
  }
}

function cleanInvalidLabels(labels: Set<string>): void {
  if (labels.has("status: invalid")) {
    for (const label of [...labels]) {
      if (!["status: needs triage", "status: invalid"].includes(label)) labels.delete(label);
    }
  }
}

export default async function autoLabel(
  context: Context,
  octokit: Octokit
): Promise<labelResponse> {
  const { owner, repo } = context.repo;
  const pull = context.payload.pull_request;
  const issue = context.payload.issue;
  const isNew = context.payload.action === "opened" || context.payload.action === "reopened";
  const labels = new Set<string>(isNew ? ["status: needs triage"] : []);
  const errors = new Set<string>();

  const issue_number = pull?.number ?? issue?.number;
  if (!issue_number) return { errors, labels: [...labels] };

  if (pull) {
    const [commitsResp, filesResp] = await Promise.all([
      octokit.rest.pulls.listCommits({ owner, repo, pull_number: pull.number }),
      octokit.rest.pulls.listFiles({ owner, repo, pull_number: pull.number }),
    ]);

    checkAreaLabels(filesResp.data, labels);
    checkConventionalCommits(commitsResp.data, labels, errors);
  }

  if (issue) {
    const { data: fullIssue } = await octokit.rest.issues.get({ owner, repo, issue_number });
    const content = `${fullIssue.title ?? ""} ${fullIssue.body ?? ""}`.toLowerCase();
    checkIssueLabels(content, labels);
  }

  cleanInvalidLabels(labels);

  await octokit.rest.issues.addLabels({
    owner,
    repo,
    issue_number,
    labels: [...labels],
  });

  return { errors, labels: [...labels] };
}

export async function editInvalidLabel(
  context: Context,
  octokit: Octokit,
  type: "add" | "remove"
): Promise<boolean> {
  const { owner, repo } = context.repo;
  const pull = context.payload.pull_request;
  const issue = context.payload.issue;
  const issueNumber = pull?.number ?? issue?.number;

  if (!issueNumber) return false;

  const addInvalid = async () => {
    await octokit.rest.issues.addLabels({
      owner,
      repo,
      issue_number: issueNumber,
      labels: ["status: invalid"],
    });

    if (pull) {
      try {
        await octokit.rest.issues.removeLabel({
          owner,
          repo,
          issue_number: issueNumber,
          name: "status: needs review",
        });
      } catch (err: any) {
        if (err.status !== 404) throw err;
      }
    }
  };

  const removeInvalid = async () => {
    try {
      await octokit.rest.issues.removeLabel({
        owner,
        repo,
        issue_number: issueNumber,
        name: "status: invalid",
      });
    } catch (err: any) {
      if (err.status !== 404) throw err;
    }

    if (pull) {
      await octokit.rest.issues.addLabels({
        owner,
        repo,
        issue_number: issueNumber,
        labels: ["status: needs review"],
      });
    }
  };

  if (type === "add") await addInvalid();
  if (type === "remove") await removeInvalid();

  return true;
}
