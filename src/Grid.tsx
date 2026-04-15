import { Player, type FlowState } from './PhaseTracker';
import { Zone } from './Zone';

export const ROW_COUNT = 6 as const;
export const ROW_COUNT_PER_PLAYER = 3 as const;
export const FIELD_COUNT_PER_ROW = 3 as const;

export type Position = {
  readonly x: number;
  readonly y: number;
};

export const Position = {
  equals: ({ x: x1, y: y1 }: Position, { x: x2, y: y2 }: Position) =>
    x1 === x2 && y1 === y2,

  HOME: {
    [Player.North]: { x: 1, y: 0 },
    [Player.South]: { x: 1, y: ROW_COUNT - 1 },
  },
};

export type GridState = readonly [
  readonly [boolean, boolean, boolean],
  readonly [boolean, boolean, boolean],
  readonly [boolean, boolean, boolean],
  readonly [boolean, boolean, boolean],
  readonly [boolean, boolean, boolean],
  readonly [boolean, boolean, boolean],
];

export const INITIAL_GRID: GridState = [
  [false, true, false],
  [false, false, false],
  [false, false, false],
  [false, false, false],
  [false, false, false],
  [false, true, false],
];

export const GridState = {
  is: (array: ReadonlyArray<ReadonlyArray<boolean>>): array is GridState =>
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

export type GridProps = Readonly<{
  grid: GridState;
  flow: FlowState;
  onPlaceCard: (position: Position) => void;
}>;
export function Grid({ grid, flow, onPlaceCard }: GridProps) {
  const children = (x: number, y: number) => (
    <Zone
      controller={y < ROW_COUNT_PER_PLAYER ? Player.North : Player.South}
      flow={flow}
      position={{ x, y }}
      units={[]} // TODO 8: Wire up units for each zone
      isUpgraded={grid[y][x]}
      onPlace={onPlaceCard}
    />
  );
  return (
    <div role="grid">
      <div className="zonerow" role="row">
        {children(0, 0)}
        {children(1, 0)}
        {children(2, 0)}
      </div>
      <div className="zonerow" role="row">
        {children(0, 1)}
        {children(1, 1)}
        {children(2, 1)}
      </div>
      <div className="zonerow" role="row">
        {children(0, 2)}
        {children(1, 2)}
        {children(2, 2)}
      </div>
      <div className="zonerow" role="row">
        {children(0, 3)}
        {children(1, 3)}
        {children(2, 3)}
      </div>
      <div className="zonerow" role="row">
        {children(0, 4)}
        {children(1, 4)}
        {children(2, 4)}
      </div>
      <div className="zonerow" role="row">
        {children(0, 5)}
        {children(1, 5)}
        {children(2, 5)}
      </div>
    </div>
  );
}
