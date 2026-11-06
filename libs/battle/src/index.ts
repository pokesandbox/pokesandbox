import type { Logger } from '@core/logging';
import type { ExternalActionResolver } from '@core/ports';

/** What the apps pass to BattleService (M1), which implements `BattlePort`. */
export interface BattleServiceDeps {
  logger: Logger;
  resolver: ExternalActionResolver;
}
