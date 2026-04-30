import type { UnitState } from '../types/card';
import { Player } from '../types/gameflow';
import {
  arePositionsEqual,
  isPosition,
  type Position,
} from '../types/position';

export type PondState = readonly [
  readonly [PondLeafState, PondLeafState, PondLeafState],
  readonly [PondLeafState, PondLeafState, PondLeafState],
  readonly [PondLeafState, PondLeafState, PondLeafState],
  readonly [PondLeafState, PondLeafState, PondLeafState],
  readonly [PondLeafState, PondLeafState, PondLeafState],
  readonly [PondLeafState, PondLeafState, PondLeafState],
];

export type PondLeafState = {
  readonly units: readonly UnitState[];
  readonly isUpgraded: boolean;
  readonly controller: Player;
};

export const isPondState = (
  array: ReadonlyArray<ReadonlyArray<PondLeafState>>,
): array is PondState =>
  array.length === ROW_COUNT &&
  array.every(row => row.length === LEAF_COUNT_PER_ROW);

export const getPondStateAt = (
  pond: PondState,
  { x, y }: Position,
): PondLeafState => pond[y][x];

export const setPondStateAt = (
  old: PondState,
  target: Position,
  newValue:
    | Partial<PondLeafState>
    | ((old: PondLeafState, xy: Position) => Partial<PondLeafState>),
): PondState =>
  setPondStateWhere(
    old,
    (_, xy) => arePositionsEqual(xy, target),
    (oldValue, xy) =>
      typeof newValue === 'function'
        ? { ...oldValue, ...newValue(oldValue, xy) }
        : { ...oldValue, ...newValue },
  );

export const setPondStateAtEach = (
  init: PondState,
  ...updates: readonly (readonly [
    Position,
    (
      | Partial<PondLeafState>
      | ((old: PondLeafState, xy: Position) => Partial<PondLeafState>)
    ),
  ])[]
): PondState =>
  updates.reduce(
    (pond, [at, update]) => setPondStateAt(pond, at, update),
    init,
  );

export const setPondStateWhere = (
  init: PondState,
  predicate: (v: PondLeafState, xy: Position) => boolean,
  updater: (v: PondLeafState, xy: Position) => Partial<PondLeafState>,
): PondState => {
  const array: PondLeafState[][] = init.map((row, y) =>
    row.map((leaf, x) => {
      const xy = { x, y };
      /* v8 ignore if */
      if (!isPosition(xy))
        throw new Error('Unsound typing in setPondStateWhere');
      if (!predicate(leaf, xy)) return leaf;
      return { ...leaf, ...updater(leaf, xy) };
    }),
  );
  // v8 ignore if
  if (!isPondState(array)) {
    throw new Error(`Expected a PondState but got: ${JSON.stringify(array)}`);
  }
  return array;
};

export const setUnitsAt = (
  init: PondState,
  position: Position,
  updater: (u: UnitState, v: PondLeafState) => Partial<UnitState>,
): PondState => {
  const array: PondLeafState[][] = init.map((row, y) =>
    row.map((leaf, x) =>
      arePositionsEqual({ x, y }, position)
        ? {
            ...leaf,
            units: leaf.units.map(u => ({ ...u, ...updater(u, leaf) })),
          }
        : leaf,
    ),
  );
  // v8 ignore if
  if (!isPondState(array)) {
    throw new Error(`Expected a PondState but got: ${JSON.stringify(array)}`);
  }
  return array;
};

export const setAllUnits = (
  init: PondState,
  updater: (u: UnitState, v: PondLeafState) => Partial<UnitState>,
): PondState => {
  const array: PondLeafState[][] = init.map(row =>
    row.map(leaf => ({
      ...leaf,
      units: leaf.units.map(u => ({ ...u, ...updater(u, leaf) })),
    })),
  );
  // v8 ignore if
  if (!isPondState(array)) {
    throw new Error(`Expected a PondState but got: ${JSON.stringify(array)}`);
  }
  return array;
};

// If we need a getPondStateWhere, just use a double for loop
// and push matching leaves.

export const doesAnyPondLeafSatisfy = (
  pond: PondState,
  predicate: (v: PondLeafState, xy: Position) => boolean,
): boolean =>
  pond.some((row, y) =>
    row.some((leaf, x) => {
      const xy = { x, y };
      return isPosition(xy) && predicate(leaf, xy);
    }),
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
  [Player.South]: { x: 1, y: LAST_ROW },
} as const;
