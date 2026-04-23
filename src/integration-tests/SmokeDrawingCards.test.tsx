import { render } from '@testing-library/react';

import { DeterministicApp } from '../App';
import { CardClass } from '../types/card';
import { Phase, Player } from '../types/gameflow';
import { advanceToPhase, getAll } from './app.test-utils';

const { Main, End } = Phase;
const { North, South } = Player;
const { Froglet } = CardClass;

describe('Smoke test: Advancing to subsequent Turns and Drawing cards', () => {
  beforeEach(() => render(<DeterministicApp />));

  describe.for([North, South])('over the first two full %s turns', player => {
    // The first turn of the game starts on the Main phase and is not a full turn.
    const opponent = player === North ? South : North;

    beforeEach(() => {
      advanceToPhase(opponent, End);
    });

    it(`should gain a Froglet during the Start phases`, () => {
      const initialCardCount = getAll.handCards(player).length;

      advanceToPhase(player, Main);
      expect(getAll.handCards(player)).toHaveLength(initialCardCount + 1);

      const intermediateFrogletCount = getAll.handCardsNamed(player, Froglet.name).length;

      advanceToPhase(player, End);
      expect(getAll.handCardsNamed(player, Froglet.name)).toHaveLength(intermediateFrogletCount);
      expect(getAll.handCards(player)).toHaveLength(initialCardCount + 1);

      advanceToPhase(opponent, End);
      expect(getAll.handCards(player)).toHaveLength(initialCardCount + 1);

      advanceToPhase(player, Main);
      expect(getAll.handCardsNamed(player, Froglet.name)).toHaveLength(intermediateFrogletCount + 1);
      expect(getAll.handCards(player)).toHaveLength(initialCardCount + 2);
    });
  });
});
