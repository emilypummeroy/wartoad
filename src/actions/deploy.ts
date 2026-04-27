import { data } from '../state';
import type { UnitCard } from '../types/card';
import { Phase, Subphase } from '../types/gameflow';

export const deploy = (unit: UnitCard) =>
  data(({ get, make }) => {
    const didMeetPreconditions =
      get.phase === Phase.Main && get.subphase === Subphase.Idle;
    if (!didMeetPreconditions) return get.out;

    return make.deploying(unit).get.out;
  });
