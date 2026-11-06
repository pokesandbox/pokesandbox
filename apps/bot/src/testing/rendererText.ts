import ts from 'typescript';

/** Builder methods whose first argument is text a player reads. */
const TEXT_METHODS = new Set([
  'setTitle',
  'setDescription',
  'setLabel',
  'setPlaceholder',
  'setContent',
  'setName',
  'setValue',
]);

/** Object properties that hold text a player reads in Discord payloads. */
const TEXT_PROPERTIES = new Set([
  'content',
  'title',
  'description',
  'label',
  'placeholder',
  'name',
  'value',
  'text',
]);

export interface RendererTextFinding {
  line: number;
  text: string;
}

// Separators, emoji, and zero-width spaces have no letters and need no translation.
function isWords(node: ts.Node): boolean {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    return /\p{L}/u.test(node.text);
  }
  if (ts.isTemplateExpression(node)) {
    return [
      node.head.text,
      ...node.templateSpans.map((s) => s.literal.text),
    ].some((part) => /\p{L}/u.test(part));
  }
  return false;
}

/** String literals passed straight in as message content, instead of `t()`. */
export function findHardCodedText(
  source: string,
  fileName = 'renderer.ts',
): RendererTextFinding[] {
  const file = ts.createSourceFile(
    fileName,
    source,
    ts.ScriptTarget.Latest,
    true,
  );
  const findings: RendererTextFinding[] = [];
  const report = (node: ts.Node) =>
    findings.push({
      line: file.getLineAndCharacterOfPosition(node.getStart()).line + 1,
      text: node.getText(),
    });

  const visit = (node: ts.Node) => {
    if (
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      TEXT_METHODS.has(node.expression.name.text) &&
      node.arguments[0] &&
      isWords(node.arguments[0])
    ) {
      report(node.arguments[0]);
    }
    if (
      ts.isPropertyAssignment(node) &&
      (ts.isIdentifier(node.name) || ts.isStringLiteral(node.name)) &&
      TEXT_PROPERTIES.has(node.name.text) &&
      isWords(node.initializer)
    ) {
      report(node.initializer);
    }
    ts.forEachChild(node, visit);
  };
  visit(file);
  return findings.sort((a, b) => a.line - b.line);
}
