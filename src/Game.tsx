import { useContext, type ReactNode } from 'react';

import { Hand } from './basic/Hand';
import { PhaseTracker } from './basic/PhaseTracker';
import { Pond } from './composite/Pond';
import { GameContext } from './context/GameContext';
import { Phase, Player, PLAYER_CLASSNAME } from './types/gameflow';
import { Froglet, LilyPad } from './view/Card';

export function Game() {
  const [
    {
      flow: { phase, player },
      northHand,
      southHand,
      upgrade,
      deployment,
      activation,
    },
    { pickCard },
  ] = useContext(GameContext);

  return (
    <div role="application" aria-label="Wartoad" className="wartoad-app">
      <header>
        <div className="title">
          <h1>
            War<span className="accent">toad</span>
          </h1>
        </div>
        <PhaseTracker />
      </header>
      <main>
        <section className="handarea">
          <Hand
            player={Player.North}
            isActivePhase={
              phase === Phase.Activating ||
              phase === Phase.Deploying ||
              phase === Phase.Upgrading
            }
            isMainPhase={phase === Phase.Main}
            isPlayerTurn={player === Player.North}
            handCards={northHand}
            onPick={pickCard}
          />
          {(upgrade ?? deployment ?? activation) && (
            // TODO 18: Make cards zoomable/inspectable/something outside of deploys and upgrades
            <PickedCard owner={player}>
              {deployment || activation ? <Froglet /> : <LilyPad />}
            </PickedCard>
          )}
          <Hand
            player={Player.South}
            isMainPhase={phase === Phase.Main}
            isPlayerTurn={player === Player.South}
            handCards={southHand}
            onPick={pickCard}
          />
        </section>
        <div className="scroll-x">
          <section className="playarea">
            <Pond />
          </section>
        </div>
      </main>
    </div>
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
