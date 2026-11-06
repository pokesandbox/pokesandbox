import { z } from 'zod';

export const battleIdSchema = z.string().min(1);
export type BattleId = z.infer<typeof battleIdSchema>;

export const SIDE_IDS = ['p1', 'p2', 'p3', 'p4'] as const;
export const sideIdSchema = z.enum(SIDE_IDS);
export type SideId = z.infer<typeof sideIdSchema>;

/** Showdown's major status conditions. */
export const STATUSES = ['brn', 'par', 'slp', 'frz', 'psn', 'tox'] as const;
export const statusSchema = z.enum(STATUSES);
export type Status = z.infer<typeof statusSchema>;

/** A Pokémon by its side and its index in that side's team (not its active position). */
export const pokemonRefSchema = z.object({
  side: sideIdSchema,
  slot: z.number().int().min(0).max(5),
});
export type PokemonRef = z.infer<typeof pokemonRefSchema>;

const stat = z.number().int().min(0);
export const statTableSchema = z.object({
  hp: stat,
  atk: stat,
  def: stat,
  spa: stat,
  spd: stat,
  spe: stat,
});
export type StatTable = z.infer<typeof statTableSchema>;

/** State that persists between battles; omitted fields start full/healthy. */
export const persistentStateSchema = z.object({
  hp: z.number().int().min(0).optional(),
  status: statusSchema.optional(),
  pp: z.array(z.number().int().min(0)).max(4).optional(),
});
export type PersistentState = z.infer<typeof persistentStateSchema>;

/** A Showdown-style set plus persistent state. IDs are Showdown IDs. */
export const battlePokemonSchema = z.object({
  species: z.string().min(1),
  name: z.string().min(1).optional(),
  level: z.number().int().min(1).max(100),
  gender: z.enum(['M', 'F', 'N']).optional(),
  shiny: z.boolean().optional(),
  ability: z.string().min(1).optional(),
  item: z.string().min(1).optional(),
  nature: z.string().min(1).optional(),
  moves: z.array(z.string().min(1)).min(1).max(4),
  evs: statTableSchema.partial().optional(),
  ivs: statTableSchema.partial().optional(),
  state: persistentStateSchema.optional(),
  /** Traded Pokémon obey only up to this level (RegionRules.obedience). */
  obedienceCap: z.number().int().min(1).max(100).optional(),
});
export type BattlePokemon = z.infer<typeof battlePokemonSchema>;

export const AI_PROFILES = ['random', 'basic', 'smart', 'champion'] as const;
export const aiProfileSchema = z.enum(AI_PROFILES);
export type AiProfile = z.infer<typeof aiProfileSchema>;

export const sideControllerSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('player'),
    userId: z.string().min(1),
    journeyId: z.string().min(1).optional(),
  }),
  z.object({ type: z.literal('ai'), profile: aiProfileSchema }),
]);
export type SideController = z.infer<typeof sideControllerSchema>;

export const battleSideSchema = z.object({
  id: sideIdSchema,
  name: z.string().min(1),
  controller: sideControllerSchema,
  team: z.array(battlePokemonSchema).min(1).max(6),
});
export type BattleSide = z.infer<typeof battleSideSchema>;

export const battleFormatSchema = z.object({
  id: z.string().min(1),
  mechanicsGen: z.number().int().min(1).max(9),
  /** Showdown rule and clause names. */
  rules: z.array(z.string().min(1)),
});
export type BattleFormat = z.infer<typeof battleFormatSchema>;

export const NARRATION_ROLES = [
  'player',
  'coauthor',
  'narrationModerator',
  'ai',
] as const;
export const narrationRoleSchema = z.enum(NARRATION_ROLES);
export type NarrationRole = z.infer<typeof narrationRoleSchema>;

/** Reserved for narrated battles (22); nothing honours it yet. */
export const turnGateSchema = z.object({
  requireNarration: z.array(narrationRoleSchema).optional(),
  requireApproval: narrationRoleSchema.optional(),
});
export type TurnGate = z.infer<typeof turnGateSchema>;

export const BATTLE_KINDS = ['wild', 'trainer', 'pvp', 'ai-arena'] as const;

export const battleSpecSchema = z.object({
  kind: z.enum(BATTLE_KINDS),
  guildId: z.string().min(1),
  format: battleFormatSchema,
  sides: z.array(battleSideSchema).min(2).max(4),
  /** Showdown PRNG seed; the battle replays exactly from it plus its input log. */
  seed: z.string().min(1),
  turnGate: turnGateSchema.optional(),
});
export type BattleSpec = z.infer<typeof battleSpecSchema>;
