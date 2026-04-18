import type { Player } from './PhaseTracker';

// Cards are the objects which you draw, have in your hand
// play to the Pond, etc.
// Cards have a key to uniquely identify them among instances
// of the same CardClass.
//
// TODO 9: They exist in a Space such as the aforementioned Hand, Pond, etc.
//
// They are owned by a particular player.
// Some cards track additional details like how much damage they've taken.
export type Card = UnitCard | LeafCard;
export type UnitCard = CardOf<Unit>;
export type LeafCard = CardOf<Leaf>;
export type CardOf<T extends CardType> = {
  readonly type: T;
  readonly key: number;
  readonly owner: Player;
  readonly class: T extends Unit
    ? UnitClass
    : T extends Leaf
      ? LeafClass
      : never;
  readonly values: T extends Unit
    ? UnitValues
    : T extends Leaf
      ? LeafValues
      : never;
};

// All cards are either Leaves or Units.
// This is the "type" of a card.
export type CardType = Unit | Leaf;
export type Unit = typeof CardType.Unit;
export type Leaf = typeof CardType.Leaf;
export const CardType = {
  Leaf: 'Leaf',
  Unit: 'Unit',
} as const;

// Different card types need different sets of stats.
// This could be a higher order type but it's unnecessary for
// all constant card classes and a small number of card types.
export type CardStats = UnitStats | LeafStats;
export type UnitStats = {
  readonly life: number;
  readonly speed: number;
  readonly power: number;
  readonly range: number;
};
export type LeafStats = {
  readonly gives: number;
};

// A card class is the category of cards with a particular set of details.
// An individual card is an instance of a card class.
// The information printed on a card is defined by its card class.
// All card classes need some common info as well as additional info
// unique to its type.
export type CardClass = UnitClass | LeafClass;
export type UnitClass = CardClassOf<Unit>;
export type LeafClass = CardClassOf<Leaf>;
export type CardClassOf<T extends CardType> = {
  readonly type: T;
  readonly key: T extends Unit ? UnitKey : T extends Leaf ? LeafKey : never;
  readonly name: string;
  readonly cost: number;
  readonly stats: T extends Unit
    ? UnitStats
    : T extends Leaf
      ? LeafStats
      : never;
};

// CardKey is the canonical key for a CardClass
export type CardKey = UnitKey | LeafKey;
export type UnitKey = keyof typeof _UnitClass;
export type LeafKey = keyof typeof _LeafClass;

// Individual cards have values attached to them which change over time.
// For example, units take damage.
export type CardValues = UnitValues | LeafValues;
export type UnitValues = { readonly damage: number };
export type LeafValues = typeof NoneValues;
export const NoneValues = 'None' as const;

export const UnitCard = {
  is: (card: Card): card is UnitCard =>
    card.type === CardType.Unit && Boolean(card satisfies UnitCard),
};

export const LeafCard = {
  is: (card: Card): card is LeafCard =>
    card.type === CardType.Leaf && Boolean(card satisfies LeafCard),
};

export const UnitClass = {
  is: (cardClass: CardClass): cardClass is UnitClass =>
    cardClass.type === CardType.Unit && Boolean(cardClass satisfies UnitClass),
};

export const LeafClass = {
  is: (cardClass: CardClass): cardClass is LeafClass =>
    cardClass.type === CardType.Leaf && Boolean(cardClass satisfies LeafClass),
};

export const Card = {
  new: ({
    class: cardClass,
    ...baseData
  }: {
    readonly key: number;
    readonly class: CardClass;
    readonly owner: Player;
  }): Card => {
    switch (cardClass.type) {
      case CardType.Unit:
        return {
          ...baseData,
          type: CardType.Unit,
          class: cardClass,
          values: initialValues[cardClass.key],
        };
      case CardType.Leaf:
        return {
          ...baseData,
          type: CardType.Leaf,
          class: cardClass,
          values: initialValues[cardClass.key],
        };
      // v8 ignore start
      default:
        cardClass satisfies never;
        throw new Error('Inexhaustive branch coverage');
      // v8 ignore stop
    }
  },
};

// All the classes of unit cards
const _UnitClass = {
  Froglet: {
    key: 'Froglet',
    name: 'Froglet',
    cost: 0,
    type: CardType.Unit,
    stats: {
      life: 1,
      speed: 1,
      power: 0,
      range: 0,
    },
  },
} as const;
_UnitClass satisfies Record<UnitKey, UnitClass>;

// All the classes of leaf cards
const _LeafClass = {
  LilyPad: {
    key: 'LilyPad',
    name: 'Lily Pad',
    cost: 0,
    type: CardType.Leaf,
    stats: { gives: 0 },
  },
} as const;
_LeafClass satisfies Record<LeafKey, LeafClass>;

export const CardClass = { ..._UnitClass, ..._LeafClass } as const;
CardClass satisfies Record<UnitKey, UnitClass>;
CardClass satisfies Record<LeafKey, LeafClass>;
CardClass satisfies Record<CardKey, CardClass>;
// Make sure the key of each CardClass is consistent
CardClass satisfies {
  [P in CardKey]: {
    key: P;
  };
};

const initialValues: {
  [K in CardKey]: K extends UnitKey
    ? UnitValues
    : K extends LeafKey
      ? LeafValues
      : never;
} = {
  [CardClass.Froglet.key]: { damage: 0 },
  [CardClass.LilyPad.key]: NoneValues,
};
