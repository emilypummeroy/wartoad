import { screen, within, render, fireEvent } from '@testing-library/react';

import { CardClass, type CardKey } from '../types/card';
import { Phase, Player } from '../types/gameflow';
import {
  Hand,
  classForHand,
  INITIAL_HAND_SIZE,
  SMALL_HAND_SIZE,
  BIG_HAND_HAND_SIZE,
} from './Hand';

const MANY = 15;

const cards = (length: number, cardClass: CardClass): CardClass[] =>
  Array.from({ length }, () => cardClass);

describe(classForHand, () => {
  describe.for([CardClass.Froglet.key, CardClass.LilyPad.key])(
    'with a hand full of %s',
    cardKey => {
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
        for (
          let i = BIG_HAND_HAND_SIZE + 1;
          i < BIG_HAND_HAND_SIZE + MANY;
          i += 1
        ) {
          expect(classForHand(cards(i, cardClass))).toBe('super-compact');
        }
      });
    },
  );
});

describe(Hand, () => {
  // Pairwise combinations
  describe.each<[number, Player, CardKey]>([
    [1, Player.North, CardClass.Froglet.key],
    [1, Player.South, CardClass.LilyPad.key],
    [INITIAL_HAND_SIZE, Player.South, CardClass.Froglet.key],
    [INITIAL_HAND_SIZE, Player.North, CardClass.LilyPad.key],
  ])(
    'With %i cards for %s player | cardKey: %s',
    (handSize, player, cardKey) => {
      const cardClass = CardClass[cardKey];

      const withinHand = () =>
        within(screen.getByRole('region', { name: `${player} hand` }));

      const pickCard = vi.fn<(_: CardClass) => void>();

      describe.for<[Phase, isPlacing: boolean]>([
        [Phase.Start, true],
        [Phase.Main, true],
        [Phase.End, false],
        [Phase.Start, true],
        [Phase.Main, false],
        [Phase.End, false],
      ])(`during the ${player} %s phase | placing:%s`, ([phase, isPlacing]) => {
        it(`should show ${handSize} cards for ${player}`, () => {
          render(
            <Hand
              player={player}
              handCards={cards(handSize, cardClass)}
              isPlacing={isPlacing}
              isMainPhase={phase === Phase.Main}
              isPlayerTurn
              onPick={pickCard}
            />,
          );
          expect(
            withinHand().getAllByRole('region', {
              name: cardClass.name,
            }),
          ).toHaveLength(handSize);
          expect(
            withinHand().queryByRole('region', { name: 'Card back' }),
          ).not.toBeInTheDocument();
        });
      });

      it(`should allow ${cardClass.name}s to be picked during the ${player} Main phase `, () => {
        render(
          <Hand
            player={player}
            handCards={cards(handSize, cardClass)}
            isPlacing={false}
            isMainPhase
            isPlayerTurn
            onPick={pickCard}
          />,
        );
        const clickableCards = withinHand().getAllByRole('button', {
          name: `Pick ${cardClass.name}`,
        });
        for (const card of clickableCards) {
          fireEvent.click(card);
          expect(pickCard).toHaveBeenCalledExactlyOnceWith(cardClass);
          pickCard.mockClear();
        }
      });

      it(`should allow all cards to be picked during the ${player} Main phase`, () => {
        render(
          <Hand
            player={player}
            handCards={cards(handSize, cardClass)}
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
            handCards={cards(handSize, cardClass)}
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
            handCards={cards(handSize, cardClass)}
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

      describe.for<[Phase, isPlacing: boolean]>([
        [Phase.Start, true],
        [Phase.Main, false],
        [Phase.End, false],
        [Phase.Start, true],
        [Phase.Main, true],
        [Phase.End, false],
      ])(
        `during the opponent's %s phase (placing:%s)`,
        ([phase, isPlacing]) => {
          it(`should show ${handSize} card backs`, () => {
            render(
              <Hand
                player={player}
                handCards={cards(handSize, cardClass)}
                isPlacing={isPlacing}
                isMainPhase={phase === Phase.Main}
                isPlayerTurn={false}
                onPick={pickCard}
              />,
            );
            expect(
              withinHand().queryByRole('region', { description: 'Card face' }),
            ).not.toBeInTheDocument();
            expect(
              withinHand().getAllByRole('region', { name: 'Card back' }),
            ).toHaveLength(handSize);
          });

          it('should not allow cards to be picked', () => {
            render(
              <Hand
                player={player}
                handCards={cards(handSize, cardClass)}
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
    },
  );
});
