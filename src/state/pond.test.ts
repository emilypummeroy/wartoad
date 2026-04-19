import {
  ANOTHER_GRID,
  EMPTY,
  EMPTY_GRID,
  FULL_GRID,
  INITIAL_POND,
  isPondState,
  LEAF_COUNT_PER_RANK,
  ROW_COUNT,
  setPondStateAt,
  UPGRADED,
  type PondState,
  type ZoneState,
} from './pond';

describe('the PondState type functions', () => {
  describe(setPondStateAt, () => {
    describe.for<
      [string, valueToSet: ZoneState, ReadonlyArray<ReadonlyArray<ZoneState>>]
    >([
      ['INITIAL_GRID_STATE', UPGRADED, INITIAL_POND],
      ['INITIAL_GRID_STATE', EMPTY, INITIAL_POND],
      ['ANOTHER_GRID_STATE', UPGRADED, ANOTHER_GRID],
      ['ANOTHER_GRID_STATE', EMPTY, ANOTHER_GRID],
      ['FULL_GRID_STATE', UPGRADED, FULL_GRID],
      ['FULL_GRID_STATE', EMPTY, FULL_GRID],
      ['EMPTY_GRID_STATE', UPGRADED, EMPTY_GRID],
      ['EMPTY_GRID_STATE', EMPTY, EMPTY_GRID],
    ])('with known GridState: %s | new value: %s', ([_, valueToSet, grid]) => {
      if (!isPondState(grid)) {
        expect.unreachable();
        return;
      }
      grid satisfies PondState;

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
          const newGrid = setPondStateAt(grid, { x, y }, valueToSet);

          for (let yy = 0; yy < y; yy += 1) {
            for (let xx = 0; xx < x; xx += 1) {
              expect(newGrid[yy][xx]).toBe(grid[yy][xx]);
            }
            for (let xx = x + 1; xx < LEAF_COUNT_PER_RANK; xx += 1) {
              expect(newGrid[yy][xx]).toBe(grid[yy][xx]);
            }
          }

          for (let yy = y + 1; yy < ROW_COUNT; yy += 1) {
            for (let xx = 0; xx < x; xx += 1) {
              expect(newGrid[yy][xx]).toBe(grid[yy][xx]);
            }
            for (let xx = x + 1; xx < LEAF_COUNT_PER_RANK; xx += 1) {
              expect(newGrid[yy][xx]).toBe(grid[yy][xx]);
            }
          }
        });

        it(`should set the value at x=${x}, y=${y} to ${JSON.stringify(valueToSet)}`, () => {
          const newGrid = setPondStateAt(grid, { x, y }, valueToSet);
          expect(newGrid[y][x]).toBe(valueToSet);
        });
      });
    });
  });

  describe(isPondState, () => {
    describe.for<[string, ReadonlyArray<ReadonlyArray<ZoneState>>]>([
      ['INITIAL_GRID_STATE', INITIAL_POND],
      ['ANOTHER_GRID_STATE', ANOTHER_GRID],
      ['FULL_GRID_STATE', FULL_GRID],
      ['EMPTY_GRID_STATE', EMPTY_GRID],
    ])('with known GridState: %s', ([name, array]) => {
      it(`should verify ${name}`, () => {
        expect(isPondState(array)).toBe(true);
        if (isPondState(array)) {
          array satisfies PondState;
        } else expect.unreachable();
      });

      it(`should verify ${name} reversed`, () => {
        const reversed = array.toReversed();
        expect(isPondState(reversed)).toBe(true);
        if (isPondState(reversed)) {
          reversed satisfies PondState;
        } else expect.unreachable();
      });

      it(`should verify ${name} with rows reversed`, () => {
        const reversed = array.map(x => x.toReversed());
        expect(isPondState(reversed)).toBe(true);
        if (isPondState(reversed)) {
          reversed satisfies PondState;
        } else expect.unreachable();
      });

      const PRIME = 83;

      it(`should verify ${name} shuffled`, () => {
        const shuffled = array.map((_, i) => array[(i * PRIME) % array.length]);
        expect(isPondState(shuffled)).toBe(true);
        if (isPondState(shuffled)) {
          shuffled satisfies PondState;
        } else expect.unreachable();
      });

      it(`should verify ${name} with rows shuffled`, () => {
        const shuffled = array.map(row =>
          row.map((_, i) => row[(i * PRIME) % row.length]),
        );
        expect(isPondState(shuffled)).toBe(true);
        if (isPondState(shuffled)) {
          shuffled satisfies PondState;
        } else expect.unreachable();
      });

      it(`should not verify ${name} with an extra row`, () => {
        expect(isPondState([...array, INITIAL_POND[0]])).toBe(false);
      });

      it(`should not verify ${name} with an extra value in a row`, () => {
        for (let i = 0; i < array.length; i += 1) {
          expect(
            isPondState([
              ...array.slice(0, i),
              [...array[i], EMPTY],
              ...array.slice(i + 1),
            ]),
          ).toBe(false);
        }
      });
    });
  });
});
