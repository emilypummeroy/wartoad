import { data } from '../state';
import { CardType } from '../types/card';
import { Subphase } from '../types/gameflow';
import { type Position } from '../types/position';

export const commitUpgrade = (target: Position) =>
  data(({ get, set }) => {
    const { pickedCard } = get;
    const didMeetPreconditions =
      pickedCard?.type === CardType.Leaf &&
      get.subphase === Subphase.Upgrading &&
      get.leaf.at(target).controller === get.player &&
      !get.leaf.at(target).isUpgraded;
    if (!didMeetPreconditions) return get.out;

    return set.leaf
      .at(target)
      .to({ isUpgraded: true })
      .set.hand.of(get.player)
      .update(hand => hand.filter((_, i) => i !== hand.indexOf(pickedCard)))
      .make.idle().get.out;
  });
// data(({ get, set }) => {
//   const { pickedCard } = get;
//   const didMeetPreconditions =
//     pickedCard?.type === CardType.Unit && target.y === HOME[get.player].y;
//   if (!didMeetPreconditions) return get.out;

//   return set.leaf
//     .at(target)
//     .update(({ units }) => ({
//       units: [
//         ...units,
//         createUnit({
//           cardClass: pickedCard,
//           key: getNextCardKey(),
//           owner: get.player,
//         }),
//       ],
//     }))
//     .set.hand.of(get.player)
//     .update(hand => hand.filter((_, i) => i !== hand.indexOf(pickedCard)))
//     .make.idle().get.out;
// });
