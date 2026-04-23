import { fireEvent, render, screen } from '@testing-library/react';

import { DeterministicApp } from '../App';
import { CardClass } from '../types/card';
import { Phase, Player } from '../types/gameflow';
import { getAll, getFirst, getThe, queryA } from './app.test-utils';

const { Start, Main, End } = Phase;
const { North, South } = Player;
const { Froglet } = CardClass;

const advanceToPhase = (player: Player, phase: Phase) => {
  for (let i = 0; i < MANY; i += 1) {
    if (queryA.phaseIndicator(player, phase)) break;
    fireEvent.click(screen.getByText('Next phase'));
  }
  expect(getThe.phaseIndicator(player, phase)).toBeVisible();
};

const MANY = 15;

describe('Smoke test: deploying units and moving them around', () => {
  beforeEach(() => render(<DeterministicApp />));

  describe.for([North, South])('for the %s player Main Phase', player => {
    beforeEach(() => {
      advanceToPhase(player, Main);
    });

    it(`should allow ${player} to deploy a unit and move it forward`, () => {
      fireEvent.click(getFirst.handCardNamed(player, Froglet.name));
      fireEvent.click(getFirst.basicDropzoneControlledBy(player));
      fireEvent.click(getFirst.unitControlledByOfClass(player, Froglet));

      expect(queryA.nthRowUnitControlledBy(player, 1)).not.toBeInTheDocument();
      expect(getThe.nthRowUnitControlledBy(player, 0)).toBeVisible();
      fireEvent.click(getThe.nthRowDropzoneFor(player, 1));
      expect(getThe.nthRowUnitControlledBy(player, 1)).toBeVisible();
      expect(queryA.nthRowUnitControlledBy(player, 0)).not.toBeInTheDocument();
      // TODO 11: Should not have a clickable unit anymore
    });

    it(`should allow ${player} to deploy multiple units and move them onto Home`, () => {
      fireEvent.click(getFirst.handCardNamed(player, Froglet.name));
      fireEvent.click(getFirst.basicDropzoneControlledBy(player));
      fireEvent.click(getFirst.handCardNamed(player, Froglet.name));
      fireEvent.click(getAll.basicDropzonesControlledBy(player)[1]);
      fireEvent.click(getFirst.handCardNamed(player, Froglet.name));
      fireEvent.click(getThe.homeLeafDropzone(player));

      fireEvent.click(getAll.unitsControlledByOfClass(player, Froglet)[2]);
      fireEvent.click(getAll.homeRowDropzones(player)[1]);
      fireEvent.click(getAll.unitsControlledByOfClass(player, Froglet)[0]);
      fireEvent.click(getAll.homeRowDropzones(player)[0]);
      fireEvent.click(getAll.unitsControlledByOfClass(player, Froglet)[0]);
      fireEvent.click(getAll.homeRowDropzones(player)[1]);
      expect(getAll.nthRowUnitsControlledBy(player, 0)).toHaveLength(3);
      // TODO 11: Should not have a clickable unit anymore
    });
  });

  describe.for([North, South])('for the %s player Start and End phases', player => {
    it(`should not allow them to deploy a unit`, () => {
      advanceToPhase(player, Start);
      fireEvent.click(getFirst.handCardNamed(player, Froglet.name));
      advanceToPhase(player, End);
      fireEvent.click(getFirst.handCardNamed(player, Froglet.name));
      advanceToPhase(player, Start);
    });
  });
});
