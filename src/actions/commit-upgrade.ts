import { data } from '../state';
import { Subphase } from '../types/gameflow';
import { type Position } from '../types/position';

export const commitUpgrade = (target: Position) =>
  data(({ get, set }) => {
    const { upgrade } = get;
    const didMeetPreconditions =
      !!upgrade &&
      get.subphase === Subphase.Upgrading &&
      get.leaf.at(target).controller === get.player &&
      !get.leaf.at(target).isUpgraded;
    if (!didMeetPreconditions) return get.out;

    return set.leaf
      .at(target)
      .to({ isUpgraded: true })
      .set.hand.of(get.player)
      .update(hand =>
        hand.filter((_, i) => i !== hand.indexOf(upgrade.leaf.cardClass)),
      )
      .make.idle().get.out;
  });
