import type { BattleId, BattleSpec, SideId } from './battle-spec';
import type { BattleEvent } from './events';
import type { ExternalActionContext, ExternalOutcome } from './external';
import type { StatePatch } from './patch';

export type BattleEventSink = (event: BattleEvent) => void;
export type Unsubscribe = () => void;

/** Runs live battles. Implemented by libs/battle and composed in apps. */
export interface BattlePort {
  start(spec: BattleSpec): Promise<BattleId>;
  /** A stale or already-answered `rqid` is a no-op. */
  choose(
    id: BattleId,
    side: SideId,
    choice: string,
    rqid?: number,
  ): Promise<void>;
  /** Mid-battle level-ups, move learning, boss HP. */
  inject(id: BattleId, patch: StatePatch): Promise<void>;
  subscribe(id: BattleId, sink: BattleEventSink): Unsubscribe;
}

/** The engine's rules for bag items, catches, and running; the battle calls it. */
export interface ExternalActionResolver {
  resolve(ctx: ExternalActionContext): Promise<ExternalOutcome>;
}
