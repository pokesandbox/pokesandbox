import { z } from 'zod';

import {
  battleIdSchema,
  pokemonRefSchema,
  sideIdSchema,
  statusSchema,
} from './battle-spec';
import { jsonValueSchema } from './json';
import { statePatchSchema } from './patch';

/** What the engine's rules need to know about one Pokémon in the battle. */
export const battlerSnapshotSchema = z.object({
  pokemon: pokemonRefSchema,
  species: z.string().min(1),
  level: z.number().int().min(1).max(100),
  hp: z.number().int().min(0),
  maxHp: z.number().int().min(1),
  status: statusSchema.optional(),
  speed: z.number().int().min(0),
});
export type BattlerSnapshot = z.infer<typeof battlerSnapshotSchema>;

const base = {
  battleId: battleIdSchema,
  side: sideIdSchema,
  turn: z.number().int().min(0),
};

/** A bag item, catch, or run: choices the battle hands to the engine to resolve. */
export const externalActionContextSchema = z.discriminatedUnion('action', [
  z.object({
    ...base,
    action: z.literal('item'),
    item: z.string().min(1),
    target: battlerSnapshotSchema,
  }),
  z.object({
    ...base,
    action: z.literal('catch'),
    /** The ball's Showdown item ID. */
    item: z.string().min(1),
    target: battlerSnapshotSchema,
  }),
  z.object({
    ...base,
    action: z.literal('run'),
    self: battlerSnapshotSchema,
    target: battlerSnapshotSchema,
    /** Earlier run attempts this battle. */
    attempts: z.number().int().min(0),
  }),
]);
export type ExternalActionContext = z.infer<typeof externalActionContextSchema>;

const shakes = z.number().int().min(0).max(3);

export const externalOutcomeSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('caught'), shakes }),
  z.object({ kind: z.literal('notCaught'), shakes }),
  z.object({ kind: z.literal('escaped') }),
  z.object({ kind: z.literal('escapeFailed') }),
  z.object({ kind: z.literal('itemUsed'), patches: z.array(statePatchSchema) }),
  z.object({
    kind: z.literal('rejected'),
    /** An i18n message key explaining why, with its params (30). */
    messageKey: z.string().min(1),
    params: z.record(z.string(), jsonValueSchema).optional(),
  }),
]);
export type ExternalOutcome = z.infer<typeof externalOutcomeSchema>;
