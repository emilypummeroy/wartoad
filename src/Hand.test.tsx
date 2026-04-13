import { screen, within, render, fireEvent } from '@testing-library/react';

import {
  Hand,
  classForHandSize,
  INITIAL_HAND_CARD_COUNT,
  SMALL_HAND_CARD_COUNT,
  BIG_HAND_CARD_COUNT,
} from './Hand';
import { Phase, Player } from './PhaseTracker';

const MANY = 15;

describe(classForHandSize, () => {
  it('should return an empty string for an initial hand', () => {
    expect(classForHandSize(INITIAL_HAND_CARD_COUNT)).toBe('');
  });

  it('should return an empty string for an initial hand plus one drawn card', () => {
    expect(classForHandSize(INITIAL_HAND_CARD_COUNT + 1)).toBe('');
  });

  it('should return an empty string for low card counts', () => {
    for (let i = 0; i <= SMALL_HAND_CARD_COUNT; i += 1) {
      expect(classForHandSize(i)).toBe('');
    }
  });

  it("should return 'compact' for medium card counts", () => {
    for (let i = SMALL_HAND_CARD_COUNT + 1; i <= BIG_HAND_CARD_COUNT; i += 1) {
      expect(classForHandSize(i)).toBe('compact');
    }
  });

  it("should return 'super-compact' for high card counts", () => {
    for (
      let i = BIG_HAND_CARD_COUNT + 1;
      i < BIG_HAND_CARD_COUNT + MANY;
      i += 1
    ) {
      expect(classForHandSize(i)).toBe('super-compact');
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

    describe.for<[Phase, isPlacing: boolean, hasFroglet: boolean]>([
      [Phase.Start, true, true],
      [Phase.Main, true, true],
      [Phase.End, false, true],
      [Phase.Start, true, false],
      [Phase.Main, false, false],
      [Phase.End, false, false],
    ])(
      `during the ${player} %s phase | placing:%s | froglet:%s`,
      ([phase, isPlacing, hasFroglet]) => {
        it(`should render with ${handSize} cards for ${player}`, () => {
          render(
            <Hand
              player={player}
              handSize={handSize}
              isPlacing={isPlacing}
              hasFroglet={hasFroglet}
              isMainPhase={phase === Phase.Main}
              isPlayerTurn
              onPick={pickCard}
            />,
          );
          expect(
            withinHand().getAllByRole('region', { name: /Card face of/ }),
          ).toHaveLength(handSize);
          expect(
            withinHand().queryByRole('region', { name: 'Card back' }),
          ).not.toBeInTheDocument();
        });
      },
    );

    it.for<[name: string, hasFroglet: boolean, isFroglet: boolean]>([
      // TODO 8: Fill in these cases when hasFroglet becomes cards
      ['Lily Pad', handSize > 1, false],
      ['Lily Pad', false, false],
      ['Froglet', true, true],
    ])(
      `should allow %ss to be picked during the ${player} Main phase | hasFroglet=%s`,
      ([name, hasFroglet, isFroglet]) => {
        render(
          <Hand
            player={player}
            handSize={handSize}
            isPlacing={false}
            hasFroglet={hasFroglet}
            isMainPhase
            isPlayerTurn
            onPick={pickCard}
          />,
        );
        const clickableCards = withinHand().getAllByRole('button', {
          name: `Pick ${name}`,
        });
        for (const card of clickableCards) {
          fireEvent.click(card);
          expect(pickCard).toHaveBeenCalledExactlyOnceWith(isFroglet);
          pickCard.mockClear();
        }
      },
    );

    it(`should allow all cards to be picked during the ${player} Main phase`, () => {
      render(
        <Hand
          player={player}
          handSize={handSize}
          isPlacing={false}
          isMainPhase
          isPlayerTurn
          onPick={pickCard}
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
          onPick={pickCard}
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
          onPick={pickCard}
        />,
      );
      const clickableCards = withinHand().queryAllByRole('button');
      for (const card of clickableCards) {
        fireEvent.click(card);
      }
      expect(pickCard).not.toHaveBeenCalled();
    });

    describe.for<[Phase, isPlacing: boolean, hasFroglet: boolean]>([
      [Phase.Start, true, true],
      [Phase.Main, false, true],
      [Phase.End, false, true],
      [Phase.Start, true, false],
      [Phase.Main, true, false],
      [Phase.End, false, false],
    ])(
      `during the opponent's %s phase (placing:%s)`,
      ([phase, isPlacing, hasFroglet]) => {
        it(`should show ${handSize} card backs`, () => {
          render(
            <Hand
              player={player}
              handSize={handSize}
              isPlacing={isPlacing}
              hasFroglet={hasFroglet}
              isMainPhase={phase === Phase.Main}
              isPlayerTurn={false}
              onPick={pickCard}
            />,
          );
          expect(
            withinHand().queryByRole('region', { name: /Card face of/ }),
          ).not.toBeInTheDocument();
          expect(
            withinHand().getAllByRole('region', { name: 'Card back' }),
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
              onPick={pickCard}
            />,
          );
          const clickableCards = withinHand().queryAllByRole('button');
          for (const card of clickableCards) {
            fireEvent.click(card);
            expect(pickCard).not.toHaveBeenCalled();
          }
        });
      },
    );
  });
});
