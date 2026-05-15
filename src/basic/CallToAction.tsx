import { useContext } from 'react';

import { GameContext } from '@/context/GameContext';
import type { Gameflow, Phase } from '@/types/gameflow';

type CallToActionSlice = [
  {
    flow: Gameflow;
  },
  {},
];
export function CallToAction() {
  const [
    {
      flow: { phase },
    },
  ]: CallToActionSlice = useContext(GameContext);

  return (
    (
      {
        Upgrading: 'Choose an unupgraded leaf to upgrade',
        Deploying: 'Choose a leaf in your home row to deploy on',
        Activating: 'Choose a leaf in range to move to',
        GameOver: 'Refresh the page to play again',
      } as Partial<Record<Phase, string>>
    )[phase] ?? ''
  );
}
