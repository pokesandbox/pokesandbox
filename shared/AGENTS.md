# shared: agent instructions

Mongoose + Zod models, DTOs, the DB connection, and the cache service. Imported as `@shared/models`, `@shared/dtos`, `@shared/connectDb`, `@shared/cache`, and `@shared/flags` (reads `FEATURE_FLAGS` / `NODE_ENV` and a server's flag overrides for `@core/flags`). Root rules: [`../AGENTS.md`](../AGENTS.md).

Libraries (`libs/*`) never import this package's Mongoose models. Domain rules belong in `libs/engine` / `libs/authoring`, not in model statics ([03](../docs/architecture/concepts/03-engine-boundary-and-game-loop.md#package-layout--encapsulation-rules-decided-oct-2026)). Statics and query helpers here are for data access only.

## Model conventions

Reference: [`models/user.model.ts`](src/models/user.model.ts) (top-level model), [`models/location/wildTable.ts`](src/models/location/wildTable.ts) (embedded sub-schemas), [`models/region/region.model.ts`](src/models/region/region.model.ts) (maps).

| Thing                                 | Name / pattern                                                                                                                                                                                |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Zod schema (source of truth)          | `fooSchema`, usually `baseEntitySchema.extend({...})`                                                                                                                                         |
| Mongoose schema (mirrors the Zod one) | `fooDbSchema`                                                                                                                                                                                 |
| Types                                 | `IFoo = z.infer<typeof fooSchema>`, `Foo = HydratedDocument<IFoo>`, `IFooInput = IModelInput<IFoo>`                                                                                           |
| Query helpers / statics               | `IFooQueryHelpers`, `IFooModel extends Model<IFoo, IFooQueryHelpers>`; defined inline in the schema options (`query: {...}`, `statics: {...}`), not chained                                   |
| Populated queries                     | `PopulatedQuery<Result, IFoo, { field: Populated }>` from `models/types.ts`                                                                                                                   |
| Model export                          | `export const Foo = (models.Foo as IFooModel) \|\| model<IFoo, IFooModel>('Foo', fooDbSchema, 'foos')`: explicit lowercase plural collection name; the `models.Foo` check survives hot reload |
| Embedded sub-schemas                  | Standalone `const fooDbSchema = new Schema({...}, { _id: false })`, next to their Zod `fooSchema`                                                                                             |
| Map fields                            | Zod side parses with `zMapHydrator(valueSchema)` from `models/utils.ts`; Mongoose side uses `{ type: Map, of: fooDbSchema }`                                                                  |
| Registration                          | Export from `models/index.ts` (and the folder's `index.ts`)                                                                                                                                   |

- **Validation lives in Zod.** Mongoose validators beyond `required` / `enum`, and Mongoose middleware (pre/post hooks), are not used; keep side effects explicit.
- **Indexes** (unique keys, parent lookups) are declared in the schema (`fooDbSchema.index(...)`), see #118. Nothing builds them at startup (`autoIndex` is off everywhere); `npm run db:indexes` does, and `db:seed` runs it ([local development](../docs/local-development.md#indexes)).
- **Identity** ([02](../docs/architecture/concepts/02-identity-and-references.md#principles)): `z.instanceof(Types.ObjectId)` only for references to _documents_ (users, servers, characters, journeys, Pokémon instances). Authored content (locations, NPCs, scripts, shops…) is referenced by its region-scoped `key`, canon content by Showdown ID. The child stores its parent's ID; parents never keep child arrays. Species are referenced by `speciesId` (the Showdown ID) everywhere: pokedex slots, encounter slots, and DexEntry's own `baseSpecies`/`prevo`/`evos`/formes links. Remaining ObjectId content references and bidirectional arrays are legacy (#138, #139); don't add more.
- **Legacy:** `DexEntry` (`dexentry.model.ts`) has no Zod schema and uses a hand-written interface; the catalog rework (#157) replaces it. Don't copy it.

## DTOs

Reference: [`dtos/server.dto.ts`](src/dtos/server.dto.ts), [`dtos/user.dto.ts`](src/dtos/user.dto.ts).

- `fooDTOSchema = z.object({ ...fooSchema.shape, _id: z.string(), /* ObjectId fields as z.string() */ })`, `type FooDTO = z.infer<...>`.
- A `FooDTO` object with `convertFromEntity(entity: Foo): FooDTO` that returns `fooDTOSchema.parse(convertToDTO(entity))` (`dtos/utils.ts`). Always parse.
- Populated variants: `fooWithBarDTOSchema = fooDTOSchema.extend({ bar: barDTOSchema })`, with `convertFromEntity(entity: Omit<Foo, 'bar'> & { bar: Bar })`.
- Export from `dtos/index.ts`. tRPC procedures return DTOs, never documents.

## Cache

`@shared/cache` is a pluggable service (`ICacheService`). Cache only immutable or plain data (releases, catalog, `lean()` objects), never hydrated mutable documents ([15](../docs/architecture/concepts/15-persistence-concurrency-and-runtime.md#recommendations), #119).

## When you change a model

1. Update the Zod schema, then the Mongoose schema, then the DTO.
2. Update seed data in `scripts/seed/data/*.json` (and `scripts/seed/collections.ts` for a new collection).
3. Run `npm run erd:generate`; add a new top-level model to `scripts/generate-erd.ts`.
4. Tests: `npx nx test shared`. The `add-shared-model` skill has the full walkthrough.
