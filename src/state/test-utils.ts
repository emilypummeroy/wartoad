import { DEFAULT_GAME_STATE } from '.';
import type { GameState } from '../state-types';
import { createUnit } from '../state-types/card';
import {
  HOME,
  INITIAL_POND,
  setPondStateAt,
  type PondState,
} from '../state-types/pond';
import {
  type CardKey,
  type UnitCard,
  type UnitKey,
  UnitClass,
  CardClass,
} from '../types/card';
import {
  type Subphase,
  type Phase,
  Player,
  PLAYER_AFTER,
} from '../types/gameflow';
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

export const winningPondOf = (
  winner?: Player,
  pond: PondState = INITIAL_POND,
): Partial<GameState> =>
  winner
    ? {
        winner,
        pond: setPondStateAt(pond, HOME[PLAYER_AFTER[winner]], {
          controller: winner,
        }),
      }
    : {};

// export const handsOf = (
//   northHand: readonly CardClass[] = DETERMINISTIC_STARTING_HAND,
//   southHand: readonly CardClass[] = northHand,
// ): Partial<GameState> => ({
//   northHand,
//   southHand,
// });

export const pickedCardOf = (
  pickedCard?: CardClass | CardKey,
): Partial<GameState> =>
  pickedCard !== undefined
    ? {
        pickedCard:
          typeof pickedCard === 'string' ? CardClass[pickedCard] : pickedCard,
      }
    : {};

export const createStateWith = (partial: Partial<GameState>): GameState => ({
  ...DEFAULT_GAME_STATE,
  ...partial,
});
