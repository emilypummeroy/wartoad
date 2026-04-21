import { screen, render, within, fireEvent } from '@testing-library/react';

import {
  gameflowOf,
  renderWithGameContext,
} from '../context/GameContext.test-utils';
import {
  LEAF_COUNT_PER_RANK,
  HOME,
  ROW_COUNT,
  ROW_COUNT_PER_PLAYER,
  type PondState,
  INITIAL_POND,
} from '../state/pond';
import { FULL_POND, EMPTY_POND, ANOTHER_POND } from '../state/pond.test-utils';
import { Player, Subphase } from '../types/gameflow';
import { Pond } from './Pond';

const { Deploying, Upgrading } = Subphase;

describe(Pond, () => {
  const handleCardPlaced = vi.fn<() => void>();
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

  it.for<[name: string, PondState]>([
    ['INITIAL_GRID_STATE', INITIAL_POND],
    ['FULL_GRID', FULL_POND],
    ['EMPTY_GRID', EMPTY_POND],
    ['ANOTHER_GRID', ANOTHER_POND],
  ])(
    `without context should display a grid with ${ROW_COUNT} rows of ${LEAF_COUNT_PER_RANK} leaves`,
    ([_, grid]) => {
      render(<Pond grid={grid} onCardPlaced={handleCardPlaced} />);

      expect(screen.getByRole('grid')).toBeVisible();

      const rows = within(screen.getByRole('grid')).getAllByRole('row');
      expect(rows).toHaveLength(ROW_COUNT);

      for (const row of rows) {
        expect(within(row).getAllByRole('region')).toHaveLength(
          LEAF_COUNT_PER_RANK,
        );
      }
    },
  );

  describe.for<[Player, name: string, PondState]>([
    [Player.North, 'INITIAL_GRID_STATE', INITIAL_POND],
    [Player.North, 'FULL_GRID', FULL_POND],
    [Player.North, 'EMPTY_GRID', EMPTY_POND],
    [Player.North, 'ANOTHER_GRID', ANOTHER_POND],
    [Player.South, 'INITIAL_GRID_STATE', INITIAL_POND],
    [Player.South, 'FULL_GRID', FULL_POND],
    [Player.South, 'EMPTY_GRID', EMPTY_POND],
    [Player.South, 'ANOTHER_GRID', ANOTHER_POND],
  ])('on the %s turn with the grid: %s', ([player, _, grid]) => {
    beforeEach(() => {
      renderWithGameContext([gameflowOf([player])])(
        <Pond onCardPlaced={handleCardPlaced} grid={grid} />,
      );
    });

    it(`should display a grid with ${ROW_COUNT} rows of ${LEAF_COUNT_PER_RANK} leaves`, () => {
      expect(screen.getByRole('grid')).toBeVisible();

      const rows = within(screen.getByRole('grid')).getAllByRole('row');
      expect(rows).toHaveLength(ROW_COUNT);

      for (const row of rows) {
        expect(within(row).getAllByRole('region')).toHaveLength(
          LEAF_COUNT_PER_RANK,
        );
      }
    });

    it.for<[rowController: Player, rowY: number]>([
      [Player.North, 0],
      [Player.North, 1],
      [Player.North, 2],
      [Player.South, 3],
      [Player.South, 4],
      [Player.South, 5],
    ])(
      'should display %s controlled leaves in the %sth row',
      ([controller, rowY]) => {
        const emptyName = new RegExp(`${controller} controlled leaf`);
        const fullName = new RegExp(`${controller} (controlled|Home) Lily Pad`);
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
    'when %s is Upgrading in a full grid',
    player => {
      beforeEach(() => {
        renderWithGameContext([gameflowOf([player, Upgrading])])(
          <Pond onCardPlaced={handleCardPlaced} grid={FULL_POND} />,
        );
      });

      it('should not display any clickable zones', () => {
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
        const zones = screen.getAllByRole('gridcell');
        for (const zone of zones) {
          expect(zone).not.toHaveAccessibleName(/Upgrade/);
          fireEvent.click(zone);
        }
        expect(handleCardPlaced).not.toHaveBeenCalled();
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
        renderWithGameContext([gameflowOf([player, Upgrading])])(
          <Pond onCardPlaced={handleCardPlaced} grid={EMPTY_POND} />,
        );
      });

      it(`should display ${LEAF_COUNT_PER_RANK} clickable leaves in the ${goodRowsName} rows`, () => {
        for (const row of getPlayerRows(player)) {
          const buttons = within(row).getAllByRole('button');
          expect(buttons).toHaveLength(LEAF_COUNT_PER_RANK);

          for (const button of buttons) {
            fireEvent.click(button);
            expect(button).toHaveAccessibleName(/Upgrade/);

            expect(handleCardPlaced).toHaveBeenCalledOnce();
            handleCardPlaced.mockReset();
          }
          const zones = within(row).getAllByRole('gridcell');
          expect(zones).toHaveLength(LEAF_COUNT_PER_RANK);
          for (const zone of zones) {
            fireEvent.click(zone);
            expect(zone).toHaveAccessibleName(
              `Upgrade ${player} controlled leaf`,
            );

            expect(handleCardPlaced).toHaveBeenCalledOnce();
            handleCardPlaced.mockReset();
          }
        }
      });

      it(`should not display clickable leaves in the ${badRowsName} rows`, () => {
        for (const row of getOpponentRows(player)) {
          const zones = within(row).getAllByRole('gridcell');
          expect(within(row).queryByRole('button')).not.toBeInTheDocument();
          expect(zones).toHaveLength(LEAF_COUNT_PER_RANK);

          for (const zone of zones) {
            expect(zone).not.toHaveAccessibleName(/Upgrade/);
            fireEvent.click(zone);
          }
        }
        expect(handleCardPlaced).not.toHaveBeenCalled();
      });
    });

    describe(`when ${player} is Deploying`, () => {
      beforeEach(() => {
        renderWithGameContext([gameflowOf([player, Deploying])])(
          <Pond onCardPlaced={handleCardPlaced} grid={EMPTY_POND} />,
        );
      });

      it(`should display ${LEAF_COUNT_PER_RANK} clickable leaves in the single ${goodRowsName} row`, () => {
        const row = getHomeRow(player);
        const buttons = within(row).getAllByRole('button');
        expect(buttons).toHaveLength(LEAF_COUNT_PER_RANK);
        for (const button of buttons) {
          fireEvent.click(button);
          expect(button).toHaveAccessibleName(/Deploy on/);
          expect(handleCardPlaced).toHaveBeenCalledOnce();
          handleCardPlaced.mockReset();
        }

        const zones = within(row).getAllByRole('gridcell');
        expect(zones).toHaveLength(LEAF_COUNT_PER_RANK);
        for (const zone of zones) {
          fireEvent.click(zone);
          expect(zone).toHaveAccessibleName(
            `Deploy on ${player} controlled leaf`,
          );
          expect(handleCardPlaced).toHaveBeenCalledOnce();
          handleCardPlaced.mockReset();
        }
      });

      it(`should not display clickable leaves in the ${badRowsName} rows`, () => {
        for (const row of getNonHomeRows(player)) {
          const zones = within(row).getAllByRole('gridcell');
          expect(within(row).queryByRole('button')).not.toBeInTheDocument();
          expect(zones).toHaveLength(LEAF_COUNT_PER_RANK);

          for (const zone of zones) {
            expect(zone).not.toHaveAccessibleName(/Deploy on/);
            fireEvent.click(zone);
          }
        }
        expect(handleCardPlaced).not.toHaveBeenCalled();
      });
    });
  });
});
