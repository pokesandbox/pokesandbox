import { z } from 'zod';

import {
  persistentStateSchema,
  pokemonRefSchema,
  sideIdSchema,
} from './battle-spec';
import { turnDigestSchema } from './digest';
import { jsonValueSchema } from './json';

const turn = z.number().int().min(0);

export const battleEndedSideSchema = z.object({
  side: sideIdSchema,
  /** Indexed like the side's team in the BattleSpec. */
  pokemon: z.array(persistentStateSchema.required({ hp: true })),
});

/** What a battle reports to its subscribers; derived from the Showdown protocol. */
export const battleEventSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('request'),
    side: sideIdSchema,
    /** Echoed back by `choose`; a stale or answered rqid is a no-op. */
    rqid: z.number().int().min(0),
    /** Showdown's request JSON for this side. */
    request: jsonValueSchema,
  }),
  z.object({
    kind: z.literal('move'),
    turn,
    user: pokemonRefSchema,
    move: z.string().min(1),
    targets: z.array(pokemonRefSchema),
  }),
  z.object({
    kind: z.literal('damage'),
    turn,
    pokemon: pokemonRefSchema,
    hp: z.number().int().min(0),
    maxHp: z.number().int().min(1),
  }),
  z.object({ kind: z.literal('faint'), turn, pokemon: pokemonRefSchema }),
  z.object({ kind: z.literal('turnEnded'), turn, digest: turnDigestSchema }),
  z.object({
    kind: z.literal('ended'),
    /** Null when the battle is a draw or ended without a winner (caught, ran). */
    winner: sideIdSchema.nullable(),
    sides: z.array(battleEndedSideSchema),
    faints: z.array(pokemonRefSchema),
    turns: turn,
    caught: z.boolean().optional(),
    ran: z.boolean().optional(),
  }),
  z.object({ kind: z.literal('recovered') }),
]);
export type BattleEvent = z.infer<typeof battleEventSchema>;
