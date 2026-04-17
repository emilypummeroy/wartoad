import { screen, within, render, fireEvent } from '@testing-library/react';

import { CardBack, Froglet, LilyPad } from './Card';

describe(CardBack, () => {
  beforeEach(() => {
    render(<CardBack />);
  });

  it('should be a card with an icon which does nothing if clicked', () => {
    const card = screen.getByRole('region', { name: 'Card back' });
    const icon = within(card).getByRole('img');
    fireEvent.click(icon);
    expect(screen.getByRole('region', { name: 'Card back' })).toBeVisible();
  });
});
describe(Froglet, () => {
  beforeEach(() => {
    render(<Froglet isOnLeaf />);
  });

  it('should be a card with an icon which does nothing if clicked', () => {
    const card = screen.getByRole('region', { name: /Froglet/ });
    const icon = within(card).getByRole('img', { name: /unit/ });
    fireEvent.click(icon);
    expect(screen.getByRole('region', { name: /Froglet/ })).toBeVisible();
  });
});

describe(LilyPad, () => {
  beforeEach(() => {
    render(<LilyPad isLeaf />);
  });

  it('should be a card with an icon which does nothing if clicked', () => {
    const card = screen.getByRole('region', { name: /Lily Pad/ });
    const icon = within(card).getByRole('img');
    fireEvent.click(icon);
    expect(screen.getByRole('region', { name: /Lily Pad/ })).toBeVisible();
  });
});
