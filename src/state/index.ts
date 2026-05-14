import type { GameState } from '../state-types';
import { DEFAULT_POND, makeInitialPond } from '../state-types/pond';
import type { CardState } from '../types/card';
import type { DeckActions } from '../types/deck';
import { Phase, Player } from '../types/gameflow';

export { data } from './get-out';

export const DEFAULT_GAME_STATE: GameState = {
  flow: {
    phase: Phase.Main,
    player: Player.South,
  },
  pond: DEFAULT_POND,
  northHand: [],
  southHand: [],
  northFunds: 5,
  southFunds: 5,
  northDeck: [],
  southDeck: [],
  upgrade: undefined,
  deployment: undefined,
  activation: undefined,
  winner: undefined,
} as const;

export const INITIAL_HAND_CARD_COUNT = 7;

export const createState = (
  getStartingHand: (owner: Player) => CardState[],
  deckActions: Record<Player, DeckActions>,
) => ({
  ...DEFAULT_GAME_STATE,
  pond: makeInitialPond(deckActions),
  northHand: getStartingHand(Player.North),
  southHand: getStartingHand(Player.South),
});
