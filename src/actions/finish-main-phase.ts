import { data } from '../state';
import { Phase } from '../types/gameflow';

export const finishMainPhase = () =>
  data(({ get, set }) => {
    const didMeetPreconditions = get.phase === Phase.Main;
    if (!didMeetPreconditions) return get.out;

    // TODO 14: Create a set.units function
    return set.leaf
      .where(() => true)
      .update(({ units }) => ({
        units: units.map(u => ({
          ...u,
          values: { ...u.values, isExhausted: false },
        })),
      }))
      .make.endPhase().get.out;
  });
