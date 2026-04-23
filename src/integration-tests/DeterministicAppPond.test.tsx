import { fireEvent, render } from '@testing-library/react';

import { DeterministicApp } from '../App';
import { HOME } from '../state-types/pond';
import { Phase, Player } from '../types/gameflow';
import { advanceToPhase, getAll, getFirst, getThe, queryA, queryAll } from './app.test-utils';

const { Main } = Phase;
const { North, South } = Player;

describe(DeterministicApp, () => {
  beforeEach(() => render(<DeterministicApp />));

  describe('Pond', () => {
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
