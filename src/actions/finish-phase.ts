import { chain, never, pick } from '../state/get-out';
import { identity } from '../types';
import { Phase, PLAYER_AFTER } from '../types/gameflow';
import { captureIfYouCan } from './capture-if-you-can';
import { finishEndPhase } from './finish-end-phase';
import { finishMainPhase } from './finish-main-phase';
import { finishStartPhase } from './finish-start-phase';
import { winIfYouCan } from './win-if-you-can';

export const finishPhase = () =>
  pick(get => {
    switch (get.phase) {
      case Phase.Start:
        return finishStartPhase();
      case Phase.Main:
        return chain(
          finishMainPhase(),
          winIfYouCan(PLAYER_AFTER[get.player]),
          captureIfYouCan(PLAYER_AFTER[get.player]),
          winIfYouCan(get.player),
          captureIfYouCan(get.player),
        );
      case Phase.End:
        return finishEndPhase();
      case Phase.GameOver:
      case Phase.Upgrading:
      case Phase.Deploying:
      case Phase.Activating:
        return identity;
    }
    /* v8 ignore next line -- @preserve */
    return never(get.phase);
  });
