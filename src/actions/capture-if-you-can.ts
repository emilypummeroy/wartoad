import { data } from '../state';
import { Phase, type Player } from '../types/gameflow';

export const captureIfYouCan = (player: Player) =>
  data(({ get, set }) => {
    const didMeetPreconditions =
      get.phase === Phase.End &&
      get.leaf.exists(
        ({ controller, units }) =>
          controller !== player &&
          units.length > 0 &&
          units.every(u => u.owner === player),
      );
    if (!didMeetPreconditions) return get.out;

    return set.leaf
      .where(
        ({ units }) => units.length > 0 && units.every(u => u.owner === player),
      )
      .update(() => ({ controller: player })).get.out;
  });
