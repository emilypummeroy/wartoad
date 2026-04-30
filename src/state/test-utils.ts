import { DEFAULT_GAME_STATE } from '.';
import type { GameState } from '../state-types';
import { createLeaf, createUnit } from '../state-types/card';
import {
  HOME,
  INITIAL_POND,
  setPondStateAt,
  type PondState,
} from '../state-types/pond';
import {
  type UnitState,
  type UnitKey,
  UnitClass,
  CardClass,
  LeafClass,
  type LeafKey,
  type LeafState,
} from '../types/card';
import { Phase, Player, PLAYER_AFTER } from '../types/gameflow';
import type { Position } from '../types/position';
import { counter } from '../types/test-utils';

export const gameflowOf = (
  player: Player = DEFAULT_GAME_STATE.flow.player,
  phase: Phase = DEFAULT_GAME_STATE.flow.phase,
): Partial<GameState> => ({
  flow: {
    player,
    phase,
  },
});

type PhaseStateParams = Partial<{
  pond: PondState;
}>;
export const phaseStateOf = (
  player: Player,
  phase?: Phase,
  { pond }: PhaseStateParams = {},
): Partial<GameState> =>
  phase === Phase.Upgrading
    ? upgradeOf(player)
    : phase === Phase.Deploying
      ? deploymentOf(player)
      : phase === Phase.Activating
        ? activationOf(player)
        : phase === Phase.GameOver
          ? winningPondOf(player, pond)
          : {};

export const upgradeOf = (
  owner?: Player,
  leaf: LeafState | LeafKey = CardClass.LilyPad.key,
): Partial<GameState> =>
  owner
    ? {
        upgrade: {
          leaf:
            typeof leaf === 'string'
              ? createLeaf({
                  cardClass: LeafClass[leaf],
                  key: counter(),
                  owner,
                })
              : leaf,
        },
      }
    : {};

export const deploymentOf = (
  owner?: Player,
  unit: UnitState | UnitKey = UnitClass.Froglet.key,
): Partial<GameState> =>
  owner
    ? {
        deployment: {
          unit:
            typeof unit === 'string'
              ? createUnit({
                  cardClass: UnitClass[unit],
                  key: counter(),
                  owner,
                })
              : unit,
        },
      }
    : {};

export const activationOf = (
  owner?: Player,
  unit: UnitState | UnitKey = UnitClass.Froglet.key,
  start: Position = owner === Player.North ? { x: 1, y: 1 } : { x: 1, y: 4 },
): Partial<GameState> =>
  owner
    ? {
        activation: {
          start,
          unit:
            typeof unit === 'string'
              ? createUnit({
                  cardClass: UnitClass[unit],
                  key: counter(),
                  owner,
                })
              : { ...unit, owner },
        },
      }
    : {};

export const winningPondOf = (
  winner?: Player,
  pond?: PondState,
): Partial<GameState> =>
  winner
    ? {
        winner,
        pond: setPondStateAt(pond ?? INITIAL_POND, HOME[PLAYER_AFTER[winner]], {
          controller: winner,
        }),
      }
    : pond
      ? { pond }
      : {};

export const createStateWith = (partial: Partial<GameState>): GameState => ({
  ...DEFAULT_GAME_STATE,
  ...partial,
});
