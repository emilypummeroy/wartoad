import type { GameState } from '@/state-types';
import { DEFAULT_POND, makeInitialPond } from '@/state-types/pond';
import type { CardState } from '@/types/card';
import { createDeckActions, type DeckActions } from '@/types/deck';
import { Phase, Player } from '@/types/gameflow';

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

export const createState = ({
  northDeck,
  southDeck,
}: {
  readonly northDeck: readonly CardState[];
  readonly southDeck: readonly CardState[];
}) => {
  const getStartingHand = ({ draw }: DeckActions): CardState[] =>
    Array.from({ length: INITIAL_HAND_CARD_COUNT }, draw).filter(x => !!x);
  const northDeckActions = createDeckActions(northDeck);
  const southDeckActions = createDeckActions(southDeck);
  const deckActions = {
    [Player.North]: northDeckActions,
    [Player.South]: southDeckActions,
  };
  return {
    ...DEFAULT_GAME_STATE,
    pond: makeInitialPond(deckActions),
    northHand: getStartingHand(northDeckActions),
    southHand: getStartingHand(southDeckActions),
    northDeck: northDeckActions.resultingDeck,
    southDeck: southDeckActions.resultingDeck,
  };
};
