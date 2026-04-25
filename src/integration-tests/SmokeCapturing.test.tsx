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

  describe.for([North, South])('after %s and their opponent have deployed a unit', player => {
    const opponent = player === North ? South : North;

    beforeEach(() => {
      advanceToPhase(opponent, Main);
      fireEvent.click(getFirst.handCardNamed(opponent, Froglet.name));
      fireEvent.click(getFirst.basicDropzoneControlledBy(opponent));

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

      expect(getAll.basicLeavesControlledBy(player)).toHaveLength(initialLeafCount + 1);
    });

    it(`should prevent ${player} from capturing a leaf if it is defended by an opposing unit`, () => {
      const initialLeafCount = getAll.basicLeavesControlledBy(player).length;

      for (let i = 1; i <= 2; i += 1) {
        advanceToPhase(opponent, Main);
        fireEvent.click(getFirst.unitControlledByOfClass(opponent, Froglet));
        fireEvent.click(getThe.nthRowDropzoneFor(opponent, i));
        expect(getAll.basicLeavesControlledBy(opponent)).toHaveLength(initialLeafCount);
        advanceToPhase(opponent, End);
      }

      for (let i = 1; i <= 3; i += 1) {
        advanceToPhase(player, Main);
        fireEvent.click(getFirst.unitControlledByOfClass(player, Froglet));
        fireEvent.click(getThe.nthRowDropzoneFor(player, i));
        expect(getAll.basicLeavesControlledBy(player)).toHaveLength(initialLeafCount);
        advanceToPhase(player, End);
      }

      expect(getAll.basicLeavesControlledBy(player)).toHaveLength(initialLeafCount);
    });
  });
});
