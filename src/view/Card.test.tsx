import { screen, within, render } from '@testing-library/react';

import { createLeaf } from '@/state-types/card';
import { CardClass, CardLocation } from '@/types/card';
import { Player } from '@/types/gameflow';
import { counter } from '@/types/test-utils';

import { CardBack, Froglet, LeafCard } from './Card';

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

    it(`should be shown as an exhausted ${player} unit if it is exhausted on a leaf`, () => {
      render(<Froglet player={player} isOnLeaf isExhausted />);
      const card = screen.getByRole('region', {
        name: `exhausted ${player} unit Froglet`,
      });
      expect(card).toBeVisible();
      expect(within(card).getByRole('img', { name: `exhausted ${player} unit` })).toBeVisible();
    });
  });
});

describe(LeafCard, () => {
  describe.for<Player>([Player.North, Player.South])('when belonging to %s', owner => {
    const leaf = createLeaf({ cardClass: CardClass.LilyPad, owner, key: counter() });
    it('should have LilyPad cost in Hand | home: %s', () => {
      render(<LeafCard leaf={leaf} location={CardLocation.Hand} />);
      const card = screen.getByRole('region', { name: 'Lily Pad' });
      expect(card).toBeVisible();
      expect(within(card).getByRole('group', { name: /Cost/ })).toHaveTextContent(`${CardClass.LilyPad.stats.gives}`);
    });

    it(`should be shown as ${owner} controlled if it is a leaf but not home`, () => {
      render(<LeafCard leaf={leaf} location={CardLocation.Pond} />);
      const card = screen.getByRole('region', {
        name: `${owner} controlled Lily Pad`,
      });
      expect(card).toBeVisible();
      expect(within(card).getByRole('img', { name: `${owner} controlled` })).toBeVisible();
    });

    it(`should be shown as ${owner} Home if it is a home leaf`, () => {
      render(<LeafCard leaf={leaf} location={CardLocation.Home} />);
      const card = screen.getByRole('region', {
        name: `${owner} Home Lily Pad`,
      });
      expect(card).toBeVisible();
      expect(within(card).getByRole('img', { name: `${owner} Home` })).toBeVisible();
    });
  });
});
