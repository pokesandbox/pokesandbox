# apps/webapp: agent instructions

Next.js App Router + tRPC + NextAuth (Discord OAuth). Today: server discovery and profiles. From the MVP track: region authoring, mobile-first ([28](../../docs/architecture/concepts/28-webapp-authoring-and-mobile-first-ux.md)). Root rules: [`../../AGENTS.md`](../../AGENTS.md).

## Where things are

| Path                                           | Holds                                                                                                                                                       |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/(public)/`, `(private)/`, `(shared)/` | Route groups: no auth / auth-guarded layout / both (see `(shared)/SharedPage.tsx`)                                                                          |
| `src/app/_components/`, `_providers/`          | Shared components and providers (underscore = not a route)                                                                                                  |
| `src/app/api/`                                 | NextAuth handler and the tRPC fetch adapter only                                                                                                            |
| `src/trpc/`                                    | `init.ts` (`publicProcedure`, `protectedProcedure`), `routers/` (one per domain, composed in `_app.ts`), `server.ts` (`trpcServer()` for server components) |
| `src/auth.ts`                                  | NextAuth config                                                                                                                                             |

Reference router: [`src/trpc/routers/servers.ts`](src/trpc/routers/servers.ts). Reference page: [`src/app/(shared)/servers/`](<src/app/(shared)/servers/>), a thin server `page.tsx` plus a client component.

## Rules

- **All data goes through tRPC.** No Mongoose calls in components or pages, and no other API server (no Express, no REST routes).
- **Procedures return DTOs** (`FooDTO.convertFromEntity`, from `@shared/dtos`), never documents. Throw `TRPCError` (`NOT_FOUND`, `UNAUTHORIZED`, `BAD_REQUEST`).
- **Auth is enforced in the procedure**: `protectedProcedure` for mutations and anything user-specific. Route-group layouts are UI guarding only. Server-side roles are resolved through the bot or the Discord API, never trusted from the browser.
- **Authoring goes through `libs/authoring` commands** (#145) once it exists; procedures stay thin wrappers. The webapp never imports `libs/battle` and never runs battles or timers.
- **Respect privacy** for profiles and characters ([23 § Privacy](../../docs/architecture/concepts/23-players-characters-journeys-and-scopes.md#privacy-decided-oct-2026)).
- **Feature flags**: read the same `isEnabled(flag)` registry as the bot (#109).
- **Logging**: server code uses `logger` from `src/logger.ts`, never `console`. Pass errors as `err`.

## UI

- **Mobile-first** for every builder screen ([28 § Mobile-first rules](../../docs/architecture/concepts/28-webapp-authoring-and-mobile-first-ux.md#mobile-first-rules)).
- **Moving off antd** to Tailwind plus a headless library (trial #202, migration #203). Don't add new antd usage; use Tailwind for new UI, and ask on the issue if you need a complex component before #202 decides the library.
- Tailwind with `rem` units. Dark mode is required: every color has a `dark:` variant (`gold-*` light, `dgold-*` dark). Shared component classes go in `src/styles/globals.scss` (`@layer components`).
- Accessibility: WCAG 2.1 AA (semantic HTML, ARIA, alt text, contrast). Screenshots of UI changes in light and dark mode go in the PR's Manual checks.

## Checks

`npx nx test webapp`, `npx nx lint webapp`, `npx nx typecheck webapp`. CI also runs `build`, which catches server/client component boundary errors that typecheck misses.
