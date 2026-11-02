// Branch-name and commit-subject conventions (CONTRIBUTING.md, AGENTS.md).
// One source of truth for both checks that apply them:
//   - .husky/commit-msg:          node .github/scripts/conventions.js commit-msg <file>
//   - .github/workflows/pr-gate.yml (Conventions step), via require()
// Plain CommonJS with no dependencies, so the PR gate can load it from a sparse checkout.

const MAX_SUBJECT_LENGTH = 72;
const TYPES = [
  'feat',
  'fix',
  'refactor',
  'test',
  'docs',
  'chore',
  'ci',
  'style',
  'perf',
  'build',
];

// [#104] docs: summary   |   [#104] refactor(shared): summary
const SUBJECT = new RegExp(
  `^\\[#(\\d+)\\] (?:${TYPES.join('|')})(?:\\([a-z0-9-]+\\))?: \\S.*$`,
);
// Commits git or GitHub write for you, and autosquash markers.
const EXEMPT_SUBJECT = /^(?:Merge |Revert "|(?:fixup|squash|amend)! )/;
// 104-encode-architecture-rules
const BRANCH = /^(\d+)-[a-z0-9]+(?:-[a-z0-9]+)*$/;
// Non-closing references to an issue, e.g. "Part of #104" in a split follow-up PR.
const REFERENCE_KEYWORD = /\b(?:part of|follows|refs?)\b\s*:?\s+#(\d+)/gi;

const EXAMPLE = '[#104] docs: add agent rules';

/**
 * @returns {{ ok: boolean, exempt?: boolean, issue?: number, reason?: string }}
 */
function checkCommitSubject(subject) {
  const line = (subject || '').trim();
  if (EXEMPT_SUBJECT.test(line)) return { ok: true, exempt: true };
  const match = SUBJECT.exec(line);
  if (!match) {
    return {
      ok: false,
      reason: `Commit subject must be "[#<issue>] <type>(<scope>)?: <summary>", e.g. "${EXAMPLE}". Types: ${TYPES.join(', ')}.`,
    };
  }
  if (line.length > MAX_SUBJECT_LENGTH) {
    return {
      ok: false,
      issue: Number(match[1]),
      reason: `Commit subject is ${line.length} characters; keep it to ${MAX_SUBJECT_LENGTH} and put details in the body.`,
    };
  }
  return { ok: true, issue: Number(match[1]) };
}

/**
 * @returns {{ ok: boolean, issue?: number, reason?: string }}
 */
function checkBranchName(branch) {
  const match = BRANCH.exec(branch || '');
  if (!match) {
    return {
      ok: false,
      reason: `Branch "${branch}" must be "<issue>-<kebab-description>", e.g. "104-encode-architecture-rules".`,
    };
  }
  return { ok: true, issue: Number(match[1]) };
}

/** Issue numbers named with a non-closing keyword ("Part of #104"). */
function getReferencedIssueNumbers(body) {
  return [
    ...new Set(
      [...(body || '').matchAll(REFERENCE_KEYWORD)].map((m) => Number(m[1])),
    ),
  ];
}

/** The subject from a commit message file: the first line that isn't a git comment. */
function subjectFromMessage(message) {
  return (
    message
      .split(/\r?\n/)
      .find((line) => line.trim() !== '' && !line.startsWith('#')) || ''
  );
}

module.exports = {
  checkBranchName,
  checkCommitSubject,
  getReferencedIssueNumbers,
  subjectFromMessage,
  MAX_SUBJECT_LENGTH,
  TYPES,
};

// CLI: node .github/scripts/conventions.js commit-msg <message-file>
if (require.main === module) {
  const [mode, file] = process.argv.slice(2);
  if (mode !== 'commit-msg' || !file) {
    console.error(
      'Usage: node .github/scripts/conventions.js commit-msg <message-file>',
    );
    process.exit(2);
  }
  const message = require('node:fs').readFileSync(file, 'utf8');
  const result = checkCommitSubject(subjectFromMessage(message));
  if (!result.ok) {
    console.error(`✖ ${result.reason}`);
    console.error('  See CONTRIBUTING.md#commit-messages.');
    process.exit(1);
  }
}
