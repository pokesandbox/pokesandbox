# 30: Internationalization Readiness

> **TL;DR (decided Nov 2026, Q38):** Translation ships much later, but the data model is ready for it from the start. **Authored text stays in the author's language inside the content** (each region declares its `sourceLocale`). **Translations are separate records** keyed by the content's key, the field, and a stable item ID, so adding a language never changes content schemas, never conflicts with authors' edits, and can detect when the source text changed. **Every list item that holds text gets a stable ID** now (passage blocks, flavor variants, choice options, description variants). **System text uses message keys** with ICU MessageFormat, English only for now. **Events carry references, not finished strings**, so each viewer's text is resolved in their language at render time.

**MVP impact:** Low (stable IDs, `sourceLocale`, message keys for system text, no string concatenation) · **Cost to change later:** High if skipped: every text field and every hard-coded string would need a migration

## What needs translating

| Text | Owner | How it's translated later |
|---|---|---|
| **Authored content**: location names and descriptions, script passages and choices, NPC names, progression and milestone names, shop names, gate `lockedText`, region discovery text | the region | `Translation` records |
| **Flavor** (canon pack, server packs, region entries) | pack or region | `Translation` records per variant, or locale-only entries (below) |
| **Server library content**: custom species, move, and item names and descriptions | the server's library ([27](27-server-content-library-and-overrides.md)) | `Translation` records |
| **Canon catalog**: species, move, and item names and descriptions | the project (imported data) | Localized names imported as catalog data from a licensed source; Showdown's text is English only |
| **Battle log** | Showdown text templates | A translated copy of the battle text table per locale (separate project) |
| **System text**: engine responses, explanations, reward lines, validator messages, Arena messages, menus | the project | Message catalogs per locale |
| **Discord commands**: names, descriptions, options | the project | Discord's built-in command localizations |
| **Player-written text**: narration, nicknames, character names | players | Never translated |

## Design

### 1. Source text stays in the content
Content keeps one source string or `Passage` per field, in the region's `sourceLocale` (or the library's or pack's). Nothing becomes `Record<locale, string>`. Authors keep editing exactly what they see today.

```ts
Region { …; sourceLocale: Locale }          // BCP 47, e.g. 'en', 'fr', 'pt-BR'; default 'en'
ServerLibrary { …; sourceLocale: Locale }
FlavorPack { …; sourceLocale: Locale }
```

### 2. Translations are separate records
```ts
Translation {
  owner: { regionId } | { libraryId } | { pack: PackRef };
  target: { kind: 'location' | 'script' | 'npc' | 'flavor' | 'progression' | 'species' | …; key: ContentKey | string;
            field: string;                   // 'name', 'description', 'steps', 'variants', 'descriptionVariants'
            path?: string[] };               // stable ids down to the text: ['v3', 'b7'] = variant v3, block b7
  locale: Locale;
  text: string;                              // the translation unit is one text segment: a name, a prose block, a dialogue line, a caption
  sourceHash: string;                        // hash of the source text when translated
  status: 'draft' | 'reviewed';
}
```
- **The unit of translation is one text segment**, not a whole passage: a name, one prose block, one dialogue line's text, one image caption, one choice label. It's how translation tools work (segments), and how block-based content systems do it (e.g. Sanity's `_key` on every rich-text block). Speakers and images aren't translated in the passage: a speaker's name comes from the NPC's own translated name, and an image stays the same. A language that needs a differently structured passage (reordered blocks, a joke that doesn't carry over) uses a locale-only flavor entry instead ([6](#6-locale-specific-flavor)).
- **Why separate:** content schemas never change for a new language; translators don't take content edit locks or conflict with authors' optimistic concurrency ([16](16-authoring-validation-and-portability.md)); translations can be exported to and imported from standard tools; a region can publish without every language being complete.
- **Stale detection:** if the source text's hash no longer matches `sourceHash`, the translation is marked stale in the builder, and the player sees the source text until it's updated (or the stale translation, per a region setting).
- **Releases embed translations** that exist at publish time, like other resolved data ([01](01-content-vs-state-and-publishing.md)). A translation-only update can later publish without content changes.
- **Fallback chain:** requested locale → its base language (`pt-BR` → `pt`) → the content's source locale.

### 3. Stable IDs on every text item in a list
Translations and flavor picks must survive reordering, so array indexes are never used as references:
- `PassageBlock` gets `id` (short, generated by the builder).
- Script `steps[]` get `id` ([07](07-scripts-triggers-and-events.md)).
- Flavor `variants[]` get `id` (on the variant, beside its passage; the `Passage` itself has no id because it's always addressed through its owner).
- Script `choice` options get `id`.
- `descriptionVariants[]` get `id`.
- Milestones, NPCs, locations, and edges already have keys or unique targets.

An address is always **owner key + field + ids down to the segment**. For example, the second line of Oak's intro is `script:scr-oak-intro` · `steps` · `['s4', 'b2']`, and a canon faint line is `flavor:fl-faint-own` · `variants` · `['v3', 'b1']`. Reordering steps, blocks, or variants never breaks a translation.

### 4. Events carry references; rendering resolves the language
- A flavor pick is `{ entry: ContentKey; variantId: string }` on the event, not baked text. The presentation layer resolves it into a `Passage` in the viewer's locale (from the release's translations) before the pure view builders run ([26](26-discord-surface-and-ux-patterns.md)). The seeded pick is the same in every language, so two viewers see the same moment in their own words.
- Default lines ("A wild {species} appeared!") are message keys with parameters, not strings.
- **Placeholders are structured values**, never pre-formatted names: `{pokemon}` resolves to the nickname or the species name in the viewer's locale.

### 5. System text uses message keys
Message keys (`encounter.wildAppeared`) in catalog files are the standard pattern for an app's own text; stable ids are the standard pattern for authored content. We use both, each for what it's built for.

**Libraries, not hand-rolled:**
- **System text:** [FormatJS](https://formatjs.github.io/)'s `intl-messageformat` in `libs/core` (bot and engine), and `next-intl` in the webapp. Both use ICU MessageFormat, so one set of catalog files serves both. ICU handles plurals, gender, and selects, which are easy to get wrong by hand. (i18next is the main alternative; its own format and ecosystem are fine, but ICU is the more portable standard.) Confirm current versions when M0A-23 starts.
- **Formatting:** the built-in `Intl` APIs (numbers, money, dates, lists).
- **Discord commands:** discord.js's built-in name and description localizations.
- **Content translations:** our own `Translation` model (above), because it's domain data; no library owns it. Translation workflow later exports and imports segments in a standard format (XLIFF or JSON) for tools like Weblate or Crowdin, both of which have free plans for open-source projects.

- All player-facing system text goes through `t(key, params)` with **ICU MessageFormat** (plurals, gender, number formatting), from a message catalog per locale. Only English exists for now.
- **No string concatenation** to build sentences ("You received " + n + " " + item): word order, plurals, and grammatical gender differ by language.
- Money, numbers, and dates are formatted with `Intl` in the viewer's locale.

### 6. Locale-specific flavor
A translation of a flavor variant is usually enough, but jokes and wordplay often don't translate. A flavor entry can declare `match.locale`, so a language can have its own lines instead of (or as well as) translations. It's one more qualifier for most-specific-match ([29](29-flavor-text-and-prose.md)).

### 7. Which language a player sees
- **Discord:** the player's preference (later, on the user) → the Discord interaction's `locale` → the server's preferred locale (`guild.preferredLocale`, or a server setting) → the region's source locale.
- **Shared messages** (the Arena's public battle message, trade messages) are seen by several people at once, so they use the **server's** locale; private prompts use each player's.
- **Webapp:** the same preference chain, through a standard Next.js i18n library when the time comes.

## MVP scope (readiness only, no translations)
- `sourceLocale` on regions (default `en`).
- Stable `id`s on script steps, passage blocks, choice options, and description variants (and flavor variants when flavor ships).
- System text in the bot and engine through `t(key, params)` with an English message catalog; no hard-coded player-facing strings in renderers, and no sentence concatenation.
- Events carry references and structured placeholder values.
- Not MVP: `Translation` records, translation tools in the builder, localized catalog names, translated battle text, other locales' message catalogs, Discord command localizations, player locale preference.

## Open questions
- Which licensed source to use for localized canon names (species, moves, items) when the time comes.
- Whether to translate Showdown's battle text ourselves or contribute to an upstream effort.
