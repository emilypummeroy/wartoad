import { fireEvent, render } from '@testing-library/react';

import { App } from '../App';
import { INITIAL_HAND_CARD_COUNT } from '../state';
import { Phase, Player } from '../types/gameflow';
import { advanceToPhase, getAll, getFirst, getThe, queryA, queryAll } from './app.test-utils';

const { Start, Main, End } = Phase;
const { North, South } = Player;

describe('the dom test environment', () => {
  it('should have a defined document', () => {
    expectTypeOf(document).not.toBeUndefined();
  });
});

describe(App, () => {
  beforeEach(() => render(<App />));

  describe('Hands', () => {
    it('should have the North Hand and South hand in that order before the Play area', () => {
      const south = getThe.hand(South);
      const north = getThe.hand(North);
      expect(north).toAppearBefore(south);
      expect(south).toAppearBefore(getThe.playArea);
    });

    describe('Picked Card', () => {
      it('should not appear before picking a card', () => {
        expect(queryA.pickedCardDisplay).not.toBeInTheDocument();
      });

      describe.for<[Player, number]>([
        [North, 0],
        [North, 2],
        [South, 4],
        [South, 6],
      ])('after %s picks the %sth card from their hand during their Main phase', ([player, cardIndex]) => {
        it(`should show the card only until it is placed`, () => {
          advanceToPhase(player, Main);
          fireEvent.click(getAll.handCards(player)[cardIndex]);

          expect(getThe.pickedCardDisplay).toBeVisible();
          expect(getThe.pickedCard).toBeVisible();

          fireEvent.click(getFirst.basicDropzoneControlledBy(player));
          expect(queryA.pickedCardDisplay).not.toBeInTheDocument();
        });
      });
    });

    describe.for([North, South])('%s hand', player => {
      const opponent = player === North ? South : North;

      it('should start with 7 cards', () => {
        expect(getAll.handCards(player)).toHaveLength(INITIAL_HAND_CARD_COUNT);
      });

      it(`should show ${player}'s funds`, () => {
        advanceToPhase(player, Start);
        expect(getThe.fundsOf(player)).toBeVisible();
      });

      it(`should be visible during the ${player} turn`, () => {
        advanceToPhase(player, Start);
        const cards = getAll.handCards(player);
        expect(cards).not.toHaveLength(0);
        expect(getAll.visibleHandCards(player)).toHaveLength(cards.length);
      });

      it(`should show card backs during the ${opponent} turn`, () => {
        advanceToPhase(opponent, Start);
        const cards = getAll.handCards(player);
        expect(cards).not.toHaveLength(0);
        for (const c of cards) expect(c).toHaveAccessibleName('Card back');
        expect(getAll.hiddenHandCards(player)).toHaveLength(cards.length);
      });

      it(`should gain an extra card during the ${player} Start phase`, () => {
        advanceToPhase(opponent, End);
        const initialCount = getAll.handCards(player).length;

        advanceToPhase(player, Main);
        expect(getAll.handCards(player)).toHaveLength(initialCount + 1);
      });

      it(`should allow a card to be picked during the ${player} Main phase`, () => {
        advanceToPhase(player, Main);
        fireEvent.click(getAll.handCards(player)[4]);
        expect(getThe.pickedCardDisplay).toBeVisible();
      });

      it('should not allow a card to be picked during other phases and turns', () => {
        {
          advanceToPhase(player, End);
          const cards = queryAll.handCards(player);
          if (cards.length > 0) fireEvent.click(cards[0]);
          expect(queryA.pickedCardDisplay).not.toBeInTheDocument();
        }
        {
          advanceToPhase(opponent, Main);
          const cards = queryAll.handCards(player);
          if (cards.length > 0) fireEvent.click(cards[0]);
          expect(queryA.pickedCardDisplay).not.toBeInTheDocument();
        }
      });

      it(`should lose a card when ${player} plays a card`, () => {
        advanceToPhase(player, Main);
        const initialHandSize = getAll.handCards(player).length;

        fireEvent.click(getAll.handCards(player)[Math.floor(INITIAL_HAND_CARD_COUNT * Math.random())]);
        fireEvent.click(getFirst.basicDropzoneControlledBy(player));

        expect(getAll.handCards(player)).toHaveLength(initialHandSize - 1);
      });
    });
  });
});
