import * as github from '@actions/github';
import * as core from '@actions/core';
import { getLabelsFromTitle } from './labeler';
import { postWelcomeMessage } from './message';

async function run() {
  try {
    const context = github.context;
    const token = process.env.GITHUB_TOKEN;

    if (!token) {
      throw new Error("GITHUB_TOKEN is missing");
    }

    const octokit = github.getOctokit(token);

    if (!context.payload.issue) {
      core.info("Not an issue event, skipping.");
      return;
    }

    const { title, number, user } = context.payload.issue;
    const { owner, repo } = context.repo;

    core.info(`Processing Issue #${number}: ${title}`);

    const labelsToAdd = getLabelsFromTitle(title);
    
    if (context.payload.action === 'opened') {
      labelsToAdd.push('status: needs triage');
    }

    if (labelsToAdd.length > 0) {
      await octokit.rest.issues.addLabels({
        owner,
        repo,
        issue_number: number,
        labels: labelsToAdd,
      });
      core.info(`Added labels: ${labelsToAdd.join(', ')}`);
    }

    if (context.payload.action === 'opened') {
        await postWelcomeMessage(octokit, owner, repo, number, user.login);
    }

  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
}

run();
