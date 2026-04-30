import { data } from '../state';
import { Phase, type Player } from '../types/gameflow';

export const captureIfYouCan = (you: Player) =>
  data(({ get, set }) => {
    const didMeetPreconditions =
      get.phase === Phase.End &&
      get.leaf.exists(
        ({ controller, units }) =>
          controller !== you &&
          units.length > 0 &&
          units.every(u => u.owner === you),
      );
    if (!didMeetPreconditions) return get.out;

    return set.leaf
      .where(
        ({ units, controller }) =>
          controller !== you &&
          units.length > 0 &&
          units.every(u => u.owner === you),
      )
      .update(() => ({ controller: you, isUpgraded: false })).get.out;
  });
