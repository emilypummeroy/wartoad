import { gameData, type GameData, type GameState } from '../state';
import { setPondStateAtEach } from '../state-types/pond';
import type { Read } from '../types';
import { Phase, Subphase } from '../types/gameflow';
import {
  arePositionsEqual,
  distanceBetween,
  type Position,
} from '../types/position';

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

export const commitActivateOld =
  (target: Position) =>
  (old: GameState): GameState => {
    if (
      old.flow.phase !== Phase.Main ||
      old.flow.subphase !== Subphase.Activating ||
      !old.activation ||
      distanceBetween(old.activation.start, target) > 1
    ) {
      return old;
    }

    const {
      pond,
      flow,
      activation: { start, unit },
      ...rest
    } = old;

    return {
      flow: { ...flow, subphase: Subphase.Idle },
      pond: arePositionsEqual(target, start)
        ? pond
        : setPondStateAtEach(
            pond,
            [
              target,
              ({ units }) => ({
                units: [...units, unit],
              }),
            ],
            [
              start,
              ({ units }) => ({
                units: units.filter(({ key }) => key !== unit.key),
              }),
            ],
          ),
      ...rest,
    };
  };
