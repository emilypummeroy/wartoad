import { data } from '../state';
import type { UnitCardState } from '../types/card';
import { Phase } from '../types/gameflow';
import type { Position } from '../types/position';

export const activate = (unit: UnitCardState, start: Position) =>
  data(({ get, make }) => {
    const didMeetPreconditions =
      get.phase === Phase.Main &&
      get.player === unit.owner &&
      !unit.isExhausted;
    if (!didMeetPreconditions) return get.out;

    return make.activating({ start, unit }).get.out;
  });
