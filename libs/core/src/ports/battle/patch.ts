import { z } from 'zod';

import { pokemonRefSchema, statTableSchema, statusSchema } from './battle-spec';

/** A change the engine injects into a live battle. */
export const statePatchSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('levelUp'),
    pokemon: pokemonRefSchema,
    level: z.number().int().min(1).max(100),
    /** Recalculated stats; current HP rises by the max HP gained. */
    stats: statTableSchema,
  }),
  z.object({
    kind: z.literal('moveSlot'),
    pokemon: pokemonRefSchema,
    index: z.number().int().min(0).max(3),
    move: z.string().min(1),
  }),
  z.object({
    kind: z.literal('setHp'),
    pokemon: pokemonRefSchema,
    hp: z.number().int().min(0),
  }),
  z.object({
    kind: z.literal('setStatus'),
    pokemon: pokemonRefSchema,
    status: statusSchema.nullable(),
  }),
]);
export type StatePatch = z.infer<typeof statePatchSchema>;
