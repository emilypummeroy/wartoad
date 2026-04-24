import { DEFAULT_GAME_STATE } from '.';
import type { GameState } from '../state-types';
import { createUnit } from '../state-types/card';
import type { UnitCard, UnitKey, CardClass } from '../types/card';
import { UnitClass } from '../types/card';
import type { Subphase, Phase } from '../types/gameflow';
import { Player } from '../types/gameflow';
import type { Position } from '../types/position';

export const gameflowOf = (
  player: Player = DEFAULT_GAME_STATE.flow.player,
  subphase: Subphase = DEFAULT_GAME_STATE.flow.subphase,
  phase: Phase = DEFAULT_GAME_STATE.flow.phase,
): Partial<GameState> => ({
  flow: {
    player,
    phase,
    subphase,
  },
});

export const activationOf = (
  start?: Position,
  unit: UnitCard | UnitKey = UnitClass.Froglet.key,
  owner: Player = typeof unit === 'object' ? unit.owner : Player.North,
): Partial<GameState> =>
  start
    ? {
        activation: {
          start,
          unit:
            typeof unit === 'string'
              ? createUnit({ cardClass: UnitClass[unit], key: -1, owner })
              : { ...unit, owner },
        },
      }
    : {};

// export const handsOf = (
//   northHand: readonly CardClass[] = DETERMINISTIC_STARTING_HAND,
//   southHand: readonly CardClass[] = northHand,
// ): Partial<GameState> => ({
//   northHand,
//   southHand,
// });

export const pickedCardOf = (pickedCard?: CardClass): Partial<GameState> =>
  pickedCard ? { pickedCard } : {};

export const createStateWith = (partial: Partial<GameState>): GameState => ({
  ...DEFAULT_GAME_STATE,
  ...partial,
});
