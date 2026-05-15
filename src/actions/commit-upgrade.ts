import { data } from '@/state';
import { Phase } from '@/types/gameflow';
import { type Position } from '@/types/position';

export const commitUpgrade = (target: Position) =>
  data(({ get, set }) => {
    const { upgrade } = get;
    const didMeetPreconditions =
      !!upgrade &&
      get.phase === Phase.Upgrading &&
      get.leaf.at(target).controller === get.player &&
      !get.leaf.at(target).leaf;
    if (!didMeetPreconditions) return get.out;

    return set.leaf
      .at(target)
      .to({ leaf: upgrade.leaf })
      .set.hand.of(get.player)
      .update(hand => hand.filter(card => card !== upgrade.leaf))
      .make.idle().get.out;
  });
