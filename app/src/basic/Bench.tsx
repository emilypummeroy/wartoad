import { useContext, type ReactNode } from 'react';

import { GameContext } from '@/context/GameContext';
import type {
  ActivationState,
  DeploymentState,
  UpgradeState,
} from '@/state-types';
import { CardLocation, type CardState } from '@/types/card';
import { Player, PLAYER_CLASSNAME, type Gameflow } from '@/types/gameflow';
import { Froglet, LeafCard } from '@/view/Card';
import { Hand } from '@/view/Hand';

type BenchSlice = readonly [
  {
    readonly flow: Gameflow;
    readonly northHand: readonly CardState[];
    readonly southHand: readonly CardState[];
    readonly northFunds: number;
    readonly southFunds: number;
    readonly activation: ActivationState | undefined;
    readonly deployment: DeploymentState | undefined;
    readonly upgrade: UpgradeState | undefined;
  },
  {
    readonly pickCard: (card: CardState) => void;
  },
];

export function Bench() {
  const [
    {
      flow: { phase, player },
      northHand,
      southHand,
      northFunds,
      southFunds,
      upgrade,
      deployment,
      activation,
    },
    { pickCard },
  ]: BenchSlice = useContext(GameContext);

  return (
    <section className="handarea">
      <Hand
        player={Player.North}
        phase={phase}
        funds={northFunds}
        isPlayerTurn={player === Player.North}
        handCards={northHand}
        onPick={pickCard}
      />
      {upgrade && (
        // TODO 25: Make cards zoomable/inspectable/something outside of deploys and upgrades
        <PickedCard owner={player}>
          <LeafCard location={CardLocation.Hand} leaf={upgrade.leaf} />
        </PickedCard>
      )}
      {deployment && (
        <PickedCard owner={player}>
          <Froglet />
        </PickedCard>
      )}
      {activation && (
        <PickedCard owner={player}>
          <Froglet />
        </PickedCard>
      )}

      <Hand
        player={Player.South}
        funds={southFunds}
        phase={phase}
        isPlayerTurn={player === Player.South}
        handCards={southHand}
        onPick={pickCard}
      />
    </section>
  );
}

function PickedCard({
  owner,
  children,
}: Readonly<{
  owner: Player;
  children: ReactNode;
}>) {
  return (
    <section className="card-display" aria-labelledby="picked-card">
      <h3 id="picked-card">Picked card</h3>
      <div className="zoom-row">
        <div
          className={`zooming highlighting-card ${PLAYER_CLASSNAME[owner]}`}
          tabIndex={0}
        >
          {children}
        </div>
      </div>
    </section>
  );
}
