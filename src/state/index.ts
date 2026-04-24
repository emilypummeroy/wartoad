import { DETERMINISTIC_STARTING_HAND } from '../state-types/card';
import { INITIAL_POND } from '../state-types/pond';
import type { CardClass } from '../types/card';
import { Phase, Player, Subphase } from '../types/gameflow';

export { data } from './get-out';

export const DEFAULT_GAME_STATE = {
  flow: {
    phase: Phase.Main,
    player: Player.South,
    subphase: Subphase.Idle,
  },
  pond: INITIAL_POND,
  northHand: DETERMINISTIC_STARTING_HAND,
  southHand: DETERMINISTIC_STARTING_HAND,
  pickedCard: undefined,
  activation: undefined,
} as const;

export const INITIAL_HAND_CARD_COUNT = 7;

export const createState = (getStartingHand: () => CardClass[]) => ({
  ...DEFAULT_GAME_STATE,
  northHand: getStartingHand(),
  southHand: getStartingHand(),
});
