import { fireEvent, render } from '@testing-library/react';

import { DeterministicApp } from '../App';
import { CardClass } from '../types/card';
import { Phase, Player } from '../types/gameflow';
import { advanceToPhase, getAll, getFirst, getThe, queryA } from './app.test-utils';

const { Main, Start } = Phase;
const { North, South } = Player;
const { Froglet, LilyPad } = CardClass;

describe(DeterministicApp, () => {
  beforeEach(() => render(<DeterministicApp />));

  describe('Hands', () => {
    describe('Picked Card', () => {
      it.for<[Player, cardName: string]>([
        [South, 'Froglet'],
        [South, 'Lily Pad'],
        [North, 'Froglet'],
        [North, 'Lily Pad'],
      ])(`should show a picked %s %s only until it is played`, ([player, cardName]) => {
        advanceToPhase(player, Main);
        fireEvent.click(getFirst.handCardNamed(player, cardName));

        expect(getThe.pickedCardDisplay).toBeVisible();
        expect(getThe.pickedCardNamed(cardName)).toBeVisible();

        fireEvent.click(getFirst.basicDropzoneControlledBy(player));
        expect(queryA.pickedCardDisplay).not.toBeInTheDocument();
      });
    });

    describe.for([North, South])('%s hand', player => {
      it(`should show Lily Pads and Froglets during the ${player} turn`, () => {
        advanceToPhase(player, Start);
        const cards = getAll.handCards(player);
        expect(cards).not.toHaveLength(0);
        for (const c of cards) expect(c).toHaveAccessibleName(/(Lily Pad|Froglet)/);
      });

      it.for([LilyPad.name, Froglet.name])(`should allow a %s to be picked during the ${player} Main phase`, name => {
        advanceToPhase(player, Main);
        fireEvent.click(getFirst.handCardNamed(player, name));
        expect(getThe.pickedCardDisplay).toBeVisible();
        expect(getThe.pickedCardNamed(name)).toBeVisible();
      });

      it.for([LilyPad.name, Froglet.name])(`should lose a %s when played by ${player}`, name => {
        advanceToPhase(player, Main);
        const initialNamedCount = getAll.handCardsNamed(player, name).length;
        const initialHandCount = getAll.handCards(player).length;

        fireEvent.click(getFirst.handCardNamed(player, name));
        fireEvent.click(getFirst.basicDropzoneControlledBy(player));
        expect(getAll.handCards(player)).toHaveLength(initialHandCount - 1);
        expect(getAll.handCardsNamed(player, name)).toHaveLength(initialNamedCount - 1);
      });
    });
  });
});
