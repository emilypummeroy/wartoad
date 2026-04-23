import { fireEvent, render, screen } from '@testing-library/react';

import { DeterministicApp } from '../App';
import { HOME } from '../state/pond';
import { Phase, Player } from '../types/gameflow';
import { getAll, getFirst, getThe, queryA, queryAll } from './app.test-utils';

const { Start, Main, End } = Phase;
const { North, South } = Player;

const advanceToPhase = (player: Player, phase: Phase) => {
  for (let i = 0; i < MANY; i += 1) {
    if (queryA.phaseIndicator(player, phase)) break;
    fireEvent.click(screen.getByText('Next phase'));
  }
  expect(getThe.phaseIndicator(player, phase)).toBeVisible();
};

const MANY = 15;

describe(DeterministicApp, () => {
  beforeEach(() => render(<DeterministicApp />));

  describe('Hands', () => {
    describe('Picked Card', () => {
      // Skipped because it's slow and the path is well covered by other tests.
      it.skip.for<[Player, cardName: string]>([
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
      const opponent = player === North ? South : North;

      it(`should show Lily Pads and Froglets during the ${player} turn`, () => {
        advanceToPhase(player, Start);
        const cards = getAll.handCards(player);
        expect(cards).not.toHaveLength(0);
        for (const c of cards) expect(c).toHaveAccessibleName(/(Lily Pad|Froglet)/);
      });

      it(`should gain a Froglet during the first ${player} Start phase`, ({ skip }) => {
        skip(player === North); // Slow
        advanceToPhase(player, Main);
        const initialFrogletCount = getAll.handCardsNamed(player, 'Froglet').length;
        const initialCardCount = getAll.handCards(player).length;

        advanceToPhase(opponent, End);
        expect(getAll.handCards(player).length).toBe(initialCardCount);

        advanceToPhase(player, Main);
        expect(getAll.handCardsNamed(player, 'Froglet')).toHaveLength(initialFrogletCount + 1);
      });

      it.for(['Lily Pad', 'Froglet'])(`should allow a %s to be picked during the ${player} Main phase`, name => {
        advanceToPhase(player, Main);
        fireEvent.click(getFirst.handCardNamed(player, name));
        expect(getThe.pickedCardDisplay).toBeVisible();
        expect(getThe.pickedCardNamed(name)).toBeVisible();
      });

      it.for(['Lily Pad', 'Froglet'])(`should lose a %s when played by ${player}`, name => {
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

  describe('Play area', () => {
    describe.for<Player>([North, South])('after picking a Lily Pad from the %s hand', player => {
      const opponent = player === North ? South : North;

      beforeEach(() => {
        advanceToPhase(player, Main);
        fireEvent.click(getFirst.handCardNamed(player, 'Lily Pad'));
      });

      const STARTING_UNUPGRADED_LEAVES = 8;
      it.for([0, STARTING_UNUPGRADED_LEAVES / 2, STARTING_UNUPGRADED_LEAVES - 1])(
        `should allow ${player} to upgrade their %sth unupgraded leaf by clicking on it`,
        leafIndex => {
          const initialLilyPadCount = queryAll.cardsControlledByWithName(player, 'Lily Pad').length;

          fireEvent.click(getAll.basicDropzonesControlledBy(player)[leafIndex]);

          expect(getAll.controlledCardsNamed(player, 'Lily Pad')).toHaveLength(initialLilyPadCount + 1);
        },
      );

      it(`should not allow ${player} to upgrade an a ${opponent} leaf`, () => {
        const initialLilyPadCount = queryAll.cardsControlledByWithName(player, 'Lily Pad').length;

        expect(queryA.upgradeDropzoneControlledBy(opponent)).not.toBeInTheDocument();

        fireEvent.click(getFirst.leafControlledBy(opponent));
        expect(queryAll.cardsControlledByWithName(player, 'Lily Pad')).toHaveLength(initialLilyPadCount);
      });

      it(`should not allow ${player} to upgrade an upgraded leaf`, () => {
        const initialLilyPadCount = getAll.cardsControlledByWithName(player, 'Lily Pad').length;

        expect(queryA.upgradeDropzoneOnLeafNamed('Lily Pad')).not.toBeInTheDocument();

        fireEvent.click(getFirst.cardsControlledByWithName(player, 'Lily Pad'));
        expect(getAll.cardsControlledByWithName(player, 'Lily Pad')).toHaveLength(initialLilyPadCount);
      });
    });

    describe.for<Player>([North, South])('after picking a Froglet from the %s hand', player => {
      const opponent = player === North ? South : North;

      beforeEach(() => {
        advanceToPhase(player, Main);
        fireEvent.click(getFirst.handCardNamed(player, 'Froglet'));
      });

      const LEFT = 0;
      const RIGHT = 2;
      it.for([LEFT, RIGHT])(
        `should allow ${player} to train a Froglet on their %sth leaf in the back row`,
        leafIndex => {
          const initialCount = queryAll.unitsControlledBy(player).length;

          fireEvent.click(getAll.homeRowDropzones(player)[leafIndex]);

          expect(getAll.unitsControlledBy(player)).toHaveLength(initialCount + 1);
        },
      );

      it(`should allow ${player} to train a Froglet on their Home Lily Pad`, () => {
        const initialCount = queryAll.unitsControlledBy(player).length;

        fireEvent.click(getThe.homeLeafDropzone(player));

        expect(getAll.unitsControlledBy(player)).toHaveLength(initialCount + 1);
      });

      it.for([1, 2])(`should not allow ${player} to play the Froglet on an a forward leaf`, offset => {
        const targetRow = player === North ? HOME[North].y + offset : HOME[South].y - offset;
        expect(queryA.nthRowDropzone(targetRow)).not.toBeInTheDocument();
      });

      it(`should not allow ${player} to play the Froglet on an a ${opponent} leaf`, () => {
        expect(queryA.upgradeDropzoneControlledBy(opponent)).not.toBeInTheDocument();
      });
    });
  });
});
