import {
  ROW_COUNT,
  FIELD_COUNT_PER_ROW,
  GridState,
  INITIAL_GRID_STATE,
} from './Grid';

const ANOTHER_GRID_STATE: GridState = [
  [true, false, false],
  [true, true, true],
  [false, true, true],
  [false, false, false],
  [true, true, false],
  [false, false, true],
];
describe('the GridState type functions', () => {
  describe('GridState.setAt', () => {
    describe.for<[string, boolean, readonly (readonly boolean[])[]]>([
      ['INITIAL_GRID_STATE', true, INITIAL_GRID_STATE],
      ['INITIAL_GRID_STATE', false, INITIAL_GRID_STATE],
      ['ANOTHER_GRID_STATE', true, ANOTHER_GRID_STATE],
      ['ANOTHER_GRID_STATE', false, ANOTHER_GRID_STATE],
    ])('with known GridState: %s | new value: %s', ([_, newValue, grid]) => {
      // oxlint-disable-next-line no-null
      if (!GridState.is(grid)) {
        expect.unreachable();
        return;
      }
      grid satisfies GridState;

      describe.for([
        [0, 0],
        [0, 1],
        [0, 2],
        [0, 3],
        [0, 4],
        [0, 5],
        [1, 0],
        [1, 1],
        [1, 2],
        [1, 3],
        [1, 4],
        [1, 5],
        [2, 0],
        [2, 1],
        [2, 2],
        [2, 3],
        [2, 4],
        [2, 5],
      ])('when called for x=%s and y=%s', ([x, y]) => {
        it('should not change other zones', () => {
          const newGrid = GridState.setAt(grid, { x, y }, newValue);

          for (let yy = 0; yy < y; yy += 1) {
            for (let xx = 0; xx < x; xx += 1) {
              expect(newGrid[yy][xx]).toBe(grid[yy][xx]);
            }
            for (let xx = x + 1; xx < FIELD_COUNT_PER_ROW; xx += 1) {
              expect(newGrid[yy][xx]).toBe(grid[yy][xx]);
            }
          }

          for (let yy = y + 1; yy < ROW_COUNT; yy += 1) {
            for (let xx = 0; xx < x; xx += 1) {
              expect(newGrid[yy][xx]).toBe(grid[yy][xx]);
            }
            for (let xx = x + 1; xx < FIELD_COUNT_PER_ROW; xx += 1) {
              expect(newGrid[yy][xx]).toBe(grid[yy][xx]);
            }
          }
        });

        it(`should set the value at x=${x}, y=${y} to ${newValue}`, () => {
          const newGrid = GridState.setAt(grid, { x, y }, newValue);
          expect(newGrid[y][x]).toBe(newValue);
        });
      });
    });
  });

  describe('GridState.is', () => {
    describe.for<[string, readonly (readonly boolean[])[]]>([
      ['INITIAL_GRID_STATE', INITIAL_GRID_STATE],
      ['ANOTHER_GRID_STATE', ANOTHER_GRID_STATE],
    ])('with known GridState: %s', ([name, array]) => {
      it(`should verify ${name}`, () => {
        expect(GridState.is(array)).toBe(true);
        if (GridState.is(array)) {
          array satisfies GridState;
        } else expect.unreachable();
      });

      it(`should verify ${name} reversed`, () => {
        const reversed = array.toReversed();
        expect(GridState.is(reversed)).toBe(true);
        if (GridState.is(reversed)) {
          reversed satisfies GridState;
        } else expect.unreachable();
      });

      it(`should verify ${name} with rows reversed`, () => {
        const reversed = array.map(x => x.toReversed());
        expect(GridState.is(reversed)).toBe(true);
        if (GridState.is(reversed)) {
          reversed satisfies GridState;
        } else expect.unreachable();
      });

      const PRIME = 83;

      it(`should verify ${name} shuffled`, () => {
        const shuffled = array.map((_, i) => array[(i * PRIME) % array.length]);
        expect(GridState.is(shuffled)).toBe(true);
        if (GridState.is(shuffled)) {
          shuffled satisfies GridState;
        } else expect.unreachable();
      });

      it(`should verify ${name} with rows shuffled`, () => {
        const shuffled = array.map(row =>
          row.map((_, i) => row[(i * PRIME) % row.length]),
        );
        expect(GridState.is(shuffled)).toBe(true);
        if (GridState.is(shuffled)) {
          shuffled satisfies GridState;
        } else expect.unreachable();
      });

      it(`should not verify ${name} with an extra row`, () => {
        expect(GridState.is([...array, [false, false, false]])).toBe(false);
      });

      it(`should not verify ${name} with an extra value in a row`, () => {
        for (let i = 0; i < array.length; i += 1) {
          expect(
            GridState.is([
              ...array.slice(0, i),
              [...array[i], false],
              ...array.slice(i + 1),
            ]),
          ).toBe(false);
        }
      });
    });
  });
});
