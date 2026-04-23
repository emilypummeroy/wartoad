import type { UnitCard } from '../types/card';
import { Player } from '../types/gameflow';
import type { Position } from '../types/position';

export type PondState = readonly [
  readonly [LeafState, LeafState, LeafState],
  readonly [LeafState, LeafState, LeafState],
  readonly [LeafState, LeafState, LeafState],
  readonly [LeafState, LeafState, LeafState],
  readonly [LeafState, LeafState, LeafState],
  readonly [LeafState, LeafState, LeafState],
];

export type LeafState = Readonly<{
  units: readonly UnitCard[];
  isUpgraded: boolean;
  controller: Player;
  // TODO 10: Controller in ZoneState
}>;

export const isPondState = (
  array: ReadonlyArray<ReadonlyArray<LeafState>>,
): array is PondState =>
  array.length === ROW_COUNT &&
  array.every(row => row.length === LEAF_COUNT_PER_ROW);

export const getPondStateAt = (
  pond: PondState,
  { x, y }: Position,
): LeafState => pond[y][x];

export const setPondStateAt = (
  old: PondState,
  { x, y }: Position,
  newValue: Partial<LeafState> | ((old: LeafState) => Partial<LeafState>),
): PondState => {
  const array = old.map((row, yy) =>
    yy !== y
      ? row
      : row.map(
          (oldValue, xx): LeafState =>
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
  init: PondState,
  ...updates: readonly (readonly [
    Position,
    (leaf: LeafState) => Partial<LeafState>,
  ])[]
): PondState =>
  updates.reduce(
    (pond, [at, update]) => setPondStateAt(pond, at, update),
    init,
  );

export const ROW_COUNT = 6 as const;
export const ROW_COUNT_PER_PLAYER = 3 as const;
export const LEAF_COUNT_PER_ROW = 3 as const;

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
export const INITIAL_POND: PondState = [
  [NORTH_LEAF, NORTH_UPGRADED, NORTH_LEAF],
  [NORTH_LEAF, NORTH_LEAF, NORTH_LEAF],
  [NORTH_LEAF, NORTH_LEAF, NORTH_LEAF],
  [SOUTH_LEAF, SOUTH_LEAF, SOUTH_LEAF],
  [SOUTH_LEAF, SOUTH_LEAF, SOUTH_LEAF],
  [SOUTH_LEAF, SOUTH_UPGRADED, SOUTH_LEAF],
];

export const HOME = {
  [Player.North]: { x: 1, y: 0 },
  [Player.South]: { x: 1, y: ROW_COUNT - 1 },
};
