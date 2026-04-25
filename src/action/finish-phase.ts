import type { GameState } from '../state-types';
import type { CardClass } from '../types/card';
import { Phase } from '../types/gameflow';
import { finishEndPhase } from './finish-end-phase';
import { finishMainPhase } from './finish-main-phase';
import { finishStartPhase } from './finish-start-phase';

export const finishPhase = (draw: () => CardClass) => (state: GameState) =>
  state.flow.phase === Phase.Start
    ? finishStartPhase(draw)(state)
    : state.flow.phase === Phase.Main
      ? finishMainPhase()(state)
      : finishEndPhase()(state);
