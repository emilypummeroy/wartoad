import { data } from '../state';
import { Phase, PLAYER_AFTER } from '../types/gameflow';

export const finishEndPhase = () =>
  data(({ get, set }) => {
    const didMeetPreconditions = get.phase === Phase.End;
    if (!didMeetPreconditions) return get.out;
    const { player } = get;
    return set.phase
      .to(Phase.Start) //
      .set.player.to(PLAYER_AFTER[player]).get.out;
  });
