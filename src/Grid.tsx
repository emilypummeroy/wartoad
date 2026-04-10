export type Position = {
  readonly x: number;
  readonly y: number;
};

export const Position = {
  equals: ({ x: x1, y: y1 }: Position, { x: x2, y: y2 }: Position) =>
    x1 === x2 && y1 === y2,
};

export const ROW_COUNT = 6 as const;
export const ROW_COUNT_PER_PLAYER = 3 as const;
export const FIELD_COUNT_PER_ROW = 3 as const;
export const NORTH_HOME: Position = { x: 1, y: 0 };
export const SOUTH_HOME: Position = { x: 1, y: ROW_COUNT - 1 };

export type GridState = readonly [
  readonly [boolean, boolean, boolean],
  readonly [boolean, boolean, boolean],
  readonly [boolean, boolean, boolean],
  readonly [boolean, boolean, boolean],
  readonly [boolean, boolean, boolean],
  readonly [boolean, boolean, boolean],
];

export const INITIAL_GRID_STATE: GridState = [
  [false, true, false],
  [false, false, false],
  [false, false, false],
  [false, false, false],
  [false, false, false],
  [false, true, false],
];

export const GridState = {
  is: (array: readonly (readonly boolean[])[]): array is GridState =>
    array.length === ROW_COUNT &&
    array.every(row => row.length === FIELD_COUNT_PER_ROW),

  setAt: (old: GridState, { x, y }: Position, newValue: boolean): GridState => {
    const array = old.map((row, yy) =>
      row.map((oldValue, xx) => (yy === y && xx === x ? newValue : oldValue)),
    );
    // v8 ignore next 2
    if (!GridState.is(array)) {
      throw new Error(`Expected a GridState but got: ${String(array)}`);
    }
    return array;
  },
};
