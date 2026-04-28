import { data } from '../state';
import type { UnitCard } from '../types/card';
import { Phase } from '../types/gameflow';
import type { Position } from '../types/position';

export const activate = (unit: UnitCard, start: Position) =>
  data(({ get, make }) => {
    const didMeetPreconditions =
      get.phase === Phase.Main &&
      get.player === unit.owner &&
      !unit.values.isExhausted;
    if (!didMeetPreconditions) return get.out;

    return make.activating({ start, unit }).get.out;
  });
