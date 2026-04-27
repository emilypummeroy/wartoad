import { data } from '../state';
import type { Card } from '../types/card';
import { Phase, PHASE_AFTER, type Player } from '../types/gameflow';

export const finishStartPhase = (draw: (owner: Player) => Card) =>
  data(({ get, ...data }) => {
    const didMeetPreconditions = get.phase === Phase.Start;
    if (!didMeetPreconditions) return get.out;

    const { phase, player } = get;
    return data.set.hand
      .of(player)
      .update(cards => [...cards, draw(get.player)])
      .set.phase.to(PHASE_AFTER[phase]).get.out;
  });
