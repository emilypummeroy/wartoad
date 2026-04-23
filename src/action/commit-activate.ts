import type { GameState } from '../state';
import { setPondStateAtEach } from '../state-types/pond';
import { Phase, Subphase } from '../types/gameflow';
import {
  arePositionsEqual,
  distanceBetween,
  type Position,
} from '../types/position';

export const commitActivate =
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
