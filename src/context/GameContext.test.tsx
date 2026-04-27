import { render } from '@testing-library/react';
import { useContext } from 'react';

import type { GameActions } from '../actions';
import { createUnit } from '../state-types/card';
import { CardClass, UnitClass } from '../types/card';
import { Player } from '../types/gameflow';
import { GameContext } from './GameContext';

describe('The context', () => {
  describe('when consumed without a context provider', () => {
    function TestConsumer() {
      const [, dispatch] = useContext(GameContext);

      for (const x of Object.values(dispatch)) expect(x).not.toThrow();

      const { finishPhase, pickCard, activate, commitUpgrade, commitDeploy, commitActivate } = dispatch;
      expect(() => finishPhase()).not.toThrow();
      expect(() => pickCard(CardClass.LilyPad)).not.toThrow();
      expect(() => commitUpgrade({ x: 0, y: 0 })).not.toThrow();
      expect(() => commitDeploy({ x: 0, y: 0 })).not.toThrow();
      expect(() => commitActivate({ x: 0, y: 0 })).not.toThrow();
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
      ({ finishPhase, pickCard, activate, commitUpgrade, commitDeploy, commitActivate }) satisfies GameActions;

      return '';
    }

    it('should not throw anything when default dispatch functions are called', () => {
      render(<TestConsumer />);
    });
  });
});
