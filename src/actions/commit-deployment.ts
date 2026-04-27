import { data } from '../state';
import { HOME } from '../state-types/pond';
import { type Position } from '../types/position';

export const commitDeployment = (target: Position) =>
  data(({ get, set }) => {
    const { deployment } = get;
    const didMeetPreconditions =
      !!deployment && target.y === HOME[get.player].y;
    if (!didMeetPreconditions) return get.out;

    return set.leaf
      .at(target)
      .update(({ units }) => ({
        units: [...units, deployment.unit],
      }))
      .set.hand.of(get.player)
      .update(hand => hand.filter(card => card !== deployment.unit))
      .make.idle().get.out;
  });
