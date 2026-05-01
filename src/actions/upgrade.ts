import { data } from '../state';
import type { LeafState } from '../types/card';
import { Phase } from '../types/gameflow';

export const upgrade = (leaf: LeafState) =>
  data(({ get, make }) => {
    const didMeetPreconditions = get.phase === Phase.Main;
    if (!didMeetPreconditions) return get.out;

    // TODO 16: Check cost
    return make.upgrading(leaf).get.out;
  });
