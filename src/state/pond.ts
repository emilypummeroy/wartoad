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
  newValue: Partial<LeafState> | ((old: LeafState) => LeafState),
): PondState => {
  const array = old.map((row, yy) =>
    row.map(
      (oldValue, xx): LeafState =>
        yy !== y || xx !== x
          ? oldValue
          : typeof newValue === 'function'
            ? newValue(oldValue)
            : { ...oldValue, ...newValue },
    ),
  );
  // v8 ignore if
  if (!isPondState(array)) {
    throw new Error(`Expected a PondState but got: ${JSON.stringify(array)}`);
  }
  return array;
};

export const ROW_COUNT = 6 as const;
export const ROW_COUNT_PER_PLAYER = 3 as const;
export const LEAF_COUNT_PER_ROW = 3 as const;

export const UPGRADED = { units: [], isUpgraded: true } as const;
export const LEAF = { units: [], isUpgraded: false } as const;
export const INITIAL_POND: PondState = [
  [LEAF, UPGRADED, LEAF],
  [LEAF, LEAF, LEAF],
  [LEAF, LEAF, LEAF],
  [LEAF, LEAF, LEAF],
  [LEAF, LEAF, LEAF],
  [LEAF, UPGRADED, LEAF],
];

export const HOME = {
  [Player.North]: { x: 1, y: 0 },
  [Player.South]: { x: 1, y: ROW_COUNT - 1 },
};
