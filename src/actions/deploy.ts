import { data } from '../state';
import type { UnitClass } from '../types/card';
import { Phase, Subphase } from '../types/gameflow';

export const deploy = (cardClass: UnitClass) =>
  data(({ get, make }) => {
    const didMeetPreconditions =
      get.phase === Phase.Main && get.subphase === Subphase.Idle;
    if (!didMeetPreconditions) return get.out;

    return make.deploying(cardClass).get.out;
  });
