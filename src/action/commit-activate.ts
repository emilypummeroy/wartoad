import { gameData, type GameData, type GameState } from '../state';
import type { Read } from '../types';
import { Phase } from '../types/gameflow';
import { distanceBetween, type Position } from '../types/position';

const commitActivateInner =
  (target: Position) =>
  ({ get, set, make }: Read<GameData>) => {
    if (
      get.phase !== Phase.Main ||
      !get.activation ||
      distanceBetween(get.activation.start, target) > 1
    ) {
      return get.out;
    }

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
  };

export const commitActivate =
  (target: Position) =>
  (old: GameState): GameState =>
    commitActivateInner(target)(gameData(old));
