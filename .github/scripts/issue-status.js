// Keeps the Status field on the org project board in step with the PRs that close
// each issue. Called from .github/workflows/issue-status.yml (actions/github-script).
//
// The target status is derived from the PR's current state, not from the event alone,
// so re-runs are idempotent and an `edited` event picks up a newly added `Closes #N`:
//
//   merged               -> Done
//   closed, not merged   -> Ready  (skipped if the issue is closed, or another open PR still closes it)
//   open, draft          -> In Progress
//   open, not draft      -> In Review   (CODEOWNERS requests review on every non-draft PR)
//
// An issue already in Done is left alone, unless the PR was just reopened.

const { getLinkedIssues } = require('./linked-issues.js');

const STATUS = {
  READY: 'Ready',
  IN_PROGRESS: 'In Progress',
  IN_REVIEW: 'In Review',
  DONE: 'Done',
};

function desiredStatus(pull) {
  if (pull.merged) return STATUS.DONE;
  if (pull.state === 'closed') return STATUS.READY;
  return pull.draft ? STATUS.IN_PROGRESS : STATUS.IN_REVIEW;
}

module.exports = async ({ github, context, core, projectNumber }) => {
  const pull = context.payload.pull_request;
  const action = context.payload.action;
  const { owner, repo } = context.repo;
  const target = desiredStatus(pull);

  try {
    const issues = await getLinkedIssues({
      github,
      core,
      owner,
      repo,
      pullNumber: pull.number,
      body: pull.body,
    });
    if (issues.length === 0) {
      core.info(
        'No linked issues (closing keywords) in the PR body — nothing to update.',
      );
      return;
    }

    const projectResult = await github.graphql(
      `query($org: String!, $number: Int!) {
        organization(login: $org) {
          projectV2(number: $number) {
            id
            field(name: "Status") {
              ... on ProjectV2SingleSelectField { id options { id name } }
            }
          }
        }
      }`,
      { org: owner, number: projectNumber },
    );
    const project = projectResult.organization.projectV2;
    if (!project) {
      core.setFailed(
        `Org project #${projectNumber} was not found. Check the PROJECT_NUMBER variable and the PROJECTS_TOKEN permissions.`,
      );
      return;
    }
    const statusField = project.field;
    if (!statusField || !statusField.options) {
      core.setFailed('The project has no single-select "Status" field.');
      return;
    }
    const option = statusField.options.find(
      (candidate) => candidate.name.toLowerCase() === target.toLowerCase(),
    );
    if (!option) {
      core.warning(
        `The Status field has no "${target}" option — add it in the project settings.`,
      );
      return;
    }

    for (const issue of issues) {
      const label = `#${issue.number}`;

      // The issue's item on this project (if any), its current Status, and the other
      // open PRs that close it (only needed when reverting to Ready).
      const itemResult = await github.graphql(
        `query($nodeId: ID!) {
          node(id: $nodeId) {
            ... on Issue {
              state
              projectItems(first: 20) {
                nodes {
                  id
                  project { id }
                  fieldValueByName(name: "Status") {
                    ... on ProjectV2ItemFieldSingleSelectValue { name }
                  }
                }
              }
              closedByPullRequestsReferences(first: 20, includeClosedPrs: false) {
                nodes { number state }
              }
            }
          }
        }`,
        { nodeId: issue.nodeId },
      );
      const node = itemResult.node;
      const existing = node.projectItems.nodes.find(
        (item) => item.project.id === project.id,
      );
      const current =
        existing && existing.fieldValueByName
          ? existing.fieldValueByName.name
          : null;

      if (current === target) {
        core.info(`${label} is already "${target}".`);
        continue;
      }
      if (current === STATUS.DONE && action !== 'reopened') {
        core.info(`${label} is Done — leaving it alone.`);
        continue;
      }
      if (target === STATUS.READY) {
        if (node.state === 'CLOSED') {
          core.info(`${label} is closed — not reverting it to Ready.`);
          continue;
        }
        const otherOpenPrs = node.closedByPullRequestsReferences.nodes.filter(
          (other) => other.number !== pull.number && other.state === 'OPEN',
        );
        if (otherOpenPrs.length > 0) {
          core.info(
            `${label} is still closed by open PR(s) ${otherOpenPrs.map((other) => `#${other.number}`).join(', ')} — not reverting.`,
          );
          continue;
        }
      }

      let itemId = existing && existing.id;
      if (!itemId) {
        const addResult = await github.graphql(
          `mutation($projectId: ID!, $contentId: ID!) {
            addProjectV2ItemById(input: { projectId: $projectId, contentId: $contentId }) { item { id } }
          }`,
          { projectId: project.id, contentId: issue.nodeId },
        );
        itemId = addResult.addProjectV2ItemById.item.id;
        core.info(`Added ${label} to project #${projectNumber}.`);
      }

      await github.graphql(
        `mutation($projectId: ID!, $itemId: ID!, $fieldId: ID!, $optionId: String!) {
          updateProjectV2ItemFieldValue(input: {
            projectId: $projectId, itemId: $itemId, fieldId: $fieldId,
            value: { singleSelectOptionId: $optionId }
          }) { projectV2Item { id } }
        }`,
        {
          projectId: project.id,
          itemId,
          fieldId: statusField.id,
          optionId: option.id,
        },
      );
      core.info(`${label}: ${current || '(none)'} -> ${target}`);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (err.status === 401 || /bad credentials/i.test(message)) {
      core.setFailed(
        'PROJECTS_TOKEN was rejected (expired or revoked?). Rotate the fine-grained PAT and update the repository secret.',
      );
      return;
    }
    throw err;
  }
};

module.exports.desiredStatus = desiredStatus;
module.exports.STATUS = STATUS;
