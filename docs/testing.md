# Testing guidelines

How we write tests in this repo. [`AGENTS.md`](../AGENTS.md) holds the rules every change must follow (naming, coverage, no `.skip`); this doc is the style behind them. It is new and covers what we've settled so far. Add to it when a review settles a testing question.

## What to test, and at which level

- **Test behavior, not lines.** Assert what a user, a caller, or the database would see. A test that only runs code without a meaningful assertion doesn't count toward an issue's acceptance criteria.
- **Prefer the highest level that stays fast and deterministic.** For a Discord menu, that's an integration test through `MenuHarness`. It checks the rendered menu and the writes, so it survives refactors of the handlers underneath.
- **Don't test the same path twice.** If an integration test covers a path, don't also unit-test the handler behind it. Keep unit tests for what integration tests can't reach cheaply:
  - pure functions with many edge cases (a table of inputs, like `parsePokedexNo`)
  - paths that would need a lot of extra mocking to drive through a menu
- **Libraries** (`libs/*`) are tested headless with in-memory implementations of their ports. **Discord view builders** are pure functions: test their output directly.

## Files and naming

| Kind                | File                                 | Runs in                                                        |
| ------------------- | ------------------------------------ | -------------------------------------------------------------- |
| Unit                | `foo.test.ts` next to `foo.ts`       | the project's unit Jest project                                |
| Integration (bot)   | `foo.integration.test.ts` next to it | the `bot:integration` Jest project (`apps/bot/jest.config.ts`) |
| Shared test helpers | `apps/bot/src/testing/`              | test builds only (excluded from `tsconfig.app.json`)           |

Use only the `.test` suffix. CI rejects `*.spec.*` files.

## Writing a test

- **Arrange inline.** Each test sets up its own data and mocks, so a reader sees everything a test depends on without scrolling to a `beforeEach`. Repetition between tests is fine. Pull setup into a helper only when inline setup would hide what the test is about, and keep the helper in the same file until a second file needs it.
- **No per-file reset or teardown hooks.** Where a Jest setup file resets mocks and ends sessions for you (bot integration tests), don't repeat that with `beforeEach` / `afterEach`.
- **Type mocks with `jest.mocked(fn)`** on the real import, rather than casting `jest.requireMock(...)`.
- **Fixtures** that are plain data (a `DexEntry`, a region) can live at the top of the file. Anything stateful is created inside the test.

## Bot integration tests

Bot menus are driven headless with [`MenuHarness`](https://www.npmjs.com/package/@flowcord/testing) against the real FlowCord engine: no Discord connection.

- **Setup file:** `apps/bot/src/testing/integrationSetup.ts` runs before every integration test. It resets and restores all mocks and ends any open `MenuHarness` session.
- **Mock the data layer, not FlowCord.** Mock `@bot/cache` (and other I/O such as `searchPokemon`) per test with `jest.mocked(...)`. Mock only what the path you're testing calls; a missing mock fails loudly, which is how hidden dependencies between tests show up.
- **Register every menu the test navigates to**, wrapping each command's `createMenu`. Use an `async` wrapper when `createMenu` is async: FlowCord rejects a sync factory that returns a promise.
- **Assert on the rendered menu:** `harness.currentMenu`, `harness.hasText(...)`, `harness.queryButton(...)`. Then assert on writes (`saveRegion`, `saveServer`) and the resulting data.
- **Modals:** open with `harness.clickModal(label)`, then submit with `submitModalFields(harness, values)` from `src/testing/`. Don't use `harness.submitModal`: it only fakes `fields.getField`, while our handlers read the `ModalSubmitFields` collection (flowcord-dev/flowcord#112).
- **A test that times out** usually means a menu callback threw. The harness waits for a render that never comes. Look for an unmocked call first.

## Coverage

SonarCloud requires 80% coverage of new and changed lines. Check before pushing with `npx nx test <project> --coverage`, which writes line detail to `coverage/<project>/index.html`.

## Not written yet

Webapp (React components, tRPC routers), `shared` model tests, and in-memory port implementations for the libraries. Add a section here when the first of each lands.
