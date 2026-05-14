import type { CardClass, CardState } from '../types/card';

export type DeckSpec = {
  readonly home: CardClass;
  readonly cards: readonly CardClass[];
  readonly makeDeck: () => readonly CardState[];
};
