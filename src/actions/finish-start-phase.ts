import { data } from '../state';
import type { CardState } from '../types/card';
import { Phase, type Player } from '../types/gameflow';

export const finishStartPhase = (draw: (owner: Player) => CardState) =>
  data(({ get, ...data }) => {
    const didMeetPreconditions = get.phase === Phase.Start;
    if (!didMeetPreconditions) return get.out;

    return (
      data.set.hand
        .of(get.player)
        .update(cards => [...cards, draw(get.player)])
        // TODO 16: Add funds per leaf
        .set.funds.of(get.player)
        .to(5)
        .make.mainPhase().get.out
    );
  });
