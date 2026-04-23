import {
  CardClass,
  CardType,
  NoneValues,
  type Card,
  type LeafCard,
  type UnitCard,
  type LeafClass,
  type UnitClass,
  type Leaf,
  type LeafValues,
  type Unit,
  type UnitValues,
} from '../types/card';
import type { Player } from '../types/gameflow';

export const isUnit = (card: Card): card is UnitCard =>
  card.type === CardType.Unit && Boolean(card satisfies UnitCard);

export const createUnit = ({
  cardClass,
  ...baseData
}: {
  readonly key: number;
  readonly cardClass: UnitClass;
  readonly owner: Player;
}): UnitCard => ({
  type: CardType.Unit,
  cardClass,
  values: INITIAL_VALUES[CardType.Unit],
  ...baseData,
});

export const isLeaf = (card: Card): card is LeafCard =>
  card.type === CardType.Leaf && Boolean(card satisfies LeafCard);

export const createLeaf = ({
  cardClass,
  ...baseData
}: {
  readonly key: number;
  readonly cardClass: LeafClass;
  readonly owner: Player;
}): LeafCard => ({
  type: CardType.Leaf,
  cardClass,
  values: INITIAL_VALUES[CardType.Leaf],
  ...baseData,
});

type BaseData = {
  readonly key: number;
  readonly cardClass: CardClass;
  readonly owner: Player;
};

export const createCard = ({ cardClass, ...baseData }: BaseData): Card => {
  switch (cardClass.type) {
    case CardType.Unit:
      return createUnit({ ...baseData, cardClass });
    case CardType.Leaf:
      return createLeaf({ ...baseData, cardClass });
    // v8 ignore start
    default:
      cardClass satisfies never;
      throw new Error('Inexhaustive branch coverage');
    // v8 ignore stop
  }
};

const INITIAL_VALUES = {
  [CardType.Leaf]: NoneValues,
  [CardType.Unit]: { damage: 0 },
} as const satisfies Record<Unit, UnitValues> & Record<Leaf, LeafValues>;

export const DETERMINISTIC_STARTING_HAND = [
  CardClass.LilyPad,
  CardClass.Froglet,
  CardClass.LilyPad,
  CardClass.Froglet,
  CardClass.Froglet,
  CardClass.Froglet,
  CardClass.LilyPad,
];
