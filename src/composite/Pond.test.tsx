import { screen, render, within } from '@testing-library/react';

import { renderWithGameContext } from '../context/GameContext.test-utils';
import {
  LEAF_COUNT_PER_ROW,
  HOME,
  ROW_COUNT,
  ROW_COUNT_PER_PLAYER,
  type PondState,
  getPondStateAt,
} from '../state-types/pond';
import { TestPondKey, TEST_PONDS_BY_KEY } from '../state-types/pond.test-utils';
import { activationOf, gameflowOf } from '../state/test-utils';
import type { Read } from '../types';
import { Phase, Player, PLAYER_AFTER, Subphase } from '../types/gameflow';
import type { Position } from '../types/position';
import { Pond } from './Pond';

const { North, South } = Player;
const { Start, Main, End } = Phase;
const { Idle, Deploying, Upgrading, Activating } = Subphase;
const { INITIAL_POND, FULL_POND, EMPTY_POND, ANOTHER_POND, UNITS_POND } = TestPondKey;

type Input = [turn: Player, Phase, Subphase, TestPondKey];

// 6x3 grid: Always
// But this is a slightly slow test, so don't do it in every describe block,
const it_should_have_a_6x3_grid_with_leaves = () => {
  it(`should display a grid with ${ROW_COUNT} rows of ${LEAF_COUNT_PER_ROW} leaves`, () => {
    expect(screen.getByRole('grid')).toBeVisible();
    const rows = within(screen.getByRole('grid')).getAllByRole('row');
    expect(rows).toHaveLength(ROW_COUNT);

    for (const row of rows) {
      const zones = within(row).getAllByRole('gridcell');
      expect(zones).toHaveLength(LEAF_COUNT_PER_ROW);
      for (const zone of zones) {
        expect(within(zone).getByRole('region', { name: /Lily Pad|leaf/ })).toBeVisible();
      }
    }
  });
};

// South rows and North rows: Always
// But this is a slightly slow test, so don't do it in every describe block,
const it_should_have_the_right_controlling_player_and_leaves_in_each_row = (pond: Read<PondState>) => {
  it.for<[Player, number]>([
    [North, 0],
    [South, ROW_COUNT_PER_PLAYER],
  ])(
    `should display %s controlled leaves and Lily Pads ${ROW_COUNT_PER_PLAYER} rows from row %s`,
    ([controller, firstY]) => {
      const rows = screen.getAllByRole('row');
      for (let y = firstY; y < firstY + ROW_COUNT_PER_PLAYER; y += 1) {
        const zones = within(rows[y]).getAllByRole('gridcell', { name: new RegExp(controller) });
        expect(zones).toHaveLength(LEAF_COUNT_PER_ROW);
        for (let x = 0; x < zones.length; x += 1) {
          const name = pond[y][x].isUpgraded ? /Lily Pad/ : /leaf/;
          expect(within(zones[x]).getByRole('region', { name })).toBeVisible();
        }
      }
    },
  );
};

describe(Pond, () => {
  const getPlayerRows = (player: Player) =>
    player === North
      ? screen.getAllByRole('row').slice(0, ROW_COUNT_PER_PLAYER)
      : screen.getAllByRole('row').slice(ROW_COUNT_PER_PLAYER);
  const getOpponentRows = (player: Player) =>
    player === North
      ? screen.getAllByRole('row').slice(ROW_COUNT_PER_PLAYER)
      : screen.getAllByRole('row').slice(0, ROW_COUNT_PER_PLAYER);
  const getHomeRow = (player: Player) =>
    player === North ? screen.getAllByRole('row')[HOME[North].y] : screen.getAllByRole('row')[HOME[South].y];
  const getNonHomeRows = (player: Player) =>
    player === North
      ? screen.getAllByRole('row').slice(HOME[North].y + 1)
      : screen.getAllByRole('row').slice(0, HOME[South].y);

  // Without context: default state
  describe('without context', () => {
    beforeEach(() => render(<Pond />));
    it_should_have_a_6x3_grid_with_leaves();
    it_should_have_the_right_controlling_player_and_leaves_in_each_row(TEST_PONDS_BY_KEY[INITIAL_POND]);
  });

  // No dropzones:
  describe.for<Input>([
    // | Start phase
    [North, Start, Idle, INITIAL_POND],
    // | End phase
    [South, End, Idle, INITIAL_POND],
    // | Upgrading & full pond
    [North, Main, Upgrading, FULL_POND],
    [South, Main, Upgrading, FULL_POND],
    // Deploying always has the home row
    // Activating always has move-in-place

    // | Idle
    [North, Main, Idle, INITIAL_POND],
    [North, Main, Idle, FULL_POND],
    [North, Main, Idle, UNITS_POND],
    [South, Main, Idle, EMPTY_POND],
    [South, Main, Idle, UNITS_POND],
  ])('on %s turn %s phase while %s | in pond: %s', ([player, phase, subphase, pondKey]) => {
    const pond = TEST_PONDS_BY_KEY[pondKey];
    beforeEach(() => {
      renderWithGameContext([{ ...gameflowOf(player, subphase, phase), pond }])(<Pond />);
    });
    it_should_have_a_6x3_grid_with_leaves();
    it_should_have_the_right_controlling_player_and_leaves_in_each_row(pond);

    it('should not have any dropzones', () => {
      expect(screen.queryByRole('button', { name: /Upgrade|Deploy|Move/ })).not.toBeInTheDocument();
      expect(screen.queryByRole('gridcell', { name: /Upgrade|Deploy|Move/ })).not.toBeInTheDocument();
    });
  });

  describe.for<Input>([
    // After some leaves are captured
    [South, Main, Idle, ANOTHER_POND],
    [North, Main, Idle, ANOTHER_POND],
  ])('on %s turn %s phase while %s | in pond: %s', ([player, phase, subphase, pondKey]) => {
    const pond = TEST_PONDS_BY_KEY[pondKey];
    beforeEach(() => {
      renderWithGameContext([{ ...gameflowOf(player, subphase, phase), pond }])(<Pond />);
    });
    it_should_have_a_6x3_grid_with_leaves();

    it(`should display the correctly controlled leaves and Lily Pads`, () => {
      const rows = screen.getAllByRole('row');
      for (let y = 0; y < ROW_COUNT; y += 1) {
        const zones = within(rows[y]).getAllByRole('gridcell');
        expect(zones).toHaveLength(LEAF_COUNT_PER_ROW);
        for (let x = 0; x < zones.length; x += 1) {
          const { controller } = getPondStateAt(pond, { x, y });
          const leafName = pond[y][x].isUpgraded ? 'Lily Pad' : 'leaf';
          expect(
            within(zones[x]).getByRole('region', { name: new RegExp(`${controller} (controlled|Home) ${leafName}`) }),
          ).toBeVisible();
        }
      }
    });

    it('should not have any dropzones', () => {
      expect(screen.queryByRole('button', { name: /Upgrade|Deploy|Move/ })).not.toBeInTheDocument();
      expect(screen.queryByRole('gridcell', { name: /Upgrade|Deploy|Move/ })).not.toBeInTheDocument();
    });
  });

  // Upgrade dropzones in player-controlled leaves: Upgrading & empty pond
  describe.for<Input>([
    [North, Main, Upgrading, EMPTY_POND],
    [South, Main, Upgrading, EMPTY_POND],
  ])('on %s turn %s phase while %s | in pond: %s', ([player, phase, subphase, pondKey]) => {
    const opponent = PLAYER_AFTER[player];
    const pond = TEST_PONDS_BY_KEY[pondKey];
    beforeEach(() => {
      renderWithGameContext([{ ...gameflowOf(player, subphase, phase), pond }])(<Pond />);
    });

    it(`should display ${LEAF_COUNT_PER_ROW} clickable leaves in the ${player} rows`, () => {
      for (const row of getPlayerRows(player)) {
        const buttons = within(row).getAllByRole('button');
        expect(buttons).toHaveLength(LEAF_COUNT_PER_ROW);

        for (const button of buttons) {
          expect(button).toHaveAccessibleName(/Upgrade/);
        }
        const zones = within(row).getAllByRole('gridcell');
        expect(zones).toHaveLength(LEAF_COUNT_PER_ROW);
        for (const zone of zones) expect(within(zone).queryByRole('button', { name: /Upgrade/ })).toBeVisible();
      }
    });

    it(`should not display clickable leaves in the ${opponent} rows`, () => {
      for (const row of getOpponentRows(player)) {
        const zones = within(row).getAllByRole('gridcell');
        expect(within(row).queryByRole('button')).not.toBeInTheDocument();
        expect(zones).toHaveLength(LEAF_COUNT_PER_ROW);

        for (const zone of zones) expect(zone).not.toHaveAccessibleName(/Deploy|Upgrade|Move/);
      }
    });
  });

  // Deploy dropzones in home row: Deploying & any pond
  describe.for<Input>([
    [North, Main, Deploying, INITIAL_POND],
    [North, Main, Deploying, FULL_POND],
    [South, Main, Deploying, ANOTHER_POND],
    [South, Main, Deploying, EMPTY_POND],
  ])('on %s turn %s phase while %s | in pond: %s', ([player, phase, subphase, pondKey]) => {
    const opponent = PLAYER_AFTER[player];
    const pond = TEST_PONDS_BY_KEY[pondKey];
    beforeEach(() => {
      renderWithGameContext([{ ...gameflowOf(player, subphase, phase), pond }])(<Pond />);
    });

    it(`should display ${LEAF_COUNT_PER_ROW} Deploy dropzones in the ${player} home row`, () => {
      const row = getHomeRow(player);
      const buttons = within(row).getAllByRole('button', { name: /Deploy on/ });
      expect(buttons).toHaveLength(LEAF_COUNT_PER_ROW);
    });

    it(`should not display clickable leaves in the 5 ${opponent} rows`, () => {
      for (const row of getNonHomeRows(player)) {
        expect(within(row).queryByRole('button')).not.toBeInTheDocument();

        const zones = within(row).getAllByRole('gridcell');
        expect(zones).toHaveLength(LEAF_COUNT_PER_ROW);
        for (const zone of zones) expect(zone).not.toHaveAccessibleName(/Deploy|Upgrade|Move/);
      }
    });
  });

  // Four Move dropzones: Activating from middle column near centre
  const MIDDLE_COLUMN = { x: 1, y: 3 };
  const ANOTHER_POSITION = { x: 1, y: 2 };
  describe.for<[...Input, Position]>([
    [North, Main, Activating, INITIAL_POND, MIDDLE_COLUMN],
    [South, Main, Activating, FULL_POND, ANOTHER_POSITION],
  ])(
    'on %s turn %s phase while %s | in pond: %s | activation started at %s',
    ([player, phase, subphase, pondKey, start]) => {
      const pond = TEST_PONDS_BY_KEY[pondKey];
      beforeEach(() => {
        renderWithGameContext([{ ...gameflowOf(player, subphase, phase), ...activationOf(start), pond }])(<Pond />);
      });

      const CARDINAL_DIRECTIONS = 4;
      it(`should display ${CARDINAL_DIRECTIONS + 1} Move dropzones including moving in place`, () => {
        const buttons = screen.getAllByRole('button', { name: /Move to/ });
        expect(buttons).toHaveLength(CARDINAL_DIRECTIONS + 1);
      });
    },
  );
});
