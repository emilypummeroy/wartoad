import { DETERMINISTIC_STARTING_HAND } from '../state-types/card';
import { INITIAL_POND, type PondState } from '../state-types/pond';
import type { CardClass, UnitCard } from '../types/card';
import { Phase, Player, Subphase, type Gameflow } from '../types/gameflow';
import type { Position } from '../types/position';

export type GameState = {
  readonly flow: Gameflow;
  readonly pond: PondState;
  // TODO 11: Card[]
  readonly northHand: readonly CardClass[];
  // TODO 11: Card[]
  readonly southHand: readonly CardClass[];
  // TODO 11: Card
  readonly pickedCard?: CardClass;
  readonly activation?: {
    readonly start: Position;
    readonly unit: UnitCard;
  };
};

export const DEFAULT_GAME_STATE = {
  flow: {
    phase: Phase.Main,
    player: Player.South,
    subphase: Subphase.Idle,
  },
  pond: INITIAL_POND,
  northHand: DETERMINISTIC_STARTING_HAND,
  southHand: DETERMINISTIC_STARTING_HAND,
} as const;

export const INITIAL_HAND_CARD_COUNT = 7;

// TODO 11: test
export const createState = (getStartingHand: () => CardClass[]) => ({
  ...DEFAULT_GAME_STATE,
  northHand: getStartingHand(),
  southHand: getStartingHand(),
});
