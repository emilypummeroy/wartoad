import { screen, within, render, fireEvent } from '@testing-library/react';

import { draw } from '../state-types/card.test-utils';
import { CardClass, type CardState, type CardKey } from '../types/card';
import { Phase, Player } from '../types/gameflow';
import { Hand, classForHand, INITIAL_HAND_SIZE, SMALL_HAND_SIZE, BIG_HAND_HAND_SIZE } from './Hand';

const MANY = 15;

const cards = (length: number, cardClass: CardClass): CardState[] => Array.from({ length }, draw(cardClass));

describe(classForHand, () => {
  describe.for([CardClass.Froglet.key, CardClass.LilyPad.key])('with a hand full of %s', cardKey => {
    const cardClass = CardClass[cardKey];
    it('should return an empty string for an initial hand', () => {
      expect(classForHand(cards(INITIAL_HAND_SIZE, cardClass))).toBe('');
    });

    it('should return an empty string for an initial hand plus one draw', () => {
      expect(classForHand(cards(INITIAL_HAND_SIZE + 1, cardClass))).toBe('');
    });

    it('should return an empty string for low card counts', () => {
      for (let i = 0; i <= SMALL_HAND_SIZE; i += 1) {
        expect(classForHand(cards(i, cardClass))).toBe('');
      }
    });

    it("should return 'compact' for medium card counts", () => {
      for (let i = SMALL_HAND_SIZE + 1; i <= BIG_HAND_HAND_SIZE; i += 1) {
        expect(classForHand(cards(i, cardClass))).toBe('compact');
      }
    });

    it("should return 'super-compact' for high card counts", () => {
      for (let i = BIG_HAND_HAND_SIZE + 1; i < BIG_HAND_HAND_SIZE + MANY; i += 1) {
        expect(classForHand(cards(i, cardClass))).toBe('super-compact');
      }
    });
  });
});

describe(Hand, () => {
  // Pairwise combinations
  describe.each<[number, Player, CardKey]>([
    [1, Player.North, CardClass.Froglet.key],
    [1, Player.South, CardClass.LilyPad.key],
    [INITIAL_HAND_SIZE, Player.South, CardClass.Froglet.key],
    [INITIAL_HAND_SIZE, Player.North, CardClass.LilyPad.key],
  ])('With %i cards for %s player | cardKey: %s', (handSize, player, cardKey) => {
    const cardClass = CardClass[cardKey];

    const hand = cards(handSize, cardClass);
    const withinHand = () => within(screen.getByRole('region', { name: player }));

    const pickCard = vi.fn<(_: CardState) => void>();

    describe.for([0, 1, MANY])(`during the ${player} Main phase with %s funds`, funds => {
      beforeEach(() => {
        render(
          <Hand player={player} funds={funds} handCards={hand} phase={Phase.Main} isPlayerTurn onPick={pickCard} />,
        );
      });

      it(`should show ${handSize} cards for ${player}`, () => {
        expect(
          withinHand().getAllByRole('region', {
            name: cardClass.name,
          }),
        ).toHaveLength(handSize);
        expect(withinHand().queryByRole('region', { name: 'Card back' })).not.toBeInTheDocument();
      });

      it(`should show ${funds} funds for ${player}`, () => {
        expect(withinHand().queryByText(`Funds: ${funds}`)).toBeVisible();
      });

      it(`should allow ${cardClass.name}s to be picked during the ${player} Main phase `, () => {
        const clickableCards = withinHand().getAllByRole('button', {
          name: `Pick ${cardClass.name}`,
        });
        for (let i = 0; i < clickableCards.length; i += 1) {
          fireEvent.click(clickableCards[i]);
          expect(pickCard).toHaveBeenCalledExactlyOnceWith(hand[i]);
          pickCard.mockClear();
        }
      });

      it(`should allow all cards to be picked during the ${player} Main phase`, () => {
        const clickableCards = withinHand().getAllByRole('button');
        for (const card of clickableCards) {
          fireEvent.click(card);
          expect(pickCard).toHaveBeenCalledOnce();
          pickCard.mockClear();
        }
      });
    });

    describe.for<[Phase, number]>([
      [Phase.Start, 0],
      [Phase.End, 1],
      [Phase.GameOver, MANY],
      [Phase.Upgrading, 2],
      [Phase.Deploying, 3],
      [Phase.Activating, MANY],
    ])(`during the ${player} non-Main phase with %s funds`, ([phase, funds]) => {
      beforeEach(() => {
        render(<Hand player={player} funds={funds} handCards={hand} phase={phase} isPlayerTurn onPick={pickCard} />);
      });
      it(`should show ${handSize} cards for ${player}`, () => {
        expect(
          withinHand().getAllByRole('region', {
            name: cardClass.name,
          }),
        ).toHaveLength(handSize);
        expect(withinHand().queryByRole('region', { name: 'Card back' })).not.toBeInTheDocument();
      });

      it(`should show ${funds} funds for ${player}`, () => {
        expect(withinHand().queryByText(`Funds: ${funds}`)).toBeVisible();
      });

      it(`should not allow cards to be picked during the ${player} non-Main phase`, () => {
        const clickableCards = withinHand().queryAllByRole('button');
        for (const card of clickableCards) {
          fireEvent.click(card);
        }
        expect(pickCard).not.toHaveBeenCalled();
      });
    });

    describe.for<[Phase, number]>([
      [Phase.Start, 0],
      [Phase.Main, 1],
      [Phase.Upgrading, MANY],
      [Phase.Deploying, 2],
      [Phase.Activating, MANY],
      [Phase.End, 3],
      [Phase.GameOver, 0],
    ])(`during the opponent's %s phase`, ([phase, funds]) => {
      beforeEach(() => {
        render(
          <Hand
            player={player}
            handCards={cards(handSize, cardClass)}
            phase={phase}
            funds={funds}
            isPlayerTurn={false}
            onPick={pickCard}
          />,
        );
      });

      it(`should show ${handSize} card backs`, () => {
        expect(withinHand().queryByRole('region', { description: 'Card face' })).not.toBeInTheDocument();
        expect(withinHand().getAllByRole('region', { name: 'Card back' })).toHaveLength(handSize);
      });

      it('should not allow cards to be picked', () => {
        const clickableCards = withinHand().queryAllByRole('button');
        for (const card of clickableCards) {
          fireEvent.click(card);
          expect(pickCard).not.toHaveBeenCalled();
        }
      });
    });
  });
});
