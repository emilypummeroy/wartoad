import type {
  CardClass,
  CardState,
  CardClassOf,
  CardStateOf,
  CardType,
  Leaf,
  Unit,
  CardKey,
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
  readonly leafTutor: ReturnType<LeafTutor>;
};

export type TakeCard = (deck: Deck) => [CardState | undefined, Deck];
export type DeckActions2 = {
  readonly draw: TakeCard;
  readonly leafTutor: TakeCard;
};

export type Tutor = (player: Player) => (cardClass: CardClass) => CardState;
export type LeafTutor = TutorOf<Leaf>;
export type UnitTutor = TutorOf<Unit>;
export type TutorOf<T extends CardType = CardType> = (
  player: Player,
) => (cardClass: CardClassOf<T>) => CardStateOf<T>;

export type Draw = (player: Player) => () => CardState;
