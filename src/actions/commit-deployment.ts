import { data } from '../state';
import { createUnit } from '../state-types/card';
import { HOME } from '../state-types/pond';
import { type Position } from '../types/position';

export const commitDeployment = (
  target: Position,
  getNextCardKey: () => number,
) =>
  data(({ get, set }) => {
    const { deployment } = get;
    const didMeetPreconditions =
      !!deployment && target.y === HOME[get.player].y;
    if (!didMeetPreconditions) return get.out;

    return set.leaf
      .at(target)
      .update(({ units }) => ({
        units: [
          ...units,
          createUnit({
            cardClass: deployment.unit.cardClass,
            key: getNextCardKey(),
            owner: get.player,
          }),
        ],
      }))
      .set.hand.of(get.player)
      .update(hand =>
        hand.filter((_, i) => i !== hand.indexOf(deployment.unit.cardClass)),
      )
      .make.idle().get.out;
  });
