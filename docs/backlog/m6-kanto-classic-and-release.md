# Trust & Safety for the MVP (backlog draft, partial)

> **Milestones (Nov 2026):** the old M6 milestone was replaced by the Kanto checkpoints and the MVP Release. **M6-02 lands in CP4** (before community members play the first public playtest), **M6-01 in the MVP Release**. Draft IDs keep their `M6-` names.

Drafted so far: the **Trust & Safety** epic (E-M6-1). The Kanto Classic generator, authoring, playtests, webapp hosting, and release work are listed per checkpoint in [`mvp.md`](../roadmap/mvp.md#the-kanto-checkpoints-cp0acp8) and drafted later.

## Start here
New to the project? Read [`docs/start-here.md`](../start-here.md) first. Context specific to this file:
- **Where this fits:** the MVP is built as Kanto checkpoints; the MVP Release is when the webapp goes public and Kanto Classic opens beyond the PokeSandbox server.
- **Why trust and safety lands here:** community members create adventure data from the CP4 public playtest (so deletion must cover it by then), and the MVP Release is the first time content crosses servers (region discovery, public webapp pages, narration). The Arena release already has verification, policies, and Arena data deletion (M2-15, M2-16).
- **Read before starting:** concept [31](../architecture/concepts/31-trust-safety-and-compliance.md).

## E-M6-1 · Trust & Safety
`Type: Epic` · `Priority: P0`

Reporting and takedown for content shown beyond its server, and user data deletion extended to adventure data ([31](../architecture/concepts/31-trust-safety-and-compliance.md)).

### M6-01 · Report content and owner takedown tools
`Type: Feature` · `Parent: E-M6-1` · `Priority: P0` · `Size: L` · `Labels: area:webapp, area:bot, area:shared-models` · `Blocked by: webapp hosting (CP1), discovery listing, public profile pages (MVP Release)` · `agent-ready: no` · `Owner: senior`

**Summary:** Anything shown beyond the server it came from can be reported, and project staff can hide it.

**Acceptance criteria**
- A **Report** action on: region discovery listings, public webapp profile and character pages, and public narration entries. A report records the target, reporter, reason (from a short list plus free text), and time; one report per user per target.
- A **staff queue**: a webapp admin page (project staff role only) listing open reports grouped by target, plus a notification to a staff channel on the HQ server.
- **Takedown actions**, each audited and reversible: unlist a region from discovery, hide a profile, character, or narration entry, and block a user or server from discovery. Hidden content shows "This content was removed" to everyone except its owner, who sees why.
- Authored image blocks accept only `https` URLs; hiding a block removes the image everywhere it renders.
- Abuse limits on reporting (per-user rate limit).
- Tests cover report creation, deduplication, each takedown action and its reversal, and visibility for the owner versus others.

**Refs:** [31 § Reporting and takedown](../architecture/concepts/31-trust-safety-and-compliance.md#reporting-and-takedown), [23 § Privacy](../architecture/concepts/23-players-characters-journeys-and-scopes.md#privacy-decided-oct-2026)

### M6-02 · Extend `/account delete` to adventure data
`Type: Feature` · `Parent: E-M6-1` · `Priority: P0` · `Size: M` · `Labels: area:engine, area:shared-models, area:webapp` · `Blocked by: M2-16` · `agent-ready: no` · `Owner: senior`

**Summary:** Everything the MVP adds per user is covered by deletion before the MVP release.

**Acceptance criteria**
- **Deleted:** characters, journeys, owned Pokémon, the user's narration, nav layout and preferences. Active play sessions end; live adventure battles are ended; pending trades are cancelled.
- **Kept but anonymized:** the other side of completed trades, co-authored narration on someone else's entry, and adventure log entries of other journeys that mention the user ("Deleted user"). Pokémon a deleted user traded away stay with their new owner; their original trainer shows "Deleted user".
- Region content a user authored stays with the server (it belongs to the server, not the user); the authoring audit log keeps an anonymized actor.
- A webapp "Delete my data" button calls the same job.
- The data inventory (M2-16) and the privacy policy are updated, and a test covers each record type.

**Refs:** [31 § Deleting a user's data](../architecture/concepts/31-trust-safety-and-compliance.md#deleting-a-users-data)
