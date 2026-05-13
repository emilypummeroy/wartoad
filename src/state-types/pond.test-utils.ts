import { CardClass, type UnitState } from '../types/card';
import { Player } from '../types/gameflow';
import { createUnit } from './card';
import { leafTutor } from './deck.test-utils';
import { type PondState, type PondLeafState } from './pond';

export type TestPondKey = keyof typeof TEST_PONDS_BY_KEY;

export type TestLeafKey = (typeof TestLeafKey)[keyof typeof TEST_LEAVES_BY_KEY];

export const NORTH_LILYPAD: PondLeafState = {
  units: [],
  leaf: leafTutor(Player.North)(CardClass.LilyPad),
  controller: Player.North,
} as const;
export const NORTH_LEAF: PondLeafState = {
  units: [],
  controller: Player.North,
  leaf: undefined,
} as const;
export const SOUTH_LILYPAD: PondLeafState = {
  units: [],
  leaf: leafTutor(Player.South)(CardClass.LilyPad),
  controller: Player.South,
} as const;
export const SOUTH_LEAF: PondLeafState = {
  units: [],
  controller: Player.South,
  leaf: undefined,
} as const;
export const INITIAL_POND: PondState = [
  [NORTH_LEAF, NORTH_LILYPAD, NORTH_LEAF],
  [NORTH_LEAF, NORTH_LEAF, NORTH_LEAF],
  [NORTH_LEAF, NORTH_LEAF, NORTH_LEAF],
  [SOUTH_LEAF, SOUTH_LEAF, SOUTH_LEAF],
  [SOUTH_LEAF, SOUTH_LEAF, SOUTH_LEAF],
  [SOUTH_LEAF, SOUTH_LILYPAD, SOUTH_LEAF],
];

const SOUTH_UNIT: UnitState[] = [
  createUnit({
    cardClass: CardClass.Froglet,
    owner: Player.South,
    key: 15,
  }),
];
const NORTH_UNIT: UnitState[] = [
  createUnit({
    cardClass: CardClass.Froglet,
    owner: Player.North,
    key: 16,
  }),
];

const SOME_UNITS: UnitState[] = [
  createUnit({
    cardClass: CardClass.Froglet,
    owner: Player.North,
    key: 0,
  }),
  createUnit({
    cardClass: CardClass.Froglet,
    owner: Player.South,
    key: 1,
  }),
  createUnit({
    cardClass: CardClass.Froglet,
    owner: Player.South,
    key: 2,
  }),
];

const OTHER_UNITS: UnitState[] = [
  createUnit({
    cardClass: CardClass.Froglet,
    owner: Player.South,
    key: 3,
  }),
  createUnit({
    cardClass: CardClass.Froglet,
    owner: Player.North,
    key: 4,
  }),
  createUnit({
    cardClass: CardClass.Froglet,
    owner: Player.North,
    key: 5,
  }),
];

export const NORTH_LEAF_WITH_UNIT: PondLeafState = {
  ...NORTH_LEAF,
  units: NORTH_UNIT,
};
export const NORTH_LEAF_OTHER_UNIT: PondLeafState = {
  ...NORTH_LEAF,
  units: SOUTH_UNIT,
};
export const NORTH_LEAF_WITH_UNITS: PondLeafState = {
  ...NORTH_LEAF,
  units: SOME_UNITS,
};
export const NORTH_LILYPAD_UNIT: PondLeafState = {
  ...NORTH_LILYPAD,
  units: NORTH_UNIT,
};
export const NORTH_LILYPAD_OTHER_UNIT: PondLeafState = {
  ...NORTH_LILYPAD,
  units: SOUTH_UNIT,
};
export const NORTH_LILYPAD_UNITS: PondLeafState = {
  ...NORTH_LILYPAD,
  units: SOME_UNITS,
};

export const SOUTH_LEAF_WITH_UNIT: PondLeafState = {
  ...SOUTH_LEAF,
  units: SOUTH_UNIT,
};
export const SOUTH_LEAF_OTHER_UNIT: PondLeafState = {
  ...SOUTH_LEAF,
  units: NORTH_UNIT,
};
export const SOUTH_LEAF_WITH_UNITS: PondLeafState = {
  ...SOUTH_LEAF,
  units: OTHER_UNITS,
};
export const SOUTH_LILYPAD_UNIT: PondLeafState = {
  ...SOUTH_LILYPAD,
  units: SOUTH_UNIT,
};
export const SOUTH_LILYPAD_OTHER_UNIT: PondLeafState = {
  ...SOUTH_LILYPAD,
  units: NORTH_UNIT,
};
export const SOUTH_LILYPAD_UNITS: PondLeafState = {
  ...SOUTH_LILYPAD,
  units: OTHER_UNITS,
};

export const ANOTHER_POND: PondState = [
  [NORTH_LILYPAD, NORTH_LILYPAD, NORTH_LEAF],
  [NORTH_LILYPAD, SOUTH_LEAF, SOUTH_LILYPAD],
  [NORTH_LEAF, NORTH_LILYPAD, SOUTH_LEAF],
  [NORTH_LILYPAD, SOUTH_LILYPAD, SOUTH_LEAF],
  [NORTH_LILYPAD, NORTH_LEAF, SOUTH_LEAF],
  [SOUTH_LEAF, SOUTH_LILYPAD, SOUTH_LILYPAD],
];
export const ANOTHER_POND_POSITIONS = {
  [Player.North]: {
    LeafHomeRow: { x: 2, y: 0 },
    LeafMiddle: { x: 1, y: 4 },
    UpgradedMiddle: { x: 1, y: 2 },
    LeafEdge: { x: 0, y: 2 },
    UpgradedEdge: { x: 0, y: 3 },
  },
  [Player.South]: {
    LeafHomeRow: { x: 0, y: 5 },
    LeafMiddle: { x: 1, y: 1 },
    UpgradedMiddle: { x: 1, y: 3 },
    LeafEdge: { x: 2, y: 4 },
    UpgradedEdge: { x: 2, y: 1 },
  },
} as const;

export const FULL_POND: PondState = [
  [NORTH_LILYPAD, NORTH_LILYPAD, NORTH_LILYPAD],
  [NORTH_LILYPAD, NORTH_LILYPAD, NORTH_LILYPAD],
  [NORTH_LILYPAD, NORTH_LILYPAD, NORTH_LILYPAD],
  [SOUTH_LILYPAD, SOUTH_LILYPAD, SOUTH_LILYPAD],
  [SOUTH_LILYPAD, SOUTH_LILYPAD, SOUTH_LILYPAD],
  [SOUTH_LILYPAD, SOUTH_LILYPAD, SOUTH_LILYPAD],
];

export const UNITS_POND: PondState = [
  [NORTH_LILYPAD_UNITS, NORTH_LILYPAD, NORTH_LILYPAD_UNITS],
  [NORTH_LILYPAD, NORTH_LEAF, NORTH_LEAF_WITH_UNIT],
  [NORTH_LEAF_WITH_UNITS, NORTH_LILYPAD, NORTH_LEAF_OTHER_UNIT],
  [SOUTH_LILYPAD_UNITS, SOUTH_LILYPAD, SOUTH_LEAF_OTHER_UNIT],
  [SOUTH_LILYPAD, SOUTH_LEAF_WITH_UNIT, SOUTH_LILYPAD],
  [SOUTH_LEAF, SOUTH_LILYPAD, SOUTH_LEAF],
];

export const TEST_PONDS_BY_KEY = {
  INITIAL_POND,
  FULL_POND,
  ANOTHER_POND,
  UNITS_POND,
} as const;

export const TestPondKey = {
  INITIAL_POND: 'INITIAL_POND',
  FULL_POND: 'FULL_POND',
  ANOTHER_POND: 'ANOTHER_POND',
  UNITS_POND: 'UNITS_POND',
} as Record<TestPondKey, TestPondKey>;

export const TEST_LEAVES_BY_KEY = {
  NORTH_LEAF,
  NORTH_LEAF_WITH_UNIT,
  NORTH_LEAF_OTHER_UNIT,
  NORTH_LEAF_WITH_UNITS,
  NORTH_LILYPAD,
  NORTH_LILYPAD_UNIT,
  NORTH_LILYPAD_OTHER_UNIT,
  NORTH_LILYPAD_UNITS,
  SOUTH_LEAF,
  SOUTH_LEAF_WITH_UNIT,
  SOUTH_LEAF_OTHER_UNIT,
  SOUTH_LEAF_WITH_UNITS,
  SOUTH_LILYPAD,
  SOUTH_LILYPAD_UNIT,
  SOUTH_LILYPAD_OTHER_UNIT,
  SOUTH_LILYPAD_UNITS,
} as const;

export const TestLeafKey = {
  NORTH_LEAF: 'NORTH_LEAF',
  NORTH_LEAF_WITH_UNIT: 'NORTH_LEAF_WITH_UNIT',
  NORTH_LEAF_OTHER_UNIT: 'NORTH_LEAF_OTHER_UNIT',
  NORTH_LEAF_WITH_UNITS: 'NORTH_LEAF_WITH_UNITS',
  NORTH_LILYPAD: 'NORTH_LILYPAD',
  NORTH_LILYPAD_UNIT: 'NORTH_LILYPAD_UNIT',
  NORTH_LILYPAD_OTHER_UNIT: 'NORTH_LILYPAD_OTHER_UNIT',
  NORTH_LILYPAD_UNITS: 'NORTH_LILYPAD_UNITS',
  SOUTH_LEAF: 'SOUTH_LEAF',
  SOUTH_LEAF_WITH_UNIT: 'SOUTH_LEAF_WITH_UNIT',
  SOUTH_LEAF_OTHER_UNIT: 'SOUTH_LEAF_OTHER_UNIT',
  SOUTH_LEAF_WITH_UNITS: 'SOUTH_LEAF_WITH_UNITS',
  SOUTH_LILYPAD: 'SOUTH_LILYPAD',
  SOUTH_LILYPAD_UNIT: 'SOUTH_LILYPAD_UNIT',
  SOUTH_LILYPAD_OTHER_UNIT: 'SOUTH_LILYPAD_OTHER_UNIT',
  SOUTH_LILYPAD_UNITS: 'SOUTH_LILYPAD_UNITS',
} as const;
TestLeafKey satisfies Record<TestLeafKey, keyof typeof TEST_LEAVES_BY_KEY>;
