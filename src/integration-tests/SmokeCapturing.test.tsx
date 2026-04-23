import { fireEvent, render } from '@testing-library/react';

import { DeterministicApp } from '../App';
import { CardClass } from '../types/card';
import { Phase, Player } from '../types/gameflow';
import { advanceToPhase, getAll, getFirst, getThe } from './app.test-utils';

const { Main, End } = Phase;
const { North, South } = Player;
const { Froglet } = CardClass;

describe('Smoke test: Advancing units and Capturing leaves', () => {
  beforeEach(() => render(<DeterministicApp />));

  describe.for([North, South])('after %s deploys a unit', player => {
    beforeEach(() => {
      advanceToPhase(player, Main);

      fireEvent.click(getFirst.handCardNamed(player, Froglet.name));
      fireEvent.click(getFirst.basicDropzoneControlledBy(player));
    });

    it(`should allow ${player} to advance their unit into enemy territory, capturing a leaf`, () => {
      const initialLeafCount = getAll.basicLeavesControlledBy(player).length;

      for (let i = 1; i <= 3; i += 1) {
        fireEvent.click(getFirst.unitControlledByOfClass(player, Froglet));
        fireEvent.click(getThe.nthRowDropzoneFor(player, i));
        expect(getAll.basicLeavesControlledBy(player)).toHaveLength(initialLeafCount);
        advanceToPhase(player, End);
        advanceToPhase(player, Main);
      }

      // TODO 10: expect(getAll.basicLeavesControlledBy(player)).toHaveLength(initialLeafCount + 1);
    });
  });
});
