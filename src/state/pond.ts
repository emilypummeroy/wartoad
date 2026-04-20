import type { UnitCard } from '../types/card';
import { Player } from '../types/gameflow';
import type { Position } from '../types/position';

export type PondState = readonly [
  readonly [ZoneState, ZoneState, ZoneState],
  readonly [ZoneState, ZoneState, ZoneState],
  readonly [ZoneState, ZoneState, ZoneState],
  readonly [ZoneState, ZoneState, ZoneState],
  readonly [ZoneState, ZoneState, ZoneState],
  readonly [ZoneState, ZoneState, ZoneState],
];

export type ZoneState = Readonly<{
  units: readonly UnitCard[];
  isUpgraded: boolean;
  // TODO 10: Controller in ZoneState
}>;

export const isPondState = (
  array: ReadonlyArray<ReadonlyArray<ZoneState>>,
): array is PondState =>
  array.length === ROW_COUNT &&
  array.every(row => row.length === LEAF_COUNT_PER_RANK);

export const setPondStateAt = (
  old: PondState,
  { x, y }: Position,
  newValue: ZoneState,
): PondState => {
  const array = old.map((row, yy) =>
    row.map((oldValue, xx) => (yy === y && xx === x ? newValue : oldValue)),
  );
  // v8 ignore if
  if (!isPondState(array)) {
    throw new Error(`Expected a PondState but got: ${JSON.stringify(array)}`);
  }
  return array;
};

export const ROW_COUNT = 6 as const;
export const ROW_COUNT_PER_PLAYER = 3 as const;
export const LEAF_COUNT_PER_RANK = 3 as const;

export const UPGRADED = { units: [], isUpgraded: true };
export const EMPTY = { units: [], isUpgraded: false };
export const INITIAL_POND: PondState = [
  [EMPTY, UPGRADED, EMPTY],
  [EMPTY, EMPTY, EMPTY],
  [EMPTY, EMPTY, EMPTY],
  [EMPTY, EMPTY, EMPTY],
  [EMPTY, EMPTY, EMPTY],
  [EMPTY, UPGRADED, EMPTY],
];

export const HOME = {
  [Player.North]: { x: 1, y: 0 },
  [Player.South]: { x: 1, y: ROW_COUNT - 1 },
};

export const ANOTHER_GRID: PondState = [
  [UPGRADED, EMPTY, EMPTY],
  [UPGRADED, UPGRADED, UPGRADED],
  [EMPTY, UPGRADED, UPGRADED],
  [EMPTY, EMPTY, EMPTY],
  [UPGRADED, UPGRADED, EMPTY],
  [EMPTY, EMPTY, UPGRADED],
];

export const EMPTY_GRID: PondState = [
  [EMPTY, EMPTY, EMPTY],
  [EMPTY, EMPTY, EMPTY],
  [EMPTY, EMPTY, EMPTY],
  [EMPTY, EMPTY, EMPTY],
  [EMPTY, EMPTY, EMPTY],
  [EMPTY, EMPTY, EMPTY],
];

export const FULL_GRID: PondState = [
  [UPGRADED, UPGRADED, UPGRADED],
  [UPGRADED, UPGRADED, UPGRADED],
  [UPGRADED, UPGRADED, UPGRADED],
  [UPGRADED, UPGRADED, UPGRADED],
  [UPGRADED, UPGRADED, UPGRADED],
  [UPGRADED, UPGRADED, UPGRADED],
];
