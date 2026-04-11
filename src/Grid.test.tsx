import { screen, render, within, fireEvent } from '@testing-library/react';

import {
  Grid,
  GridState,
  INITIAL_GRID,
  FIELD_COUNT_PER_ROW,
  ROW_COUNT_PER_PLAYER,
  ROW_COUNT,
} from './Grid';
import { Phase, Player, Subphase } from './PhaseTracker';

const ANOTHER_GRID: GridState = [
  [true, false, false],
  [true, true, true],
  [false, true, true],
  [false, false, false],
  [true, true, false],
  [false, false, true],
];

const EMPTY_GRID: GridState = [
  [false, false, false],
  [false, false, false],
  [false, false, false],
  [false, false, false],
  [false, false, false],
  [false, false, false],
];

const FULL_GRID: GridState = [
  [true, true, true],
  [true, true, true],
  [true, true, true],
  [true, true, true],
  [true, true, true],
  [true, true, true],
];

describe(Grid, () => {
  const handlePlaceCard = vi.fn<() => void>();
  const getPlayerRows = (player: Player) =>
    player === Player.North
      ? screen.getAllByRole('row').slice(0, ROW_COUNT_PER_PLAYER)
      : screen.getAllByRole('row').slice(ROW_COUNT_PER_PLAYER);
  const getOpponentRows = (player: Player) =>
    player === Player.North
      ? screen.getAllByRole('row').slice(ROW_COUNT_PER_PLAYER)
      : screen.getAllByRole('row').slice(0, ROW_COUNT_PER_PLAYER);

  describe.for<[name: string, GridState]>([
    ['INITIAL_GRID_STATE', INITIAL_GRID],
    ['EMPTY_GRID', EMPTY_GRID],
    ['FULL_GRID', FULL_GRID],
    ['ANOTHER_GRID', ANOTHER_GRID],
  ])('with the grid: %s', ([_, grid]) => {
    beforeEach(() => {
      render(
        <Grid
          onPlaceCard={handlePlaceCard}
          flow={{
            phase: Phase.Main,
            player: Player.North,
            subphase: Subphase.Idle,
          }}
          grid={grid}
        />,
      );
    });

    it(`should display a grid with ${ROW_COUNT} rows of ${FIELD_COUNT_PER_ROW} leaves`, () => {
      expect(screen.getByRole('grid')).toBeVisible();

      const rows = within(screen.getByRole('grid')).getAllByRole('row');
      expect(rows).toHaveLength(ROW_COUNT);

      for (const row of rows) {
        expect(within(row).getAllByRole('region')).toHaveLength(
          FIELD_COUNT_PER_ROW,
        );
      }
    });

    it.for<[Player, rowY: number]>([
      [Player.North, 0],
      [Player.North, 1],
      [Player.North, 2],
      [Player.South, 3],
      [Player.South, 4],
      [Player.South, 5],
    ])(
      'should display %s controlled leaves in the %sth row',
      ([player, rowY]) => {
        const emptyName = new RegExp(`${player} controlled leaf`);
        const fullName = new RegExp(`${player} (owned)|(Home) Lily Pad`);
        const zones = within(screen.getAllByRole('row')[rowY]).getAllByRole(
          'region',
        );
        for (let x = 0; x < zones.length; x += 1) {
          expect(zones[x]).toHaveAccessibleName(
            grid[rowY][x] ? fullName : emptyName,
          );
        }
      },
    );
  });

  describe.for<Player>([Player.North, Player.South])(
    'when placing a %s card in a full grid',
    player => {
      beforeEach(() => {
        render(
          <Grid
            onPlaceCard={handlePlaceCard}
            flow={{
              phase: Phase.Main,
              player,
              subphase: Subphase.Placing,
            }}
            grid={FULL_GRID}
          />,
        );
      });

      it('should not display any clickable leaves', () => {
        const buttons = screen.getAllByRole('button');
        for (const button of buttons) {
          expect(button).not.toHaveAccessibleName(/Place on/);
          fireEvent.click(button);
        }
        expect(handlePlaceCard).not.toHaveBeenCalled();
      });
    },
  );

  describe.for<[Player, shouldReverse: boolean]>([
    [Player.North, false],
    [Player.South, true],
  ])('when placing a %s card in an empty grid', ([player, shouldReverse]) => {
    const opponentRowsAt = shouldReverse ? 'first' : 'last';
    const playerRowsAt = shouldReverse ? 'last' : 'first';

    beforeEach(() => {
      render(
        <Grid
          onPlaceCard={handlePlaceCard}
          flow={{
            phase: Phase.Main,
            player,
            subphase: Subphase.Placing,
          }}
          grid={EMPTY_GRID}
        />,
      );
    });

    it(`should display ${FIELD_COUNT_PER_ROW} clickable leaves in the ${playerRowsAt} rows`, () => {
      for (const row of getPlayerRows(player)) {
        const buttons = within(row).getAllByRole('button');
        expect(buttons).toHaveLength(FIELD_COUNT_PER_ROW);

        for (const button of buttons) {
          fireEvent.click(button);
          expect(button).toHaveAccessibleName(
            `Place on ${player} controlled leaf`,
          );

          expect(handlePlaceCard).toHaveBeenCalledOnce();
          handlePlaceCard.mockReset();
        }
      }
    });

    it(`should not display clickable leaves in the ${opponentRowsAt} rows`, () => {
      for (const row of getOpponentRows(player)) {
        const buttons = within(row).getAllByRole('button');
        expect(buttons).toHaveLength(FIELD_COUNT_PER_ROW);

        for (const button of buttons) {
          expect(button).not.toHaveAccessibleName(/Place on/);
          fireEvent.click(button);
        }
      }
      expect(handlePlaceCard).not.toHaveBeenCalled();
    });
  });
});

describe('the GridState type functions', () => {
  describe('GridState.setAt', () => {
    describe.for<[string, boolean, readonly (readonly boolean[])[]]>([
      ['INITIAL_GRID_STATE', true, INITIAL_GRID],
      ['INITIAL_GRID_STATE', false, INITIAL_GRID],
      ['ANOTHER_GRID_STATE', true, ANOTHER_GRID],
      ['ANOTHER_GRID_STATE', false, ANOTHER_GRID],
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
      ['INITIAL_GRID_STATE', INITIAL_GRID],
      ['ANOTHER_GRID_STATE', ANOTHER_GRID],
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
