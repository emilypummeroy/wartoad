import { data } from '../state';
import type { UnitCard } from '../types/card';
import { Phase } from '../types/gameflow';

export const deploy = (unit: UnitCard) =>
  data(({ get, make }) => {
    const didMeetPreconditions = get.phase === Phase.Main;
    if (!didMeetPreconditions) return get.out;

    return make.deploying(unit).get.out;
  });
