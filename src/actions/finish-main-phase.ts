import { data } from '../state';
import { Phase, Subphase } from '../types/gameflow';

export const finishMainPhase = () =>
  data(({ get, make }) => {
    const didMeetPreconditions =
      get.phase === Phase.Main && get.subphase === Subphase.Idle;
    if (!didMeetPreconditions) return get.out;

    return make.endPhase().get.out;
  });
