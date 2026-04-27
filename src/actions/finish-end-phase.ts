import { data } from '../state';
import { Phase } from '../types/gameflow';

export const finishEndPhase = () =>
  data(({ get, make }) => {
    const didMeetPreconditions = get.phase === Phase.End;
    if (!didMeetPreconditions) return get.out;
    return make.nextTurn().get.out;
  });
