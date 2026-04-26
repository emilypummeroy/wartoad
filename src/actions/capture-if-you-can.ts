import { data } from '../state';
import { Phase } from '../types/gameflow';

export const captureIfYouCan = () =>
  data(({ get, set }) => {
    const didMeetPreconditions =
      get.phase === Phase.End &&
      get.leaf.exists(
        ({ controller, units }) =>
          controller !== get.player &&
          units.length > 0 &&
          units.every(u => u.owner === get.player),
      );
    if (!didMeetPreconditions) return get.out;

    return set.leaf
      .where(
        ({ units }) =>
          units.length > 0 && units.every(u => u.owner === get.player),
      )
      .update(() => ({ controller: get.player })).get.out;
  });
