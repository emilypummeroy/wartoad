import { data } from '../state';
import { Phase, Subphase } from '../types/gameflow';

export const finishMainPhase = () =>
  data(({ get, set }) => {
    const didMeetPreconditions =
      get.phase === Phase.Main && get.subphase === Subphase.Idle;
    if (!didMeetPreconditions) return get.out;

    return set.leaf
      .where(
        ({ units }) =>
          units.length > 0 && units.every(({ owner }) => owner === get.player),
      )
      .update(() => ({ controller: get.player }))

      .set.phase.to(Phase.End).get.out;
  });
