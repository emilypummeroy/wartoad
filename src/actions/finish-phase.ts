import { chain, never, pick } from '../state/get-out';
import { identity } from '../types';
import type { Card } from '../types/card';
import { Phase, type Player } from '../types/gameflow';
import { captureIfYouCan } from './capture-if-you-can';
import { finishEndPhase } from './finish-end-phase';
import { finishMainPhase } from './finish-main-phase';
import { finishStartPhase } from './finish-start-phase';
import { winIfYouCan } from './win-if-you-can';

export const finishPhase = (draw: (owner: Player) => Card) =>
  pick(get => {
    switch (get.phase) {
      case Phase.Start:
        return finishStartPhase(draw);
      case Phase.Main:
        return chain(finishMainPhase(), winIfYouCan(), captureIfYouCan());
      case Phase.End:
        return finishEndPhase();
      case Phase.GameOver:
      // TODO 14: These should cancel current action
      case Phase.Upgrading:
      case Phase.Deploying:
      case Phase.Activating:
        return identity;
    }
    /* v8 ignore next line -- @preserve */
    return never(get.phase);
  });
