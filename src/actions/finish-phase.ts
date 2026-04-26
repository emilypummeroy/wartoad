import { chain, never, pick } from '../state/get-out';
import type { CardClass } from '../types/card';
import { Phase } from '../types/gameflow';
import { captureIfYouCan } from './capture-if-you-can';
import { finishEndPhase } from './finish-end-phase';
import { finishMainPhase } from './finish-main-phase';
import { finishStartPhase } from './finish-start-phase';

export const finishPhase = (draw: () => CardClass) =>
  pick(get => {
    switch (get.phase) {
      case Phase.Start:
        return finishStartPhase(draw);
      case Phase.Main:
        return chain(finishMainPhase(), captureIfYouCan());
      case Phase.End:
        return finishEndPhase();
    }
    /* v8 ignore next line -- @preserve */
    return never(get.phase);
  });
