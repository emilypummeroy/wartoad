import { data } from '../state';
import type { Card } from '../types/card';
import { Phase, type Player } from '../types/gameflow';

export const finishStartPhase = (draw: (owner: Player) => Card) =>
  data(({ get, ...data }) => {
    const didMeetPreconditions = get.phase === Phase.Start;
    if (!didMeetPreconditions) return get.out;

    return data.set.hand
      .of(get.player)
      .update(cards => [...cards, draw(get.player)])
      .make.mainPhase().get.out;
  });
