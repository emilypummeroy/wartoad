import { data } from '../state';
import { CardClass } from '../types/card';
import { Phase } from '../types/gameflow';
import { type Position } from '../types/position';

export const commitUpgrade = (target: Position) =>
  data(({ get, set }) => {
    const { upgrade } = get;
    const didMeetPreconditions =
      !!upgrade &&
      get.phase === Phase.Upgrading &&
      get.leaf.at(target).controller === get.player &&
      !get.leaf.at(target).leaf;
    if (!didMeetPreconditions) return get.out;

    return (
      set.leaf
        .at(target)
        // TODO 16: Get card from action parameters or state
        .to({ leaf: CardClass.LilyPad })
        .set.hand.of(get.player)
        .update(hand => hand.filter(card => card !== upgrade.leaf))
        .make.idle().get.out
    );
  });
