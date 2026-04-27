import { chain, never, pick } from '../state/get-out';
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
        return x => x;
    }
    /* v8 ignore next line -- @preserve */
    return never(get.phase);
  });
