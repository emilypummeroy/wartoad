import type { GameState } from '../state-types';
import {
  DETERMINISTIC_NORTH_HAND,
  DETERMINISTIC_SOUTH_HAND,
} from '../state-types/card';
import { INITIAL_POND } from '../state-types/pond';
import type { CardState } from '../types/card';
import { Phase, Player } from '../types/gameflow';

export { data } from './get-out';

export const DEFAULT_GAME_STATE: GameState = {
  flow: {
    phase: Phase.Main,
    player: Player.South,
  },
  pond: INITIAL_POND,
  northHand: DETERMINISTIC_NORTH_HAND,
  southHand: DETERMINISTIC_SOUTH_HAND,
  upgrade: undefined,
  deployment: undefined,
  activation: undefined,
} as const;

export const INITIAL_HAND_CARD_COUNT = 7;

export const createState = (
  getStartingHand: (owner: Player) => CardState[],
) => ({
  ...DEFAULT_GAME_STATE,
  northHand: getStartingHand(Player.North),
  southHand: getStartingHand(Player.South),
});
