import { screen, render, within, fireEvent } from '@testing-library/react';

import {
  Grid,
  GridState,
  INITIAL_GRID,
  FIELD_COUNT_PER_ROW,
  ROW_COUNT_PER_PLAYER,
  ROW_COUNT,
  HOME,
} from './Grid';
import { Phase, Player, Subphase } from './PhaseTracker';
import type { ZoneState } from './Zone';

const UPGRADED = { units: [], isUpgraded: true };
const EMPTY = { units: [], isUpgraded: false };

const ANOTHER_GRID: GridState = [
  [UPGRADED, EMPTY, EMPTY],
  [UPGRADED, UPGRADED, UPGRADED],
  [EMPTY, UPGRADED, UPGRADED],
  [EMPTY, EMPTY, EMPTY],
  [UPGRADED, UPGRADED, EMPTY],
  [EMPTY, EMPTY, UPGRADED],
];

const EMPTY_GRID: GridState = [
  [EMPTY, EMPTY, EMPTY],
  [EMPTY, EMPTY, EMPTY],
  [EMPTY, EMPTY, EMPTY],
  [EMPTY, EMPTY, EMPTY],
  [EMPTY, EMPTY, EMPTY],
  [EMPTY, EMPTY, EMPTY],
];

const FULL_GRID: GridState = [
  [UPGRADED, UPGRADED, UPGRADED],
  [UPGRADED, UPGRADED, UPGRADED],
  [UPGRADED, UPGRADED, UPGRADED],
  [UPGRADED, UPGRADED, UPGRADED],
  [UPGRADED, UPGRADED, UPGRADED],
  [UPGRADED, UPGRADED, UPGRADED],
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
  const getHomeRow = (player: Player) =>
    player === Player.North
      ? screen.getAllByRole('row')[HOME[Player.North].y]
      : screen.getAllByRole('row')[HOME[Player.South].y];
  const getNonHomeRows = (player: Player) =>
    player === Player.North
      ? screen.getAllByRole('row').slice(HOME[Player.North].y + 1)
      : screen.getAllByRole('row').slice(0, HOME[Player.South].y);

  describe.for<[name: string, GridState]>([
    ['INITIAL_GRID_STATE', INITIAL_GRID],
    ['FULL_GRID', FULL_GRID],
    ['EMPTY_GRID', EMPTY_GRID],
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
        const fullName = new RegExp(`${player} (controlled|Home) Lily Pad`);
        const zones = within(screen.getAllByRole('row')[rowY]).getAllByRole(
          'region',
        );
        for (let x = 0; x < zones.length; x += 1) {
          expect(zones[x]).toHaveAccessibleName(
            grid[rowY][x].isUpgraded ? fullName : emptyName,
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
              subphase: Subphase.Upgrading,
            }}
            grid={FULL_GRID}
          />,
        );
      });

      it('should not display any clickable zones', () => {
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
        const zones = screen.getAllByRole('gridcell');
        for (const zone of zones) {
          expect(zone).not.toHaveAccessibleName(/Upgrade/);
          fireEvent.click(zone);
        }
        expect(handlePlaceCard).not.toHaveBeenCalled();
      });
    },
  );

  describe.for<[Player, shouldReverse: boolean]>([
    [Player.North, false],
    [Player.South, true],
  ])("during %s's Main phase in an empty grid", ([player, shouldReverse]) => {
    const badRowsName = shouldReverse ? 'first' : 'last';
    const goodRowsName = shouldReverse ? 'last' : 'first';

    describe(`when ${player} is Upgrading`, () => {
      beforeEach(() => {
        render(
          <Grid
            onPlaceCard={handlePlaceCard}
            flow={{
              phase: Phase.Main,
              player,
              subphase: Subphase.Upgrading,
            }}
            grid={EMPTY_GRID}
          />,
        );
      });

      it(`should display ${FIELD_COUNT_PER_ROW} clickable leaves in the ${goodRowsName} rows`, () => {
        for (const row of getPlayerRows(player)) {
          const buttons = within(row).getAllByRole('button');
          expect(buttons).toHaveLength(FIELD_COUNT_PER_ROW);

          for (const button of buttons) {
            fireEvent.click(button);
            expect(button).toHaveAccessibleName(/Upgrade/);

            expect(handlePlaceCard).toHaveBeenCalledOnce();
            handlePlaceCard.mockReset();
          }
          const zones = within(row).getAllByRole('gridcell');
          expect(zones).toHaveLength(FIELD_COUNT_PER_ROW);
          for (const zone of zones) {
            fireEvent.click(zone);
            expect(zone).toHaveAccessibleName(
              `Upgrade ${player} controlled leaf`,
            );

            expect(handlePlaceCard).toHaveBeenCalledOnce();
            handlePlaceCard.mockReset();
          }
        }
      });

      it(`should not display clickable leaves in the ${badRowsName} rows`, () => {
        for (const row of getOpponentRows(player)) {
          const zones = within(row).getAllByRole('gridcell');
          expect(within(row).queryByRole('button')).not.toBeInTheDocument();
          expect(zones).toHaveLength(FIELD_COUNT_PER_ROW);

          for (const zone of zones) {
            expect(zone).not.toHaveAccessibleName(/Upgrade/);
            fireEvent.click(zone);
          }
        }
        expect(handlePlaceCard).not.toHaveBeenCalled();
      });
    });

    describe(`when ${player} is Deploying`, () => {
      beforeEach(() => {
        render(
          <Grid
            onPlaceCard={handlePlaceCard}
            flow={{
              phase: Phase.Main,
              player,
              subphase: Subphase.Deploying,
            }}
            grid={EMPTY_GRID}
          />,
        );
      });

      it(`should display ${FIELD_COUNT_PER_ROW} clickable leaves in the single ${goodRowsName} row`, () => {
        const row = getHomeRow(player);
        const buttons = within(row).getAllByRole('button');
        expect(buttons).toHaveLength(FIELD_COUNT_PER_ROW);
        for (const button of buttons) {
          fireEvent.click(button);
          expect(button).toHaveAccessibleName(/Deploy on/);
          expect(handlePlaceCard).toHaveBeenCalledOnce();
          handlePlaceCard.mockReset();
        }

        const zones = within(row).getAllByRole('gridcell');
        expect(zones).toHaveLength(FIELD_COUNT_PER_ROW);
        for (const zone of zones) {
          fireEvent.click(zone);
          expect(zone).toHaveAccessibleName(
            `Deploy on ${player} controlled leaf`,
          );
          expect(handlePlaceCard).toHaveBeenCalledOnce();
          handlePlaceCard.mockReset();
        }
      });

      it(`should not display clickable leaves in the ${badRowsName} rows`, () => {
        for (const row of getNonHomeRows(player)) {
          const zones = within(row).getAllByRole('gridcell');
          expect(within(row).queryByRole('button')).not.toBeInTheDocument();
          expect(zones).toHaveLength(FIELD_COUNT_PER_ROW);

          for (const zone of zones) {
            expect(zone).not.toHaveAccessibleName(/Deploy on/);
            fireEvent.click(zone);
          }
        }
        expect(handlePlaceCard).not.toHaveBeenCalled();
      });
    });
  });
});

describe('the GridState type functions', () => {
  describe('GridState.setAt', () => {
    describe.for<
      [string, valueToSet: ZoneState, ReadonlyArray<ReadonlyArray<ZoneState>>]
    >([
      ['INITIAL_GRID_STATE', UPGRADED, INITIAL_GRID],
      ['INITIAL_GRID_STATE', EMPTY, INITIAL_GRID],
      ['ANOTHER_GRID_STATE', UPGRADED, ANOTHER_GRID],
      ['ANOTHER_GRID_STATE', EMPTY, ANOTHER_GRID],
      ['FULL_GRID_STATE', UPGRADED, FULL_GRID],
      ['FULL_GRID_STATE', EMPTY, FULL_GRID],
      ['EMPTY_GRID_STATE', UPGRADED, EMPTY_GRID],
      ['EMPTY_GRID_STATE', EMPTY, EMPTY_GRID],
    ])('with known GridState: %s | new value: %s', ([_, valueToSet, grid]) => {
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
          const newGrid = GridState.setAt(grid, { x, y }, valueToSet);

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

        it(`should set the value at x=${x}, y=${y} to ${JSON.stringify(valueToSet)}`, () => {
          const newGrid = GridState.setAt(grid, { x, y }, valueToSet);
          expect(newGrid[y][x]).toBe(valueToSet);
        });
      });
    });
  });

  describe('GridState.is', () => {
    describe.for<[string, ReadonlyArray<ReadonlyArray<ZoneState>>]>([
      ['INITIAL_GRID_STATE', INITIAL_GRID],
      ['ANOTHER_GRID_STATE', ANOTHER_GRID],
      ['FULL_GRID_STATE', FULL_GRID],
      ['EMPTY_GRID_STATE', EMPTY_GRID],
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
        expect(GridState.is([...array, INITIAL_GRID[0]])).toBe(false);
      });

      it(`should not verify ${name} with an extra value in a row`, () => {
        for (let i = 0; i < array.length; i += 1) {
          expect(
            GridState.is([
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
