import type { GameState } from '../state-types';
import {
  DETERMINISTIC_NORTH_HAND,
  DETERMINISTIC_SOUTH_HAND,
} from '../state-types/card';
import { leafTutor, unitTutor } from '../state-types/deck.test-utils';
import { HOME, setPondStateAt, type PondState } from '../state-types/pond';
import { INITIAL_POND } from '../state-types/pond.test-utils';
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

export const DEFAULT_GAME_STATE: GameState = {
  flow: {
    phase: Phase.Main,
    player: Player.South,
  },
  pond: INITIAL_POND,
  northHand: DETERMINISTIC_NORTH_HAND,
  southHand: DETERMINISTIC_SOUTH_HAND,
  northFunds: 5,
  southFunds: 5,
  northDeck: [],
  southDeck: [],
  upgrade: undefined,
  deployment: undefined,
  activation: undefined,
  winner: undefined,
} as const;

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
            typeof leaf === 'string' ? leafTutor(owner)(LeafClass[leaf]) : leaf,
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
            typeof unit === 'string' ? unitTutor(owner)(UnitClass[unit]) : unit,
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
              ? unitTutor(owner)(UnitClass[unit])
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
          leaf: undefined,
        }),
      }
    : pond
      ? { pond }
      : {};

export const createStateWith = (partial: Partial<GameState>): GameState => ({
  ...DEFAULT_GAME_STATE,
  ...partial,
});
