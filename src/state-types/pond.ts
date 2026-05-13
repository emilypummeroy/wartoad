import { CardClass, type LeafClass, type UnitState } from '../types/card';
import type { DeckActions } from '../types/deck';
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
  readonly leaf: LeafClass | undefined;
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

export const makeNorthLilypad = (
  actions: Record<Player, DeckActions>,
): PondLeafState => ({
  units: [],
  leaf: actions.North.leafTutor(CardClass.LilyPad).cardClass,
  controller: Player.North,
});

export const makeNorthLeaf = (
  _: Record<Player, DeckActions>,
): PondLeafState => ({
  units: [],
  leaf: undefined,
  controller: Player.North,
});

export const makeSouthLilypad = (
  actions: Record<Player, DeckActions>,
): PondLeafState => ({
  units: [],
  leaf: actions.South.leafTutor(CardClass.LilyPad).cardClass,
  controller: Player.South,
});

export const makeSouthLeaf = (
  _: Record<Player, DeckActions>,
): PondLeafState => ({
  units: [],
  leaf: undefined,
  controller: Player.South,
});

export const makeInitialPond = (
  actions: Record<Player, DeckActions>,
): PondState => [
  [makeNorthLeaf(actions), makeNorthLilypad(actions), makeNorthLeaf(actions)],
  [makeNorthLeaf(actions), makeNorthLeaf(actions), makeNorthLeaf(actions)],
  [makeNorthLeaf(actions), makeNorthLeaf(actions), makeNorthLeaf(actions)],
  [makeSouthLeaf(actions), makeSouthLeaf(actions), makeSouthLeaf(actions)],
  [makeSouthLeaf(actions), makeSouthLeaf(actions), makeSouthLeaf(actions)],
  [makeSouthLeaf(actions), makeSouthLilypad(actions), makeSouthLeaf(actions)],
];

export const NORTH_LEAF: PondLeafState = {
  units: [],
  controller: Player.North,
  leaf: undefined,
} as const;

export const SOUTH_LEAF: PondLeafState = {
  units: [],
  controller: Player.South,
  leaf: undefined,
} as const;

export const DEFAULT_POND: PondState = [
  [NORTH_LEAF, NORTH_LEAF, NORTH_LEAF],
  [NORTH_LEAF, NORTH_LEAF, NORTH_LEAF],
  [NORTH_LEAF, NORTH_LEAF, NORTH_LEAF],
  [SOUTH_LEAF, SOUTH_LEAF, SOUTH_LEAF],
  [SOUTH_LEAF, SOUTH_LEAF, SOUTH_LEAF],
  [SOUTH_LEAF, SOUTH_LEAF, SOUTH_LEAF],
];

export const HOME = {
  [Player.North]: { x: 1, y: 0 },
  [Player.South]: { x: 1, y: LAST_ROW },
} as const;
