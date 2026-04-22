import { CardClass, type UnitCard } from '../types/card';
import { Player } from '../types/gameflow';
import { createUnit } from './card';
import {
  INITIAL_POND,
  LEAF,
  UPGRADED,
  type PondState,
  type LeafState,
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

export const LEAF_WITH_UNIT: LeafState = {
  ...LEAF,
  units: SOUTH_UNIT,
};
export const LEAF_OTHER_UNIT: LeafState = {
  ...LEAF,
  units: NORTH_UNIT,
};
export const LEAF_WITH_UNITS: LeafState = {
  ...LEAF,
  units: NORTH_UNIT,
};
export const UPGRADED_UNITS: LeafState = {
  ...UPGRADED,
  units: SOME_UNITS,
};
export const UPGRADED_OTHER_UNITS: LeafState = {
  ...UPGRADED,
  units: OTHER_UNITS,
};

export const ANOTHER_POND: PondState = [
  [UPGRADED, UPGRADED, LEAF],
  [UPGRADED, LEAF, UPGRADED],
  [LEAF, UPGRADED, LEAF],
  [UPGRADED, UPGRADED, LEAF],
  [UPGRADED, LEAF, LEAF],
  [LEAF, UPGRADED, UPGRADED],
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
  [LEAF, LEAF, LEAF],
  [LEAF, LEAF, LEAF],
  [LEAF, LEAF, LEAF],
  [LEAF, LEAF, LEAF],
  [LEAF, LEAF, LEAF],
  [LEAF, LEAF, LEAF],
];

export const FULL_POND: PondState = [
  [UPGRADED, UPGRADED, UPGRADED],
  [UPGRADED, UPGRADED, UPGRADED],
  [UPGRADED, UPGRADED, UPGRADED],
  [UPGRADED, UPGRADED, UPGRADED],
  [UPGRADED, UPGRADED, UPGRADED],
  [UPGRADED, UPGRADED, UPGRADED],
];

export const UNITS_POND: PondState = [
  [UPGRADED_UNITS, UPGRADED, UPGRADED_UNITS],
  [UPGRADED, LEAF, LEAF_WITH_UNIT],
  [LEAF_WITH_UNITS, UPGRADED, LEAF],
  [UPGRADED_UNITS, UPGRADED, LEAF],
  [UPGRADED, LEAF_WITH_UNIT, UPGRADED],
  [LEAF, UPGRADED, LEAF],
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
