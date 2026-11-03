---
name: add-shared-model
description: Use when adding a new Mongoose + Zod model or DTO in PokeSandbox's shared package, or changing an existing one's fields. Walks through schema naming, types, statics, registration, DTOs, seed data, and the ERD.
---

# Adding or changing a shared model

Conventions: `shared/AGENTS.md`. Identity rules: concept 02 (`docs/architecture/concepts/02-identity-and-references.md`). Copy from the real files named below rather than from memory.

## 1. Decide what it is

- A **document** (independent lifecycle: user, server, character, journey, Pokémon instance, release) gets its own model, and other documents reference it by ObjectId.
- A **content entry** (location, NPC, script, shop…) has a region-scoped `key` (separate from `_id`, unique on `{ regionId, key }`) and is referenced by that key, never by `_id`.
- Canon data (species, moves, items) is referenced by Showdown ID strings.
- The child stores its parent's ID. Never add a child array to the parent.

If the issue doesn't make this clear, ask on the issue.

## 2. Zod schema and types

In `shared/src/models/<name>.model.ts` (or a folder with an `index.ts`), following `user.model.ts`:

1. `export const fooSchema = baseEntitySchema.extend({ … })`: the source of truth.
2. `export type IFoo = z.infer<typeof fooSchema>;`, `IFooInput = IModelInput<IFoo>`, `Foo = HydratedDocument<IFoo>`.
3. Map fields: `zMapHydrator(valueSchema)` from `models/utils.ts` (see `region/region.model.ts`).

## 3. Mongoose schema

1. `interface IFooQueryHelpers { … }` returning `QueryWithHelpers<any, Foo, IFooQueryHelpers>`, and `interface IFooModel extends Model<IFoo, IFooQueryHelpers> { … }` for statics. Use `PopulatedQuery` (`models/types.ts`) for statics that populate.
2. `export const fooDbSchema = new Schema<IFoo, IFooModel, Record<string, never>, IFooQueryHelpers>({ … }, { query: { … }, statics: { … } })`: helpers inline in the options.
3. Embedded sub-schemas: `const barDbSchema = new Schema({ … }, { _id: false })` next to `barSchema` (see `location/wildTable.ts`). Maps: `{ type: Map, of: barDbSchema }`.
4. Indexes: `fooDbSchema.index({ … }, { unique: … })` for unique keys and parent lookups.
5. Only `required` / `enum` as Mongoose validation; no middleware hooks. Data-access statics only: domain rules belong in `libs/engine` / `libs/authoring`.
6. `export const Foo = (models.Foo as IFooModel) || (model<IFoo, IFooModel>('Foo', fooDbSchema, 'foos') as IFooModel);`
7. Export from `shared/src/models/index.ts`.

## 4. DTO (if the webapp or bot reads it)

Following `dtos/server.dto.ts`:

1. `export const fooDTOSchema = z.object({ ...fooSchema.shape, _id: z.string(), /* ObjectId fields → z.string() */ });` and `export type FooDTO = z.infer<typeof fooDTOSchema>;`
2. `export const FooDTO = { convertFromEntity(entity: Foo): FooDTO { return fooDTOSchema.parse(convertToDTO(entity)); } };`
3. Populated variant: `fooWithBarDTOSchema = fooDTOSchema.extend({ bar: barDTOSchema })`, with `convertFromEntity(entity: Omit<Foo, 'bar'> & { bar: Bar })`.
4. Export from `shared/src/dtos/index.ts`.

## 5. Seed data, ERD, tests

1. Seed data: `scripts/seed/data/<collection>.json`, registered in `scripts/seed/collections.ts`.
2. Add a new top-level model to `scripts/generate-erd.ts`, then run `npm run erd:generate`.
3. Tests next to the code (`*.test.ts`), then `npm run affected`.
