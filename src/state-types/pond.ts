import type { Read } from '../types';
import type { UnitCard } from '../types/card';
import { Player } from '../types/gameflow';
import type { Position } from '../types/position';

export type PondState = Read<
  [
    [LeafState, LeafState, LeafState],
    [LeafState, LeafState, LeafState],
    [LeafState, LeafState, LeafState],
    [LeafState, LeafState, LeafState],
    [LeafState, LeafState, LeafState],
    [LeafState, LeafState, LeafState],
  ]
>;

export type LeafState = Read<{
  units: UnitCard[];
  isUpgraded: boolean;
  controller: Player;
}>;

export const isPondState = (array: Read<LeafState[][]>): array is PondState =>
  array.length === ROW_COUNT &&
  array.every(row => row.length === LEAF_COUNT_PER_ROW);

export const getPondStateAt = (
  pond: Read<PondState>,
  { x, y }: Position,
): Read<LeafState> => pond[y][x];

export const setPondStateAt = (
  old: Read<PondState>,
  { x, y }: Position,
  newValue:
    | Read<Partial<LeafState>>
    | ((old: Read<LeafState>) => Partial<LeafState>),
): PondState => {
  const array = old.map((row, yy) =>
    yy !== y
      ? row
      : row.map(
          (oldValue, xx): Read<LeafState> =>
            xx !== x
              ? oldValue
              : typeof newValue === 'function'
                ? { ...oldValue, ...newValue(oldValue) }
                : { ...oldValue, ...newValue },
        ),
  );
  // v8 ignore if
  if (!isPondState(array)) {
    throw new Error(`Expected a PondState but got: ${JSON.stringify(array)}`);
  }
  return array;
};

export const setPondStateAtEach = (
  init: Read<PondState>,
  ...updates: readonly (readonly [
    Position,
    (leaf: Read<LeafState>) => Partial<LeafState>,
  ])[]
): Read<PondState> =>
  updates.reduce(
    (pond, [at, update]) => setPondStateAt(pond, at, update),
    init,
  );

export const ROW_COUNT = 6 as const;
export const LAST_ROW = 5 as const;
export const ROW_COUNT_PER_PLAYER = 3 as const;
export const LEAF_COUNT_PER_ROW = 3 as const;
export const LAST_IN_ROW = 2 as const;

export const NORTH_UPGRADED = {
  units: [],
  isUpgraded: true,
  controller: Player.North,
} as const;
export const NORTH_LEAF = {
  units: [],
  isUpgraded: false,
  controller: Player.North,
} as const;
export const SOUTH_UPGRADED = {
  units: [],
  isUpgraded: true,
  controller: Player.South,
} as const;
export const SOUTH_LEAF = {
  units: [],
  isUpgraded: false,
  controller: Player.South,
} as const;
export const INITIAL_POND: Read<PondState> = [
  [NORTH_LEAF, NORTH_UPGRADED, NORTH_LEAF],
  [NORTH_LEAF, NORTH_LEAF, NORTH_LEAF],
  [NORTH_LEAF, NORTH_LEAF, NORTH_LEAF],
  [SOUTH_LEAF, SOUTH_LEAF, SOUTH_LEAF],
  [SOUTH_LEAF, SOUTH_LEAF, SOUTH_LEAF],
  [SOUTH_LEAF, SOUTH_UPGRADED, SOUTH_LEAF],
];

export const HOME = {
  [Player.North]: { x: 1, y: 0 },
  [Player.South]: { x: 1, y: LAST_ROW },
} as const;
