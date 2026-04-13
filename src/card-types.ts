export const CardType = {
  Leaf: 'Leaf',
  Unit: 'Unit',
} as const;
export type CardType = (typeof CardType)[keyof typeof CardType];

export type LeafDetails = {
  readonly gives: number;
};
export type UnitDetails = {
  readonly life: number;
  readonly speed: number;
  readonly power: number;
  readonly range: number;
};
export type CardDetails = LeafDetails | UnitDetails;

type BaseCardClassType = {
  readonly key: string;
  readonly name: string;
  readonly cost: number;
  readonly type: CardType;
  readonly details: CardDetails;
};
export type LeafClassType = BaseCardClassType & {
  readonly type: typeof CardType.Leaf;
  readonly details: LeafDetails;
};
export type UnitClassType = BaseCardClassType & {
  readonly type: typeof CardType.Unit;
  readonly details: UnitDetails;
};
export type CardClass = LeafClassType | UnitClassType;

const Froglet = {
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
} as const;

const LilyPad = {
  key: 'LilyPad',
  name: 'Lily Pad',
  cost: 0,
  type: CardType.Leaf,
  details: { gives: 0 },
} as const;

export const CardClass = {
  Froglet,
  LilyPad,
} as const satisfies Record<string, CardClass>;

export type ClassKey = keyof typeof CardClass;

CardClass satisfies {
  [P in ClassKey]: {
    key: P;
  };
};
