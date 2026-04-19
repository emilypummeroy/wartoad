import { screen, render, within, fireEvent } from '@testing-library/react';

import {
  LEAF_COUNT_PER_RANK,
  HOME,
  ROW_COUNT,
  ROW_COUNT_PER_PLAYER,
  type PondState,
  INITIAL_POND,
  FULL_GRID,
  EMPTY_GRID,
  ANOTHER_GRID,
} from '../state/pond';
import { Phase, Player, Subphase } from '../types/gameflow';
import { Pond } from './Pond';

describe(Pond, () => {
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

  describe.for<[name: string, PondState]>([
    ['INITIAL_GRID_STATE', INITIAL_POND],
    ['FULL_GRID', FULL_GRID],
    ['EMPTY_GRID', EMPTY_GRID],
    ['ANOTHER_GRID', ANOTHER_GRID],
  ])('with the grid: %s', ([_, grid]) => {
    beforeEach(() => {
      render(
        <Pond
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
          <Pond
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
          <Pond
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

      it(`should display ${LEAF_COUNT_PER_RANK} clickable leaves in the ${goodRowsName} rows`, () => {
        for (const row of getPlayerRows(player)) {
          const buttons = within(row).getAllByRole('button');
          expect(buttons).toHaveLength(LEAF_COUNT_PER_RANK);

          for (const button of buttons) {
            fireEvent.click(button);
            expect(button).toHaveAccessibleName(/Upgrade/);

            expect(handlePlaceCard).toHaveBeenCalledOnce();
            handlePlaceCard.mockReset();
          }
          const zones = within(row).getAllByRole('gridcell');
          expect(zones).toHaveLength(LEAF_COUNT_PER_RANK);
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
          expect(zones).toHaveLength(LEAF_COUNT_PER_RANK);

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
          <Pond
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

      it(`should display ${LEAF_COUNT_PER_RANK} clickable leaves in the single ${goodRowsName} row`, () => {
        const row = getHomeRow(player);
        const buttons = within(row).getAllByRole('button');
        expect(buttons).toHaveLength(LEAF_COUNT_PER_RANK);
        for (const button of buttons) {
          fireEvent.click(button);
          expect(button).toHaveAccessibleName(/Deploy on/);
          expect(handlePlaceCard).toHaveBeenCalledOnce();
          handlePlaceCard.mockReset();
        }

        const zones = within(row).getAllByRole('gridcell');
        expect(zones).toHaveLength(LEAF_COUNT_PER_RANK);
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
          expect(zones).toHaveLength(LEAF_COUNT_PER_RANK);

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
