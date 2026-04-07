import { screen, within, render, fireEvent } from '@testing-library/react';

import { Phase, Player } from './App';
import {
  Hand,
  styleForHandSize,
  INITIAL_HAND_CARD_COUNT,
  BIG_HAND_CARD_COUNT,
} from './Hand';

const MANY = 15;

describe(styleForHandSize, () => {
  it('should return an empty string for low card counts', () => {
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

  it("should return 'super-compact' for high card counts", () => {
    for (
      let i = BIG_HAND_CARD_COUNT + 1;
      i < BIG_HAND_CARD_COUNT + MANY;
      i += 1
    ) {
      expect(styleForHandSize(i)).toBe('super-compact');
    }
  });
});

describe(Hand, () => {
  describe.each<[number, Player]>([
    [1, Player.North],
    [INITIAL_HAND_CARD_COUNT, Player.South],
    [INITIAL_HAND_CARD_COUNT + 1, Player.North],
    [BIG_HAND_CARD_COUNT, Player.South],
    [BIG_HAND_CARD_COUNT + 1, Player.North],
    [BIG_HAND_CARD_COUNT * 2, Player.South],
  ])('With %i cards for %s player', (handSize, player) => {
    const withinHand = () =>
      within(screen.getByRole('region', { name: `${player} hand` }));

    const pickCard = vi.fn<() => void>();

    describe.for<[Phase, boolean]>([
      [Phase.Start, true],
      [Phase.Main, false],
      [Phase.Main, true],
      [Phase.End, false],
    ])(`during the ${player} %s phase (placing:%s)`, ([phase, isPlacing]) => {
      it(`should render with ${handSize} cards for ${player}`, () => {
        render(
          <Hand
            player={player}
            handSize={handSize}
            isPlacing={isPlacing}
            isMainPhase={phase === Phase.Main}
            isPlayerTurn
            pickCard={pickCard}
          />,
        );
        expect(
          withinHand().getAllByRole('region', { name: 'Basic Field' }),
        ).toHaveLength(handSize);
        expect(
          withinHand().queryByRole('region', { name: 'Facedown Card' }),
        ).not.toBeInTheDocument();
      });
    });

    it(`should allow cards to be picked during the ${player} Main phase`, () => {
      render(
        <Hand
          player={player}
          handSize={handSize}
          isPlacing={false}
          isMainPhase
          isPlayerTurn
          pickCard={pickCard}
        />,
      );
      const clickableCards = withinHand().getAllByRole('button');
      for (const card of clickableCards) {
        fireEvent.click(card);
        expect(pickCard).toHaveBeenCalledOnce();
        pickCard.mockClear();
      }
    });

    it(`should not allow cards to be picked during the ${player} non-Main phase`, () => {
      render(
        <Hand
          player={player}
          handSize={handSize}
          isPlacing={false}
          isMainPhase={false}
          isPlayerTurn
          pickCard={pickCard}
        />,
      );
      const clickableCards = withinHand().queryAllByRole('button');
      for (const card of clickableCards) {
        fireEvent.click(card);
      }
      expect(pickCard).not.toHaveBeenCalled();
    });

    it(`should not allow cards to be picked during the ${player} Main phase while placing a card`, () => {
      render(
        <Hand
          player={player}
          handSize={handSize}
          isPlacing
          isMainPhase
          isPlayerTurn
          pickCard={pickCard}
        />,
      );
      const clickableCards = withinHand().queryAllByRole('button');
      for (const card of clickableCards) {
        fireEvent.click(card);
      }
      expect(pickCard).not.toHaveBeenCalled();
    });

    describe.for<[Phase, boolean]>([
      [Phase.Start, true],
      [Phase.Main, false],
      [Phase.Main, true],
      [Phase.End, false],
    ])(`during the opponent's %s phase (placing:%s)`, ([phase, isPlacing]) => {
      it(`should show ${handSize} card backs`, () => {
        render(
          <Hand
            player={player}
            handSize={handSize}
            isPlacing={isPlacing}
            isMainPhase={phase === Phase.Main}
            isPlayerTurn={false}
            pickCard={pickCard}
          />,
        );
        expect(
          withinHand().queryByRole('region', { name: 'Basic Field' }),
        ).not.toBeInTheDocument();
        expect(
          withinHand().getAllByRole('region', { name: 'Facedown card' }),
        ).toHaveLength(handSize);
      });

      it('should not allow cards to be picked', () => {
        render(
          <Hand
            player={player}
            handSize={handSize}
            isPlacing={isPlacing}
            isMainPhase={phase === Phase.Main}
            isPlayerTurn={false}
            pickCard={pickCard}
          />,
        );
        const clickableCards = withinHand().queryAllByRole('button');
        for (const card of clickableCards) {
          fireEvent.click(card);
          expect(pickCard).not.toHaveBeenCalled();
        }
      });
    });
  });
});
