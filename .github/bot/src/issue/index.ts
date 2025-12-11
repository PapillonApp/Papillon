import * as github from '@actions/github';
import * as core from '@actions/core';
import { getLabelsFromTitle } from './labeler';
import { classifyIssueArea } from './ai';
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

    // Feature 1: Auto-labeler (Keyword based)
    const labelsToAdd = getLabelsFromTitle(title);

    // Feature 2: AI Area Detection
    if (context.payload.issue.body) {
      const aiLabel = await classifyIssueArea(title, context.payload.issue.body);
      if (aiLabel) {
        labelsToAdd.push(aiLabel);
      }
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

    // Feature 3: Welcome Message
    if (context.payload.action === 'opened') {
        await postWelcomeMessage(octokit, owner, repo, number, user.login);
    }

  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
}

run();
