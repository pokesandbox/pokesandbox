import { z } from 'zod';

import { sideIdSchema, statusSchema } from './battle-spec';

export const TURN_ACTIONS = ['move', 'switch', 'item', 'catch', 'run'] as const;

/** One action in a turn, compact enough to keep forever in the adventure log (22). */
export const turnDigestActionSchema = z.object({
  side: sideIdSchema,
  /** Species ID of the acting Pokémon. */
  pokemon: z.string().min(1),
  action: z.enum(TURN_ACTIONS),
  /** The move, item, or species switched in, as a Showdown ID. */
  detail: z.string().min(1),
  result: z.object({
    damagePct: z.number().min(0).max(100).optional(),
    ko: z.boolean().optional(),
    crit: z.boolean().optional(),
    /** Type multiplier, e.g. 0.5 or 2. */
    effectiveness: z.number().min(0).optional(),
    status: statusSchema.optional(),
  }),
});
export type TurnDigestAction = z.infer<typeof turnDigestActionSchema>;

export const turnDigestSchema = z.object({
  turn: z.number().int().min(0),
  actions: z.array(turnDigestActionSchema),
});
export type TurnDigest = z.infer<typeof turnDigestSchema>;
