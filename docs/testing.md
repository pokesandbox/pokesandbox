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

| Kind                    | File                                 | Runs in                                                                                                 |
| ----------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| Unit                    | `foo.test.ts` next to `foo.ts`       | the project's unit Jest project                                                                         |
| Integration (bot)       | `foo.integration.test.ts` next to it | the `bot:integration` Jest project (`apps/bot/jest.config.ts`)                                          |
| Jest setup, workarounds | `apps/bot/src/testing/`              | test builds only (excluded from `tsconfig.app.json`); SonarCloud treats `testing/` folders as test code |

Use only the `.test` suffix. CI rejects `*.spec.*` files.

## Writing a test

- **No `beforeEach` / `afterEach` (or `beforeAll` / `afterAll`) in test files.** Hooks hide what a given test runs. Each test sets up its own data and mocks, or calls a helper function that does; a function call can be traced from the test, a hook can't. Housekeeping that applies to every test (resetting mocks, ending sessions) goes in a Jest setup file wired through the Jest config instead.
- **Keep each test file self-contained.** Shared setup goes in helper functions in the same test file, below the tests. Don't import test helpers from other files, even if that means two test files carry the same small helper. The one exception is a temporary workaround for a bug in an external package, which lives in `apps/bot/src/testing/` with a link to the bug and to the issue that deletes it (today: `submitModalFields`).
- **One top-level `describe` per file, named after the module under test, with a nested `describe` for each function (or menu) it tests.** Test names then read as a path (`commandRegistration › registrationTarget › …`) and a failure points straight at the function.
- **Type mocks with `jest.mocked(fn)`** on the real import, rather than casting `jest.requireMock(...)`.
- **Fixtures** that are plain data (a `DexEntry`, a region) can live at the top of the file. Anything stateful is created inside the test, or in a helper the test calls.

## Bot integration tests

Bot menus are driven headless with [`MenuHarness`](https://www.npmjs.com/package/@flowcord/testing) against the real FlowCord engine: no Discord connection.

- **Setup file:** `apps/bot/src/testing/integrationSetup.ts` runs before every integration test. It resets and restores all mocks and ends any open `MenuHarness` session.
- **Mock the data layer, not FlowCord.** Mock `@bot/cache` (and other I/O such as `searchPokemon`) per test with `jest.mocked(...)`. Mock only what the path you're testing calls; a missing mock fails loudly, which is how hidden dependencies between tests show up.
- **Register every menu the test navigates to**, wrapping each command's `createMenu`. Use an `async` wrapper when `createMenu` is async: FlowCord rejects a sync factory that returns a promise.
- **Assert on the rendered menu:** `harness.currentMenu`, `harness.hasText(...)`, `harness.queryButton(...)`. Then assert on writes (`saveRegion`, `saveServer`) and the resulting data.
- **Modals:** open with `harness.clickModal(label)`, then submit with `submitModalFields(harness, values)` from `apps/bot/src/testing/`. Don't use `harness.submitModal`: it only fakes `fields.getField`, while our handlers read the `ModalSubmitFields` collection (flowcord-dev/flowcord#112; #229 removes the helper once that's fixed).
- **A test that times out** usually means a menu callback threw. The harness waits for a render that never comes. Look for an unmocked call first.

## Coverage

SonarCloud requires 80% coverage of new and changed lines. Check before pushing with `npx nx test <project> --coverage`, which writes line detail to `coverage/<project>/index.html`.

## Not written yet

Webapp (React components, tRPC routers), `shared` model tests, and in-memory port implementations for the libraries. Add a section here when the first of each lands.
