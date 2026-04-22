import { screen, within, render } from '@testing-library/react';

import { Player } from '../types/gameflow';
import { CardBack, Froglet, LilyPad } from './Card';

describe(CardBack, () => {
  beforeEach(() => {});

  describe.for<Player>([Player.North, Player.South])('when belonging to %s', player => {
    it('should be a simple card back if it is not a leaf', () => {
      render(<CardBack player={player} />);
      const card = screen.getByRole('region', { name: 'Card back' });
      expect(card).toBeVisible();
      expect(within(card).getByRole('img', { name: 'Card back' })).toBeVisible();
    });

    it(`should be shown as a ${player} controlled leaf if it is a leaf`, () => {
      render(<CardBack player={player} isLeaf />);
      const card = screen.getByRole('region', {
        name: `${player} controlled leaf`,
      });
      expect(card).toBeVisible();
      expect(within(card).getByRole('img', { name: `${player} controlled leaf` })).toBeVisible();
    });
  });
});

describe(Froglet, () => {
  describe.for<Player>([Player.North, Player.South])('when belonging to %s', player => {
    it('should have Froglet cost if not on a leaf', () => {
      render(<Froglet player={player} />);
      const card = screen.getByRole('region', { name: 'Froglet' });
      expect(card).toBeVisible();
      expect(within(card).getByRole('group', { name: /Cost/ })).toHaveTextContent(/0/);
    });

    it(`should be shown as a ${player} unit if it is on a leaf`, () => {
      render(<Froglet player={player} isOnLeaf />);
      const card = screen.getByRole('region', {
        name: `${player} unit Froglet`,
      });
      expect(card).toBeVisible();
      expect(within(card).getByRole('img', { name: `${player} unit` })).toBeVisible();
    });
  });

  describe.for<[Player, isOnLeaf?: boolean, string?]>([
    [Player.North, true, 'id'],
    [Player.North, false],
    [Player.North],
    [Player.South, true],
    [Player.South, false, 'id'],
    [Player.South],
  ])('basic cases | player: %s | isOnLeaf: %s | id: "%s"', ([player, isOnLeaf, id]) => {
    it('should have Froglet stats', () => {
      render(<Froglet player={player} isOnLeaf={isOnLeaf} nameId={id} />);
      const card = screen.getByRole('region', {
        name: /Froglet/,
      });
      expect(within(card).getByRole('group', { name: 'Stats' })).toHaveTextContent('0 Power 0 Range 1 Speed 1 Life');
    });
  });
});

describe(LilyPad, () => {
  describe.for<Player>([Player.North, Player.South])('when belonging to %s', player => {
    it.for([true, false, undefined])(
      // TODO 14: do something about isHome && !isLeaf
      'should have LilyPad cost if not a leaf | home: %s',
      isHome => {
        render(<LilyPad player={player} isHome={isHome} />);
        const card = screen.getByRole('region', { name: 'Lily Pad' });
        expect(card).toBeVisible();
        expect(within(card).getByRole('group', { name: /Cost/ })).toHaveTextContent(/0/);
      },
    );

    it(`should be shown as ${player} controlled if it is a leaf but not home`, () => {
      render(<LilyPad player={player} isLeaf />);
      const card = screen.getByRole('region', {
        name: `${player} controlled Lily Pad`,
      });
      expect(card).toBeVisible();
      expect(within(card).getByRole('img', { name: `${player} controlled` })).toBeVisible();
    });

    it(`should be shown as ${player} Home if it is a home leaf`, () => {
      render(<LilyPad player={player} isLeaf isHome />);
      const card = screen.getByRole('region', {
        name: `${player} Home Lily Pad`,
      });
      expect(card).toBeVisible();
      expect(within(card).getByRole('img', { name: `${player} Home` })).toBeVisible();
    });
  });

  describe.for<[Player, isLeaf?: boolean, isHome?: boolean, string?]>([
    [Player.North, true, true, 'id'],
    [Player.North, true, false],
    [Player.North, true],
    [Player.North, false, false, 'id'],
    [Player.North, false],
    [Player.North],
    [Player.South, true, true],
    [Player.South, true, false, 'id'],
    [Player.South, true],
    [Player.South, false, false, 'id'],
    [Player.South, false],
    [Player.South],
  ])('basic cases | player: %s | isLeaf: %s | id: "%s"', ([player, isLeaf, isHome, id]) => {
    it('should have Lily Pad stats', () => {
      render(<LilyPad player={player} isLeaf={isLeaf} isHome={isHome} nameId={id} />);
      const card = screen.getByRole('region', {
        name: /Lily Pad/,
      });
      expect(within(card).getByRole('group', { name: 'Gives' })).toHaveTextContent(/0/);
    });
  });
});
