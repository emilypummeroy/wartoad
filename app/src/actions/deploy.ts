import { data } from '@/state';
import type { UnitState } from '@/types/card';
import { Phase } from '@/types/gameflow';

export const deploy = (unit: UnitState) =>
  data(({ get, make }) => {
    const didMeetPreconditions = get.phase === Phase.Main;
    if (!didMeetPreconditions) return get.out;

    // TODO 21: Check cost
    return make.deploying(unit).get.out;
  });
