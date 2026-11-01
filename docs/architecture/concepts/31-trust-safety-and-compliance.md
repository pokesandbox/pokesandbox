# 31: Trust, Safety & Compliance

> **TL;DR (decided Nov 2026):** Three things every public Discord app needs and the docs didn't cover. **Verification:** an unverified Discord app can't join more than 100 servers, so the bot is verified before the Arena grows. It needs a public privacy policy and terms of service, and it requests **no privileged intents** (the current code requests all three without using them). **User data deletion:** a self-serve "delete my data" path from the Arena release, extended to adventure data for the MVP; other people's records keep their history but lose the deleted user's identity. **Reporting and takedown:** anything shown beyond the server it came from (discovery listings, public webapp pages, narration) can be reported, and the project owner can hide it.

**MVP impact:** Medium (verification and deletion are Arena-release blockers; reporting is an MVP-release blocker) · **Cost to change later:** Low for policies, medium for deletion if data isn't designed for it

## Discord verification and intents
- **The limit:** an unverified app can be in at most **100 servers**. Discord opens the verification application at 75. The Arena release could reach that, so verification is part of launch readiness (M2-15).
- **What verification asks for:** the owner's identity verification, a privacy policy URL and a terms of service URL on the app, and a justification for each **privileged intent** requested.
- **Privileged intents: none.** The bot is slash-command and component driven:
  - **Message Content:** only legacy prefix commands need it, and none exist (the message-command registry is empty). Custom server prefixes are deprecated and the prefix system is removed (M0A-25).
  - **Server Members:** not needed. Interactions carry the presser's member and roles, and the webapp's role checks fetch a single member over REST, which doesn't need the intent.
  - **Presence:** unused.
- **Least privilege for the rest too:** request only `Guilds` (and whatever a later feature proves it needs). The current extra non-privileged intents (messages, reactions, DMs, voice states, invites, webhooks) are dropped.
- **Future features keep it that way:** capturing narration from threads (post-MVP, [22](22-adventure-log-and-narration.md)) uses a **message context-menu command** ("Add to adventure log"), which receives the message's content without the Message Content intent.

## Policies
- A **privacy policy** and **terms of service**, written in plain language, kept in the repo and published as static pages (GitHub Pages) so they don't depend on the webapp, which isn't public at the Arena release.
- The privacy policy states what's stored (the user's Discord ID, username, and avatar; Arena teams, challenges, and battle records; later characters, journeys, Pokémon, logs, and narration), how long it's kept (battle-record retention, [14](14-battle-system-and-showdown.md)), and how to delete it.
- The terms cover acceptable use (no harassment, no illegal or explicit content in authored text, names, or images), that server admins are responsible for their regions' content, and that PokeSandbox is a non-commercial fan project with Pokémon rights belonging to their owners ([Q32](../open-questions.md)).
- `/about` in the bot and the webapp footer link to both.

## Deleting a user's data
- **Self-serve:** `/account delete` (and later a webapp button) shows what will be deleted, asks for confirmation, and runs as one job. Requests by other channels (e.g. email) are handled the same way within 30 days.
- **What happens to the user's own records:** deleted (the `User`, Arena teams, open challenges, preferences; for the MVP also characters, journeys, Pokémon, narration, nav layout).
- **What happens to records that involve other people:** they stay, because they're the other person's history, but the deleted user's identity is replaced by "Deleted user": an Arena match's opponent, the other side of a trade, a co-author on narration. Snapshots in adventure log entries ([22](22-adventure-log-and-narration.md)) already hold display data, so only names are rewritten.
- **Ongoing state:** live battles are forfeited and pending trades cancelled before deletion.
- **Server staff actions and audit logs** keep the user's Discord ID only where needed to enforce a ban, and the policy says so.
- **Data export** ("download my data") is later.

## Reporting and takedown
Server moderators already govern what happens inside their server; PokeSandbox needs its own tools only where content crosses servers.
- **Reportable:** region discovery listings (name, description, banner), public webapp profiles and character pages, public narration, and (later) shared library content and region bundles.
- **How:** a **Report** button on each of those surfaces, with a reason; reports go to a staff queue (a webapp admin page, plus a notification to a staff channel on the HQ server).
- **Takedown actions:** unlist a region from discovery, hide a profile, character, or narration entry, and block a user or server from discovery and sharing. Each action is audited and can be reversed.
- **Images:** authored images are URLs. Only `https` URLs are accepted, and a takedown hides the block that uses them.
- **In the Arena release:** Arena content (team names, nicknames in public battle messages) stays within the server it was posted in, so server moderators handle it. A Report entry point arrives with the webapp's public pages (MVP).

## MVP scope
- Arena release (M2): no privileged intents, prefix system removed, policies published, verification application, `/account delete` for Arena data.
- Deletion extended to adventure data by CP4 (the first public playtest); Report and the staff queue with takedown actions at the MVP Release.
- Later: data export, shared-content reporting (library, bundles), automated filters.

## Open questions
- None currently.
