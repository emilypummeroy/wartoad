import type { Player } from './gameflow';

// Cards are the objects which you draw, have in your hand
// play to the Pond, etc.
// Cards have a key to uniquely identify them among instances
// of the same CardClass.
//
// They are owned by a particular player.
// Some cards track additional values like how much damage they've taken.
export type CardState = UnitState | LeafState;
export type UnitState = CardStateOf<Unit>;
export type LeafState = CardStateOf<Leaf>;
export type CardStateOf<T extends CardType> = CardValuesOf<T> & {
  readonly type: T;
  readonly key: number;
  readonly owner: Player;
  readonly cardClass: CardClassOf<T>;
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
export type CardStatsOf<T extends CardType> = T extends Unit
  ? UnitStats
  : T extends Leaf
    ? LeafStats
    : never;

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
  readonly key: CardKeyOf<T>;
  readonly name: string;
  readonly cost: number;
  readonly stats: CardStatsOf<T>;
};

// CardKey is the canonical key for a CardClass
export type CardKey = UnitKey | LeafKey;
export type UnitKey = keyof typeof UnitClass;
export type LeafKey = keyof typeof LeafClass;
export type CardKeyOf<T extends CardType> = T extends Unit
  ? UnitKey
  : T extends Leaf
    ? LeafKey
    : never;

// Individual cards have values attached to them which change over time.
// For example, units take damage.
export type CardValues = UnitValues | LeafValues;
export type UnitValues = {
  readonly damage: number;
  readonly isExhausted: boolean;
};
export type LeafValues = {};
export type CardValuesOf<T extends CardType> = T extends Unit
  ? UnitValues
  : T extends Leaf
    ? LeafValues
    : never;

// All the classes of unit cards.
export const UnitClass = {
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
  } as const,
};
UnitClass satisfies Record<UnitKey, UnitClass>;

// All the classes of leaf cards
export const LeafClass = {
  LilyPad: {
    key: 'LilyPad',
    name: 'Lily Pad',
    cost: 0,
    type: CardType.Leaf,
    stats: { gives: 0 },
  },
} as const;
LeafClass satisfies Record<LeafKey, LeafClass>;

export const NoneValues = 'None' as const;

export const CardClass = { ...UnitClass, ...LeafClass } as const;

export const CardKey = {
  Froglet: CardClass.Froglet.key,
  LilyPad: LeafClass.LilyPad.key,
} as const;
CardKey satisfies Record<CardKey, CardKey>;
CardKey satisfies Record<UnitKey, UnitKey>;
CardKey satisfies Record<LeafKey, LeafKey>;

CardClass satisfies Record<UnitKey, UnitClass>;
CardClass satisfies Record<LeafKey, LeafClass>;
CardClass satisfies Record<CardKey, CardClass>;
// Make sure the key of each CardClass is consistent
CardClass satisfies {
  [P in CardKey]: {
    key: P;
  };
};
