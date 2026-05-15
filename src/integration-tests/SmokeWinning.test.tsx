import { fireEvent, render } from '@testing-library/react';

import { DeterministicApp } from '@/App';
import { ROW_COUNT } from '@/state-types/pond';
import { CardClass } from '@/types/card';
import { Phase, Player } from '@/types/gameflow';

import { advanceToGameOver, advanceToPhase, getFirst, getThe } from './app.test-utils';

const { Main, End } = Phase;
const { North, South } = Player;
const { Froglet } = CardClass;

describe('Smoke test: Advancing units and Capturing leaves', () => {
  beforeEach(() => render(<DeterministicApp />));

  describe.for([North, South])('after %s has deployed a unit', player => {
    const opponent = player === North ? South : North;

    beforeEach(() => {
      advanceToPhase(player, Main);
      fireEvent.click(getFirst.handCardNamed(player, Froglet.name));
      fireEvent.click(getThe.homeLeafDropzone(player));
    });

    it(`should allow ${player} to win by capturing the ${opponent} Home leaf`, () => {
      for (let i = 1; i < ROW_COUNT; i += 1) {
        advanceToPhase(player, End);
        advanceToPhase(player, Main);
        fireEvent.click(getFirst.unitControlledByOfClass(player, Froglet));
        fireEvent.click(getThe.nthRowDropzoneFor(player, i));
      }

      advanceToGameOver(player);

      expect(getThe.winrar(player)).toBeVisible();
    });
  });

  describe.for([North, South])(
    'after %s has deployed a units on their home and both players have deployed and advanced another unit',
    player => {
      const opponent = player === North ? South : North;

      const moveUnitFromRowToRow = (owner: Player, start: number, end: number) => {
        advanceToPhase(owner, Main);
        fireEvent.click(getThe.nthRowUnitControlledBy(owner, start));
        fireEvent.click(getThe.nthRowDropzoneFor(owner, end));
      };

      beforeEach(() => {
        // Have opponent deploy and advance one unit.
        advanceToPhase(opponent, Main);
        fireEvent.click(getFirst.handCardNamed(opponent, Froglet.name));
        fireEvent.click(getThe.homeLeafDropzone(opponent));
        moveUnitFromRowToRow(opponent, 0, 1);

        // Have player deploy and advance one unit.
        advanceToPhase(player, Main);
        fireEvent.click(getFirst.handCardNamed(player, Froglet.name));
        fireEvent.click(getThe.homeLeafDropzone(player));
        moveUnitFromRowToRow(player, 0, 1);
        // Have player deploy an additional unit.
        fireEvent.click(getFirst.handCardNamed(player, Froglet.name));
        fireEvent.click(getThe.homeLeafDropzone(player));
      });

      it(`should allow ${opponent} to win if ${player} ends a turn with both Homes being capturable`, () => {
        // Move a unit of each player into place at the other's Home
        // but don't end the last player turn yet.
        for (let i = 1; i < ROW_COUNT - 1; i += 1) {
          moveUnitFromRowToRow(opponent, i, i + 1);
          moveUnitFromRowToRow(player, i, i + 1);
        }

        // Have player vacate their own home leaf so both homes
        // are capturable.
        fireEvent.click(getThe.nthRowUnitControlledBy(player, 0));
        fireEvent.click(getFirst.basicDropzoneControlledBy(player));

        advanceToGameOver(opponent);
        expect(getThe.winrar(opponent)).toBeVisible();
      });
    },
  );
});
