import { data } from '../state';
import { Phase } from '../types/gameflow';

export const finishMainPhase = () =>
  data(({ get, set }) => {
    const didMeetPreconditions = get.phase === Phase.Main;
    if (!didMeetPreconditions) return get.out;

    return set.units.everywhere
      .update(u => ({
        ...u,
        isExhausted: false,
      }))
      .make.endPhase().get.out;
  });
