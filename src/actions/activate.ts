import { data } from '../state';
import type { UnitCard } from '../types/card';
import { Phase, Subphase } from '../types/gameflow';
import type { Position } from '../types/position';

export const activate = (unit: UnitCard, start: Position) =>
  data(({ get, make }) => {
    const didMeetPreconditions =
      get.subphase === Subphase.Idle &&
      get.phase === Phase.Main &&
      get.player === unit.owner;
    if (!didMeetPreconditions) return get.out;

    return make.activating({ start, unit }).get.out;
  });
