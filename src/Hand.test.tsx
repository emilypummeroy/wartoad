import { screen, within, render } from '@testing-library/react';

import { Player } from './App';
import {
  Hand,
  styleForHandSize,
  INITIAL_HAND_CARD_COUNT,
  BIG_HAND_CARD_COUNT,
} from './Hand';

const MANY = 15;

describe(styleForHandSize, () => {
  it('should return an empty string for card counts', () => {
    for (let i = 0; i <= INITIAL_HAND_CARD_COUNT; i += 1) {
      expect(styleForHandSize(i)).toBe('');
    }
  });

  it("should return 'compact' for medium card counts", () => {
    for (
      let i = INITIAL_HAND_CARD_COUNT + 1;
      i <= BIG_HAND_CARD_COUNT;
      i += 1
    ) {
      expect(styleForHandSize(i)).toBe('compact');
    }
  });

  it("should return 'super-compact' for large card counts", () => {
    for (
      let i = BIG_HAND_CARD_COUNT + 1;
      i < BIG_HAND_CARD_COUNT + MANY;
      i += 1
    ) {
      expect(styleForHandSize(i)).toBe('super-compact');
    }
  });
});

const noop = () => {};

describe(Hand, () => {
  const withinHand = () =>
    within(screen.getByRole('region', { name: 'North hand' }));

  it.for<[number, Player]>([
    [0, Player.North],
    [1, Player.North],
    [INITIAL_HAND_CARD_COUNT, Player.North],
    [INITIAL_HAND_CARD_COUNT + 1, Player.North],
    [BIG_HAND_CARD_COUNT, Player.North],
    [BIG_HAND_CARD_COUNT + 1, Player.North],
  ])('should render with %i cards', ([handSize, player]) => {
    render(
      <Hand
        player={player}
        handSize={handSize}
        isMainPhase
        isPlayerTurn
        playCard={noop}
      />,
    );
    expect(withinHand().queryAllByRole('region')).toHaveLength(handSize);
  });
});
