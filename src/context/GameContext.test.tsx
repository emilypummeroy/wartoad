import { render } from '@testing-library/react';
import { useContext } from 'react';

import { createUnit } from '../state/card';
import { CardClass, UnitClass } from '../types/card';
import { Player } from '../types/gameflow';
import { GameContext, type GameDispatch } from './GameContext';

describe(GameContext, () => {
  describe('when consumed without a context provider', () => {
    function TestConsumer() {
      const [, dispatch] = useContext(GameContext);

      for (const x of Object.values(dispatch)) expect(x).not.toThrow();

      const { endPhase, pickCard, placeCard, activate } = dispatch;
      expect(() => endPhase()).not.toThrow();
      expect(() => pickCard(CardClass.LilyPad)).not.toThrow();
      expect(() => placeCard({ x: 0, y: 0 })).not.toThrow();
      expect(() =>
        activate(
          createUnit({
            cardClass: UnitClass.Froglet,
            owner: Player.North,
            key: 0,
          }),
          { x: 0, y: 0 },
        ),
      ).not.toThrow();
      ({ endPhase, pickCard, placeCard, activate }) satisfies GameDispatch;

      return '';
    }

    it('should not throw anything when default dispatch functions are called', () => {
      render(<TestConsumer />);
    });
  });
});
