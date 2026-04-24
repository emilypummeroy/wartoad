import { data, type GameData } from '../state';
import type { Read } from '../types';
import { distanceBetween, type Position } from '../types/position';

export const commitActivate = (target: Position) =>
  data(({ get, set, make }: Read<GameData>) => {
    const didMeetPreconditions =
      !!get.activation && distanceBetween(get.activation.start, target) <= 1;
    if (!didMeetPreconditions) return get.out;

    const { start, unit } = get.activation;
    return start === target
      ? make.idle().get.out
      : set.leaf
          .at(start)
          .by(({ units }) => ({
            units: units.filter(({ key }) => key !== unit.key),
          }))
          .set.leaf.at(target)
          .by(({ units }) => ({ units: [...units, unit] }))
          .make.idle().get.out;
  });
