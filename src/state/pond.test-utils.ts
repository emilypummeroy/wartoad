import { CardClass, type UnitCard } from '../types/card';
import { Player } from '../types/gameflow';
import { createUnit } from './card';
import {
  INITIAL_POND,
  NORTH_LEAF,
  NORTH_UPGRADED,
  type PondState,
  type LeafState,
  SOUTH_LEAF,
  SOUTH_UPGRADED,
} from './pond';

export type TestPondKey = keyof typeof TEST_PONDS_BY_KEY;

const SOUTH_UNIT: UnitCard[] = [
  createUnit({
    cardClass: CardClass.Froglet,
    owner: Player.South,
    key: 15,
  }),
];
const NORTH_UNIT: UnitCard[] = [
  createUnit({
    cardClass: CardClass.Froglet,
    owner: Player.North,
    key: 16,
  }),
];

const SOME_UNITS: UnitCard[] = [
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

const OTHER_UNITS: UnitCard[] = [
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

export const NORTH_LEAF_WITH_UNIT: LeafState = {
  ...NORTH_LEAF,
  units: SOUTH_UNIT,
};
export const NORTH_LEAF_OTHER_UNIT: LeafState = {
  ...NORTH_LEAF,
  units: NORTH_UNIT,
};
export const NORTH_LEAF_WITH_UNITS: LeafState = {
  ...NORTH_LEAF,
  units: NORTH_UNIT,
};
export const NORTH_UPGRADED_UNITS: LeafState = {
  ...NORTH_UPGRADED,
  units: SOME_UNITS,
};
export const NORTH_UPGRADED_OTHER_UNITS: LeafState = {
  ...NORTH_UPGRADED,
  units: OTHER_UNITS,
};

export const SOUTH_LEAF_WITH_UNIT: LeafState = {
  ...SOUTH_LEAF,
  units: SOUTH_UNIT,
};
export const SOUTH_LEAF_OTHER_UNIT: LeafState = {
  ...SOUTH_LEAF,
  units: SOUTH_UNIT,
};
export const SOUTH_LEAF_WITH_UNITS: LeafState = {
  ...SOUTH_LEAF,
  units: SOUTH_UNIT,
};
export const SOUTH_UPGRADED_UNITS: LeafState = {
  ...SOUTH_UPGRADED,
  units: SOME_UNITS,
};
export const SOUTH_UPGRADED_OTHER_UNITS: LeafState = {
  ...SOUTH_UPGRADED,
  units: OTHER_UNITS,
};

export const ANOTHER_POND: PondState = [
  [NORTH_UPGRADED, NORTH_UPGRADED, NORTH_LEAF],
  [NORTH_UPGRADED, NORTH_LEAF, NORTH_UPGRADED],
  [NORTH_LEAF, NORTH_UPGRADED, NORTH_LEAF],
  [NORTH_UPGRADED, NORTH_UPGRADED, NORTH_LEAF],
  [NORTH_UPGRADED, NORTH_LEAF, NORTH_LEAF],
  [NORTH_LEAF, NORTH_UPGRADED, NORTH_UPGRADED],
];
export const ANOTHER_POND_POSITIONS = {
  [Player.North]: {
    LeafHomeRow: { x: 2, y: 0 },
    LeafMiddle: { x: 1, y: 1 },
    UpgradedMiddle: { x: 1, y: 2 },
    LeafEdge: { x: 0, y: 2 },
    UpgradedEdge: { x: 2, y: 1 },
  },
  [Player.South]: {
    LeafHomeRow: { x: 0, y: 5 },
    LeafMiddle: { x: 1, y: 4 },
    UpgradedMiddle: { x: 1, y: 3 },
    LeafEdge: { x: 2, y: 4 },
    UpgradedEdge: { x: 0, y: 3 },
  },
} as const;

export const EMPTY_POND: PondState = [
  [NORTH_LEAF, NORTH_LEAF, NORTH_LEAF],
  [NORTH_LEAF, NORTH_LEAF, NORTH_LEAF],
  [NORTH_LEAF, NORTH_LEAF, NORTH_LEAF],
  [NORTH_LEAF, NORTH_LEAF, NORTH_LEAF],
  [NORTH_LEAF, NORTH_LEAF, NORTH_LEAF],
  [NORTH_LEAF, NORTH_LEAF, NORTH_LEAF],
];

export const FULL_POND: PondState = [
  [NORTH_UPGRADED, NORTH_UPGRADED, NORTH_UPGRADED],
  [NORTH_UPGRADED, NORTH_UPGRADED, NORTH_UPGRADED],
  [NORTH_UPGRADED, NORTH_UPGRADED, NORTH_UPGRADED],
  [NORTH_UPGRADED, NORTH_UPGRADED, NORTH_UPGRADED],
  [NORTH_UPGRADED, NORTH_UPGRADED, NORTH_UPGRADED],
  [NORTH_UPGRADED, NORTH_UPGRADED, NORTH_UPGRADED],
];

export const UNITS_POND: PondState = [
  [NORTH_UPGRADED_UNITS, NORTH_UPGRADED, NORTH_UPGRADED_UNITS],
  [NORTH_UPGRADED, NORTH_LEAF, NORTH_LEAF_WITH_UNIT],
  [NORTH_LEAF_WITH_UNITS, NORTH_UPGRADED, NORTH_LEAF],
  [NORTH_UPGRADED_UNITS, NORTH_UPGRADED, NORTH_LEAF],
  [NORTH_UPGRADED, NORTH_LEAF_WITH_UNIT, NORTH_UPGRADED],
  [NORTH_LEAF, NORTH_UPGRADED, NORTH_LEAF],
];

export const TEST_PONDS_BY_KEY = {
  INITIAL_POND,
  FULL_POND,
  EMPTY_POND,
  ANOTHER_POND,
  UNITS_POND,
} as const;

export const TestPondKey = {
  INITIAL_POND: 'INITIAL_POND',
  FULL_POND: 'FULL_POND',
  EMPTY_POND: 'EMPTY_POND',
  ANOTHER_POND: 'ANOTHER_POND',
  UNITS_POND: 'UNITS_POND',
} as Record<TestPondKey, TestPondKey>;
