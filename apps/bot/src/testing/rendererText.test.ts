import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

import { findHardCodedText } from './rendererText';

const SRC = join(__dirname, '..');

// Renderers written before t() (#115). Migrate one when you touch it, then remove it here.
const LEGACY_RENDERERS = [
  'embeds/errorEmbed.ts',
  'interactions/slashCommands/regionManagement/locations/location.embeds.ts',
  'interactions/slashCommands/regionManagement/locations/locations.embeds.ts',
  'interactions/slashCommands/regionManagement/pokedex/pokedex.embeds.ts',
  'interactions/slashCommands/regionManagement/progression/milestones/milestone.embeds.ts',
  'interactions/slashCommands/regionManagement/progression/progression.embeds.ts',
  'interactions/slashCommands/regionManagement/region/region.embeds.ts',
  'interactions/slashCommands/regionManagement/regions/regions.embeds.ts',
  'interactions/slashCommands/serverManagement/discovery/discovery.embeds.ts',
  'interactions/slashCommands/serverManagement/server/server.embeds.ts',
];

/** View builders: `*.embeds.ts` files and everything in `src/embeds`. */
function rendererFiles(): string[] {
  return readdirSync(SRC, { recursive: true, encoding: 'utf8' })
    .map((path) => path.split('\\').join('/'))
    .filter((path) => !path.endsWith('.test.ts'))
    .filter(
      (path) => path.endsWith('.embeds.ts') || /^embeds\/.+\.ts$/.test(path),
    )
    .sort();
}

describe('renderer text', () => {
  it('has no hard-coded player-facing text outside legacy renderers', () => {
    const findings = rendererFiles()
      .filter((path) => !LEGACY_RENDERERS.includes(path))
      .flatMap((path) =>
        findHardCodedText(readFileSync(join(SRC, path), 'utf8'), path).map(
          ({ line, text }) =>
            `${path}:${line} ${text} (use t() from @core/i18n)`,
        ),
      );

    expect(findings).toEqual([]);
  });

  it.each(LEGACY_RENDERERS)(
    'still lists %s only while it has hard-coded text',
    (path) => {
      const source = readFileSync(join(SRC, path), 'utf8');

      expect(findHardCodedText(source, path)).not.toEqual([]);
    },
  );

  it('scans the shared embeds folder and feature renderers', () => {
    expect(rendererFiles()).toEqual(
      expect.arrayContaining(['embeds/errorEmbed.ts', ...LEGACY_RENDERERS]),
    );
  });
});

describe('findHardCodedText', () => {
  it('flags literals passed to text builder methods', () => {
    const source = [
      "new EmbedBuilder().setTitle('Pokédex')",
      '  .setDescription(`Region ${name}`);',
    ].join('\n');

    expect(findHardCodedText(source)).toEqual([
      { line: 1, text: "'Pokédex'" },
      { line: 2, text: '`Region ${name}`' },
    ]);
  });

  it('flags literals in text properties', () => {
    const source =
      "reply({ content: 'Done!', embeds: [{ fields: [{ name: 'HP', value: `${hp}` }] }] });";

    expect(findHardCodedText(source).map((finding) => finding.text)).toEqual([
      "'Done!'",
      "'HP'",
    ]);
  });

  it('allows t() calls, variables, and text without letters', () => {
    const source = [
      "embed.setTitle(t('pokedex.title'));",
      'embed.setDescription(description);',
      "fields.push({ name: '\\u200b', value: '•' });",
      "button.setCustomId('pokedex:open:1');",
    ].join('\n');

    expect(findHardCodedText(source)).toEqual([]);
  });
});
