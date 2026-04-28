import { data } from '../state';
import type { LeafCard } from '../types/card';
import { Phase } from '../types/gameflow';

export const upgrade = (leaf: LeafCard) =>
  data(({ get, make }) => {
    const didMeetPreconditions = get.phase === Phase.Main;
    if (!didMeetPreconditions) return get.out;

    return make.upgrading(leaf).get.out;
  });
