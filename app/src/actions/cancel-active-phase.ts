import { data } from '@/state';
import { Phase } from '@/types/gameflow';

export const cancelActivePhase = () =>
  data(({ get, make }) => {
    const didMeetPreconditions =
      get.phase === Phase.Upgrading ||
      get.phase === Phase.Deploying ||
      get.phase === Phase.Activating;
    if (!didMeetPreconditions) return get.out;
    return make.idle().get.out;
  });
