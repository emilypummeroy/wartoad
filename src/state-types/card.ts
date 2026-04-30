import {
  CardClass,
  CardType,
  type CardState,
  type LeafCardState,
  type UnitCardState,
  type LeafClass,
  type UnitClass,
  type Leaf,
  type LeafValues,
  type Unit,
  type UnitValues,
} from '../types/card';
import { Player } from '../types/gameflow';

export const isUnit = (card: CardState): card is UnitCardState =>
  card.type === CardType.Unit && Boolean(card satisfies UnitCardState);

export const createUnit = ({
  cardClass,
  values,
  ...baseData
}: {
  readonly key: number;
  readonly cardClass: UnitClass;
  readonly owner: Player;
  readonly values?: Partial<UnitValues>;
}): UnitCardState => ({
  type: CardType.Unit,
  cardClass,
  ...INITIAL_VALUES[CardType.Unit],
  ...values,
  ...baseData,
});

export const isLeaf = (card: CardState): card is LeafCardState =>
  card.type === CardType.Leaf && Boolean(card satisfies LeafCardState);

export const createLeaf = ({
  cardClass,
  ...baseData
}: {
  readonly key: number;
  readonly cardClass: LeafClass;
  readonly owner: Player;
}): LeafCardState => ({
  type: CardType.Leaf,
  cardClass,
  ...INITIAL_VALUES[CardType.Leaf],
  ...baseData,
});

type BaseData = {
  readonly key: number;
  readonly cardClass: CardClass;
  readonly owner: Player;
};

export const createCard = ({ cardClass, ...baseData }: BaseData): CardState => {
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
  [CardType.Leaf]: {},
  [CardType.Unit]: { damage: 0, isExhausted: false },
} as const satisfies Record<Unit, UnitValues> & Record<Leaf, LeafValues>;

export const deterministicStartingHand = (
  owner: Player,
  getNextCardKey: () => number,
) =>
  [
    CardClass.LilyPad,
    CardClass.Froglet,
    CardClass.LilyPad,
    CardClass.Froglet,
    CardClass.Froglet,
    CardClass.Froglet,
    CardClass.LilyPad,
  ]
    .map(cardClass => ({ cardClass, owner, key: getNextCardKey() }))
    .map(x => createCard(x));

export const DETERMINISTIC_NORTH_HAND = [
  createCard({ cardClass: CardClass.LilyPad, owner: Player.North, key: -1 }),
  createCard({ cardClass: CardClass.Froglet, owner: Player.North, key: -2 }),
  createCard({ cardClass: CardClass.LilyPad, owner: Player.North, key: -3 }),
  createCard({ cardClass: CardClass.Froglet, owner: Player.North, key: -4 }),
  createCard({ cardClass: CardClass.Froglet, owner: Player.North, key: -5 }),
  createCard({ cardClass: CardClass.Froglet, owner: Player.North, key: -6 }),
  createCard({ cardClass: CardClass.LilyPad, owner: Player.North, key: -7 }),
];

export const DETERMINISTIC_SOUTH_HAND = [
  createCard({ cardClass: CardClass.LilyPad, owner: Player.South, key: -8 }),
  createCard({ cardClass: CardClass.Froglet, owner: Player.South, key: -9 }),
  createCard({ cardClass: CardClass.LilyPad, owner: Player.South, key: -10 }),
  createCard({ cardClass: CardClass.Froglet, owner: Player.South, key: -11 }),
  createCard({ cardClass: CardClass.Froglet, owner: Player.South, key: -12 }),
  createCard({ cardClass: CardClass.Froglet, owner: Player.South, key: -13 }),
  createCard({ cardClass: CardClass.LilyPad, owner: Player.South, key: -14 }),
];
