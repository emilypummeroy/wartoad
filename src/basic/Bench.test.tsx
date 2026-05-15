import { render, screen, within } from '@testing-library/react';

import { renderWithGameContext } from '@/context/GameContext.test-utils';
import { draw } from '@/state-types/card.test-utils';
import { gameflowOf } from '@/state/test-utils';
import { CardClass } from '@/types/card';
import { Phase, Player, PLAYER_AFTER } from '@/types/gameflow';

import { Bench } from './Bench';

const { South, North } = Player;
const { Start, Main, End, GameOver, Upgrading, Deploying, Activating } = Phase;

type Input = [Player, Phase, northSize: number, southSize: number, northFunds: number, southFunds: number];
describe(Bench, () => {
  describe('without context', () => {
    beforeEach(() => {
      render(<Bench />);
    });

    it('should show the heading for each player hand', () => {
      expect(screen.getByText('North')).toBeVisible();
      expect(screen.getByText('South')).toBeVisible();
    });

    it('should not show a picked card', () => {
      expect(screen.queryByText('Picked card')).not.toBeInTheDocument();
    });

    it('should show 5 funds', () => {
      expect(screen.getAllByText('Funds: 5')).toHaveLength(2);
    });
  });

  describe.for<Input>([
    [North, Start, 0, 0, 0, 0],
    [South, Main, 1, 1, 1, 1],
    [North, Main, 5, 5, 5, 5],
    [South, End, 1, 0, 0, 2],
    [North, GameOver, 0, 1, 2, 0],
    [South, Upgrading, 1, 1, 1, 0],
    [North, Deploying, 2, 2, 0, 1],
    [South, Activating, 0, 0, 1, 1],
  ])('during %s %s | handsizes are (north: %s, south: %s) | funds are (north: %s, south: %s)', input => {
    const [player, , northHand, southHand, northFunds, southFunds] = input;
    const opponent = PLAYER_AFTER[player];
    const playerHand = player === North ? northHand : southHand;
    const opponentHand = player === South ? northHand : southHand;

    beforeEach_render_the_bench_with_context(input);

    it(`should show ${opponentHand} cards in the ${opponent} hand`, () => {
      const hand = screen.getByRole('region', { name: opponent });
      expect(hand).toBeVisible();
      const list = within(hand).getByRole('list');
      expect(list).toBeVisible();
      expect(within(list).queryAllByRole('region')).toHaveLength(opponentHand);
    });

    it(`should show ${playerHand} cards in the ${player} hand`, () => {
      const hand = screen.getByRole('region', { name: player });
      expect(hand).toBeVisible();
      const list = within(hand).getByRole('list');
      expect(list).toBeVisible();
      expect(within(list).queryAllByRole('region')).toHaveLength(playerHand);
    });

    it(`should show ${northFunds} funds for ${North}`, () => {
      const hand = screen.getByRole('region', { name: North });
      expect(within(hand).getByText(`Funds: ${northFunds}`));
    });

    it(`should show ${southFunds} funds for ${South}`, () => {
      const hand = screen.getByRole('region', { name: South });
      expect(within(hand).getByText(`Funds: ${southFunds}`));
    });
  });
});

const beforeEach_render_the_bench_with_context = ([
  player,
  phase,
  northHand,
  southHand,
  northFunds,
  southFunds,
]: Input) =>
  beforeEach(() => {
    renderWithGameContext([
      {
        ...gameflowOf(player, phase),
        northHand: Array.from({ length: northHand }, () => draw(CardClass.Froglet)(North)),
        southHand: Array.from({ length: southHand }, () => draw(CardClass.Froglet)(South)),
        northFunds,
        southFunds,
      },
    ])(<Bench />);
  });
