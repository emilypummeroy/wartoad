// All cards are either Leaves or Units.
// This is the "type" of a card.
export const CardType = {
  Leaf: 'Leaf',
  Unit: 'Unit',
} as const;
export type CardType = (typeof CardType)[keyof typeof CardType];

// Different card types need different sets of stats.
// This could be a higher order type but it's unnecessary for
// all constant card classes and a small number of card types.
export type LeafStats = {
  readonly gives: number;
};
export type UnitStats = {
  readonly life: number;
  readonly speed: number;
  readonly power: number;
  readonly range: number;
};
export type CardStats = LeafStats | UnitStats;

// A card class is the category of cards with a particular set of details.
// An individual card is an instance of a card class.
// The information printed on a card is defined by its card class.
// All card classes need some common info as well as additional info
// unique to its type.
export type LeafClass = Readonly<{
  key: string;
  name: string;
  cost: number;
  type: typeof CardType.Leaf;
  details: LeafStats;
}>;
export type UnitClass = Readonly<{
  key: string;
  name: string;
  cost: number;
  type: typeof CardType.Unit;
  details: UnitStats;
}>;
export type BaseCardClass = (LeafClass | UnitClass) &
  Readonly<{
    key: string;
    name: string;
    cost: number;
    type: CardType;
    details: CardStats;
  }>;

export const CardClass = {
  Froglet: {
    key: 'Froglet',
    name: 'Froglet',
    cost: 0,
    type: CardType.Unit,
    details: {
      life: 0,
      speed: 0,
      power: 0,
      range: 0,
    },
  } as const,
  LilyPad: {
    key: 'LilyPad',
    name: 'Lily Pad',
    cost: 0,
    type: CardType.Leaf,
    details: { gives: 0 },
  } as const,
} as const satisfies Record<string, UnitClass | LeafClass>;

export type CardClass = (typeof CardClass)[keyof typeof CardClass];

// Canonical way to refer to a CardClass
export type CardKey = keyof typeof CardClass;

// Make sure the key of each CardClass is consistent
CardClass satisfies {
  [P in CardKey]: {
    key: P;
  };
};
