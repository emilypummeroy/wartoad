import { data } from '../state';
import type { CardClass } from '../types/card';
import { Phase, PHASE_AFTER, PLAYER_AFTER, Subphase } from '../types/gameflow';

export const finishEndPhase = (draw: () => CardClass) =>
  data(({ get, ...data }) => {
    const didMeetPreconditions = get.subphase === Subphase.Idle;
    if (!didMeetPreconditions) return get.out;

    const { phase, player } = get;
    return (
      phase === Phase.End
        ? data.set.player.to(PLAYER_AFTER[player])
        : phase === Phase.Start
          ? data.set.hand.of(player).by(cards => [...cards, draw()])
          : data
    ).set.phase.to(PHASE_AFTER[phase]).get.out;
  });
