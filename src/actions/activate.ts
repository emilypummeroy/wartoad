import { data } from '../state';
import type { UnitCard } from '../types/card';
import { Phase } from '../types/gameflow';
import type { Position } from '../types/position';

export const activate = (unit: UnitCard, start: Position) =>
  data(({ get, make }) => {
    // TODO 14: It should not allow an exhausted unit to be activated
    const didMeetPreconditions =
      get.phase === Phase.Main && get.player === unit.owner;
    if (!didMeetPreconditions) return get.out;

    return make.activating({ start, unit }).get.out;
  });
