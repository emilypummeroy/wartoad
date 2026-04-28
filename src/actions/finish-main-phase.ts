import { data } from '../state';
import { Phase } from '../types/gameflow';

export const finishMainPhase = () =>
  data(({ get, make }) => {
    const didMeetPreconditions = get.phase === Phase.Main;
    if (!didMeetPreconditions) return get.out;

    return make.endPhase().get.out;
  });
