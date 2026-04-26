import { fireEvent, render } from '@testing-library/react';

import { DeterministicApp } from '../App';
import { ROW_COUNT } from '../state-types/pond';
import { CardClass } from '../types/card';
import { Phase, Player } from '../types/gameflow';
import { advanceToPhase, getFirst, getThe } from './app.test-utils';

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
      fireEvent.click(getFirst.basicDropzoneControlledBy(player));
    });

    it(`should allow ${player} to win by capturing the ${opponent} Home leaf`, () => {
      for (let i = 1; i < ROW_COUNT; i += 1) {
        fireEvent.click(getFirst.unitControlledByOfClass(player, Froglet));
        fireEvent.click(getThe.nthRowDropzoneFor(player, i));
        advanceToPhase(player, End);
        advanceToPhase(player, Main);
      }

      expect(getThe.winnerIndicator(player)).toBeVisible();
    });
  });
});
