import { data } from '../state';
import type { LeafClass } from '../types/card';
import { Phase, Subphase } from '../types/gameflow';

export const upgrade = (cardClass: LeafClass) =>
  data(({ get, make }) => {
    const didMeetPreconditions =
      get.phase === Phase.Main && get.subphase === Subphase.Idle;
    if (!didMeetPreconditions) return get.out;

    return make.upgrading(cardClass).get.out;
  });
