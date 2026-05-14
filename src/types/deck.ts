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
import type { Player } from './gameflow';

export type Deck = readonly CardState[];

export type DeckSpec = {
  readonly home: CardClass;
  readonly cards: Record<CardKey, number>;
  readonly makeDeck: () => readonly CardState[];
};

export type DeckActions = {
  readonly draw: ReturnType<Draw>;
};

export type Tutor2 = (cardClass: CardClass) => CardState | undefined;
export type LeafTutor2 = TutorOf2<Leaf>;
export type UnitTutor2 = TutorOf2<Unit>;
export type TutorOf2<T extends CardType = CardType> = (
  cardClass: CardClassOf<T>,
) => CardStateOf<T> | undefined;

export type DeckActions2 = {
  readonly draw: () => CardState | undefined;
  readonly tutor: Tutor2;
  readonly tutorLeaf: LeafTutor2;
  readonly resultingDeck: Deck;
};

export const createDeckActions = (oldDeck: Deck): DeckActions2 => {
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

export type Tutor = (player: Player) => (cardClass: CardClass) => CardState;
export type LeafTutor = TutorOf<Leaf>;
export type UnitTutor = TutorOf<Unit>;
export type TutorOf<T extends CardType = CardType> = (
  player: Player,
) => (cardClass: CardClassOf<T>) => CardStateOf<T>;

export type Draw = (player: Player) => () => CardState;
