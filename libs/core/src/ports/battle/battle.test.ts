import type { z } from 'zod';

import {
  battleEventSchema,
  battleSpecSchema,
  externalActionContextSchema,
  externalOutcomeSchema,
  statePatchSchema,
  turnDigestSchema,
  type BattleEvent,
  type BattleSpec,
  type ExternalActionContext,
  type ExternalOutcome,
  type StatePatch,
  type TurnDigest,
} from '.';

function roundTrip<T>(schema: z.ZodType<T>, value: T): T {
  return schema.parse(JSON.parse(JSON.stringify(value)));
}

const pikachu = {
  species: 'pikachu',
  name: 'Sparky',
  level: 25,
  moves: ['thunderbolt', 'quickattack'],
  ivs: { hp: 15, spe: 15 },
  state: { hp: 40, status: 'par', pp: [10, 25] },
  obedienceCap: 30,
} satisfies BattleSpec['sides'][number]['team'][number];

const spec: BattleSpec = {
  kind: 'trainer',
  guildId: '123456789012345678',
  format: { id: 'gen1adventure', mechanicsGen: 1, rules: ['Sleep Clause Mod'] },
  sides: [
    {
      id: 'p1',
      name: 'Red',
      controller: { type: 'player', userId: 'u1', journeyId: 'j1' },
      team: [pikachu],
    },
    {
      id: 'p2',
      name: 'Brock',
      controller: { type: 'ai', profile: 'smart' },
      team: [{ species: 'onix', level: 14, moves: ['tackle', 'bind'] }],
    },
  ],
  seed: 'sodium,abc123',
  turnGate: {
    requireNarration: ['player'],
    requireApproval: 'narrationModerator',
  },
};

const digest: TurnDigest = {
  turn: 3,
  actions: [
    {
      side: 'p1',
      pokemon: 'pikachu',
      action: 'move',
      detail: 'thunderbolt',
      result: { damagePct: 0, effectiveness: 0 },
    },
    {
      side: 'p2',
      pokemon: 'onix',
      action: 'move',
      detail: 'tackle',
      result: { damagePct: 22.5, crit: true },
    },
  ],
};

const patches: StatePatch[] = [
  {
    kind: 'levelUp',
    pokemon: { side: 'p1', slot: 0 },
    level: 26,
    stats: { hp: 62, atk: 40, def: 30, spa: 38, spd: 38, spe: 65 },
  },
  {
    kind: 'moveSlot',
    pokemon: { side: 'p1', slot: 0 },
    index: 2,
    move: 'thunderwave',
  },
  { kind: 'setHp', pokemon: { side: 'p2', slot: 0 }, hp: 300 },
  { kind: 'setStatus', pokemon: { side: 'p1', slot: 0 }, status: null },
];

const events: BattleEvent[] = [
  {
    kind: 'request',
    side: 'p1',
    rqid: 4,
    request: {
      active: [{ moves: [{ id: 'thunderbolt', pp: 9 }] }],
      wait: false,
    },
  },
  {
    kind: 'move',
    turn: 3,
    user: { side: 'p1', slot: 0 },
    move: 'thunderbolt',
    targets: [{ side: 'p2', slot: 0 }],
  },
  {
    kind: 'damage',
    turn: 3,
    pokemon: { side: 'p1', slot: 0 },
    hp: 31,
    maxHp: 55,
  },
  { kind: 'faint', turn: 5, pokemon: { side: 'p2', slot: 0 } },
  { kind: 'turnEnded', turn: 3, digest },
  {
    kind: 'ended',
    winner: 'p1',
    sides: [
      { side: 'p1', pokemon: [{ hp: 31, status: 'par', pp: [8, 25] }] },
      { side: 'p2', pokemon: [{ hp: 0 }] },
    ],
    faints: [{ side: 'p2', slot: 0 }],
    turns: 5,
  },
  { kind: 'recovered' },
];

const onix = {
  pokemon: { side: 'p2', slot: 0 },
  species: 'onix',
  level: 14,
  hp: 20,
  maxHp: 45,
  speed: 30,
} as const;

const contexts: ExternalActionContext[] = [
  {
    battleId: 'b1',
    side: 'p1',
    turn: 2,
    action: 'item',
    item: 'potion',
    target: { ...onix, pokemon: { side: 'p1', slot: 0 } },
  },
  {
    battleId: 'b1',
    side: 'p1',
    turn: 2,
    action: 'catch',
    item: 'pokeball',
    target: { ...onix, status: 'slp' },
  },
  {
    battleId: 'b1',
    side: 'p1',
    turn: 2,
    action: 'run',
    self: { ...onix, pokemon: { side: 'p1', slot: 0 }, species: 'pikachu' },
    target: onix,
    attempts: 1,
  },
];

const outcomes: ExternalOutcome[] = [
  { kind: 'caught', shakes: 3 },
  { kind: 'notCaught', shakes: 1 },
  { kind: 'escaped' },
  { kind: 'escapeFailed' },
  { kind: 'itemUsed', patches: [patches[2]] },
  {
    kind: 'rejected',
    messageKey: 'battle.catch.trainerOwned',
    params: { species: 'onix' },
  },
];

describe('battle port data', () => {
  it('round-trips a BattleSpec through JSON unchanged', () => {
    expect(roundTrip(battleSpecSchema, spec)).toEqual(spec);
  });

  it('round-trips every StatePatch kind through JSON unchanged', () => {
    for (const patch of patches) {
      expect(roundTrip(statePatchSchema, patch)).toEqual(patch);
    }
  });

  it('round-trips every BattleEvent kind through JSON unchanged', () => {
    for (const event of events) {
      expect(roundTrip(battleEventSchema, event)).toEqual(event);
    }
  });

  it('round-trips a TurnDigest through JSON unchanged', () => {
    expect(roundTrip(turnDigestSchema, digest)).toEqual(digest);
  });

  it('round-trips external action contexts and outcomes through JSON unchanged', () => {
    for (const ctx of contexts) {
      expect(roundTrip(externalActionContextSchema, ctx)).toEqual(ctx);
    }
    for (const outcome of outcomes) {
      expect(roundTrip(externalOutcomeSchema, outcome)).toEqual(outcome);
    }
  });

  it('rejects requests that are not plain JSON', () => {
    const withFunction = { ...events[0], request: { onPick: () => 1 } };
    const withDate = { ...events[0], request: { at: new Date(0) } };

    expect(battleEventSchema.safeParse(withFunction).success).toBe(false);
    expect(battleEventSchema.safeParse(withDate).success).toBe(false);
  });

  it('rejects a team larger than six or a set with more than four moves', () => {
    const [p1, p2] = spec.sides;
    const sevenStrong = {
      ...spec,
      sides: [{ ...p1, team: Array(7).fill(pikachu) }, p2],
    };
    const fiveMoves = {
      ...spec,
      sides: [
        { ...p1, team: [{ ...pikachu, moves: ['a', 'b', 'c', 'd', 'e'] }] },
        p2,
      ],
    };

    expect(battleSpecSchema.safeParse(sevenStrong).success).toBe(false);
    expect(battleSpecSchema.safeParse(fiveMoves).success).toBe(false);
  });

  it('rejects a battle with only one side', () => {
    expect(
      battleSpecSchema.safeParse({ ...spec, sides: [spec.sides[0]] }).success,
    ).toBe(false);
  });
});
