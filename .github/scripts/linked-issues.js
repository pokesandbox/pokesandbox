// Shared by .github/workflows/pr-gate.yml and .github/workflows/issue-status.yml.
// Loaded from actions/github-script via require(); plain CommonJS, no dependencies.
//
// Returns the issues in THIS repo that a PR closes, from two sources merged together:
//   1. GitHub's own parser (GraphQL closingIssuesReferences). Only populated for PRs
//      targeting the default branch (develop), and only from the PR description.
//   2. The closing-keyword regex over the PR body, as a fallback (e.g. a PR retargeted
//      to another base, or a link GitHub hasn't indexed yet after an edit).
// Linking an issue from the PR sidebar ("Development") does not count: the keyword
// must be in the description text.

const CLOSING_KEYWORD = /\b(?:close|closes|closed|fix|fixes|fixed|resolve|resolves|resolved)\b\s*:?\s+#(\d+)/gi;

/**
 * @returns {Promise<Array<{ number: number, nodeId: string, state: 'OPEN' | 'CLOSED', milestone: string | null }>>}
 */
async function getLinkedIssues({ github, core, owner, repo, pullNumber, body }) {
  const byNumber = new Map();

  const result = await github.graphql(
    `query($owner: String!, $repo: String!, $number: Int!) {
      repository(owner: $owner, name: $repo) {
        pullRequest(number: $number) {
          closingIssuesReferences(first: 25) {
            nodes {
              id
              number
              state
              milestone { title }
              repository { nameWithOwner }
            }
          }
        }
      }
    }`,
    { owner, repo, number: pullNumber },
  );
  for (const node of result.repository.pullRequest.closingIssuesReferences.nodes) {
    if (node.repository.nameWithOwner.toLowerCase() !== `${owner}/${repo}`.toLowerCase()) continue;
    byNumber.set(node.number, {
      number: node.number,
      nodeId: node.id,
      state: node.state,
      milestone: node.milestone ? node.milestone.title : null,
    });
  }

  const numbers = [...new Set([...(body || '').matchAll(CLOSING_KEYWORD)].map((match) => Number(match[1])))];
  for (const number of numbers) {
    if (byNumber.has(number)) continue;
    try {
      const { data: ref } = await github.rest.issues.get({ owner, repo, issue_number: number });
      if (ref.pull_request) continue; // a PR, not an issue
      byNumber.set(number, {
        number,
        nodeId: ref.node_id,
        state: ref.state === 'open' ? 'OPEN' : 'CLOSED',
        milestone: ref.milestone ? ref.milestone.title : null,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      core.warning(`Could not fetch referenced issue #${number}: ${message}`);
    }
  }

  return [...byNumber.values()].sort((a, b) => a.number - b.number);
}

module.exports = { getLinkedIssues, CLOSING_KEYWORD };
