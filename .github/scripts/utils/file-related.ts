import { Context } from '@actions/github/lib/context';
import { Octokit } from '@octokit/rest';
import { sizeResponse } from '..';

export default async function fileChecks(
  context: Context,
  octokit: Octokit
): Promise<sizeResponse> {
  const { owner, repo } = context.repo;
  const pull = context.payload.pull_request;

  const errors: string[] = [];
  const warnings: string[] = [];

  if (!pull) {
    return {
      errors: [],
      warnings: [],
      files: {
        status: 200,
        url: "",
        headers: {},
        data: []
      },
      dependencies: {}
    };
  }

  const response = await octokit.rest.pulls.listFiles({
    owner,
    repo,
    pull_number: pull.number
  });

  const { additions, deletions } = response.data.reduce(
    (acc, file) => {
      acc.additions += file.additions;
      acc.deletions += file.deletions;
      return acc;
    },
    { additions: 0, deletions: 0 }
  );

  if (additions > 600 || deletions > 600) {
    warnings.push(
      "Cette pull request est trop volumineuse. Merci de la diviser en changements plus petits et ciblés afin de faciliter le processus de relecture."
    );
  }

  const dependencies: Record<string, string> = {};
  const packageFile = response.data.find(f => f.filename === 'package.json');

  if (packageFile?.patch) {
    const lines = packageFile.patch.split('\n');
    let insideDeps = false;

    for (const line of lines) {
      if (line.includes('"dependencies"') || line.includes('"devDependencies"')) {
        insideDeps = true;
        continue;
      }

      if (insideDeps) {
        if (!line.startsWith(' ')) {
          insideDeps = false;
          continue;
        }

        if (line.startsWith('+') && line.includes(':')) {
          const match = line.match(/"(.+?)":/);
          if (match?.[1] && !['dependencies', 'devDependencies'].includes(match[1])) {
            const pkg = match[1];
            dependencies[pkg] = `[![Socket Badge](https://socket.dev/api/badge/npm/package/${pkg}/2.1.9)](https://socket.dev/npm/package/${pkg}/overview/2.1.9)`;
          }
        }
      }
    }
  }

  return { errors, warnings, files: response, dependencies };
}
