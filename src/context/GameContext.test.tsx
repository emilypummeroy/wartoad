import { render } from '@testing-library/react';
import { useContext } from 'react';

import { CardClass } from '../types/card';
import { GameContext, type GameDispatch } from './GameContext';

describe(GameContext, () => {
  describe('when consumed without a context provider', () => {
    function TestConsumer() {
      const [, dispatch] = useContext(GameContext);

      for (const x of Object.values(dispatch)) expect(x).not.toThrow();

      const { endPhase, pickCard, placeCard } = dispatch;
      expect(() => endPhase()).not.toThrow();
      expect(() => pickCard(CardClass.LilyPad)).not.toThrow();
      expect(() => placeCard({ x: 0, y: 0 })).not.toThrow();
      ({ endPhase, pickCard, placeCard }) satisfies GameDispatch;

      return '';
    }

    it('should not throw anything when default dispatch functions are called', () => {
      render(<TestConsumer />);
    });
  });
});
