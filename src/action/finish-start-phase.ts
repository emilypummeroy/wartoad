import { data } from '../state';
import type { CardClass } from '../types/card';
import { Phase, PHASE_AFTER } from '../types/gameflow';

export const finishStartPhase = (draw: () => CardClass) =>
  data(({ get, ...data }) => {
    const didMeetPreconditions = get.phase === Phase.Start;
    if (!didMeetPreconditions) return get.out;

    const { phase, player } = get;
    return data.set.hand
      .of(player)
      .by(cards => [...cards, draw()])
      .set.phase.to(PHASE_AFTER[phase]).get.out;
  });
