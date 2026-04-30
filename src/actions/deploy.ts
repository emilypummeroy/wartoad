import { data } from '../state';
import type { UnitCardState } from '../types/card';
import { Phase } from '../types/gameflow';

export const deploy = (unit: UnitCardState) =>
  data(({ get, make }) => {
    const didMeetPreconditions = get.phase === Phase.Main;
    if (!didMeetPreconditions) return get.out;

    return make.deploying(unit).get.out;
  });
