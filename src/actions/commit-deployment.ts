import { data } from '../state';
import { createUnit } from '../state-types/card';
import { HOME } from '../state-types/pond';
import { CardType } from '../types/card';
import { type Position } from '../types/position';

export const commitDeployment = (
  target: Position,
  getNextCardKey: () => number,
) =>
  data(({ get, set }) => {
    const { pickedCard } = get;
    const didMeetPreconditions =
      pickedCard?.type === CardType.Unit && target.y === HOME[get.player].y;
    if (!didMeetPreconditions) return get.out;

    return set.leaf
      .at(target)
      .update(({ units }) => ({
        units: [
          ...units,
          createUnit({
            cardClass: pickedCard,
            key: getNextCardKey(),
            owner: get.player,
          }),
        ],
      }))
      .set.hand.of(get.player)
      .update(hand => hand.filter((_, i) => i !== hand.indexOf(pickedCard)))
      .make.idle().get.out;
  });
