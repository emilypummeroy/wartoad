import {
  CardType,
  type CardClass,
  type CardState,
  type CardClassOf,
  type CardStateOf,
  type Leaf,
  type Unit,
  type CardKey,
  type LeafState,
} from './card';

export type Deck = readonly CardState[];

export type DeckSpec = {
  readonly home: CardClass;
  readonly cards: Record<CardKey, number>;
  readonly makeDeck: () => readonly CardState[];
};

export type Tutor = (cardClass: CardClass) => CardState | undefined;
export type LeafTutor = TutorOf<Leaf>;
export type UnitTutor = TutorOf<Unit>;
export type TutorOf<T extends CardType = CardType> = (
  cardClass: CardClassOf<T>,
) => CardStateOf<T> | undefined;

export type DeckActions = {
  readonly draw: () => CardState | undefined;
  readonly tutor: Tutor;
  readonly tutorLeaf: LeafTutor;
  readonly resultingDeck: Deck;
};

export const createDeckActions = (oldDeck: Deck): DeckActions => {
  const deck = [...oldDeck];
  return {
    draw: () => deck.shift(),

    tutor: cardClass => {
      const i = deck.findIndex(card => card.cardClass === cardClass);
      const maybeLeaves = deck.splice(i, 1);
      if (maybeLeaves.length === 0) return undefined;
      const [card] = maybeLeaves;
      return card;
    },

    tutorLeaf: cardClass => {
      const i = deck.findIndex(card => card.cardClass === cardClass);
      const maybeLeaves = deck.splice(i, 1);
      if (maybeLeaves.length === 0) return undefined;
      const [card] = maybeLeaves;
      if (card.type !== CardType.Leaf)
        throw new Error(
          `Tutored a Leaf but got ${card.type} ${JSON.stringify(card)}`,
        );
      card satisfies LeafState;
      return card;
    },

    get resultingDeck() {
      return [...deck];
    },
  };
};
