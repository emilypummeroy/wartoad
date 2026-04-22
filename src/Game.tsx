import { useContext, type ReactNode } from 'react';

import { Hand } from './basic/Hand';
import { Pond } from './composite/Pond';
import { GameContext } from './context/GameContext';
import { CardClass } from './types/card';
import { Phase, Player, PLAYER_CLASSNAME, Subphase } from './types/gameflow';
import { Froglet, LilyPad } from './view/Card';
import { PhaseTracker } from './view/PhaseTracker';

export function Game() {
  const [
    {
      flow: { phase, player, subphase },
      flow,
      northHand,
      southHand,
      pickedCard,
    },
    { endPhase, pickCard, placeCard },
  ] = useContext(GameContext);

  return (
    <div role="application" aria-label="Wartoad" className="wartoad-app">
      <header>
        <div className="title">
          <h1>
            War<span className="accent">toad</span>
          </h1>
        </div>
        <PhaseTracker flow={flow} onNextPhaseClicked={endPhase} />
      </header>
      <main>
        <section className="handarea">
          <Hand
            player={Player.North}
            isMainPhase={phase === Phase.Main}
            isPlayerTurn={player === Player.North}
            isPlacing={subphase !== Subphase.Idle}
            handCards={northHand}
            onPick={pickCard}
          />
          {subphase !== Subphase.Idle && (
            // TODO 18: Make cards zoomable/inspectable/something outside of deploys and upgrades
            <PickedCard owner={player}>
              {pickedCard === CardClass.Froglet ? <Froglet /> : <LilyPad />}
            </PickedCard>
          )}
          <Hand
            player={Player.South}
            isMainPhase={phase === Phase.Main}
            isPlayerTurn={player === Player.South}
            isPlacing={subphase !== Subphase.Idle}
            handCards={southHand}
            onPick={pickCard}
          />
        </section>
        <div className="scroll-x">
          <section className="playarea">
            <Pond onCardPlaced={placeCard} />
          </section>
        </div>
      </main>
    </div>
  );
}

function PickedCard({
  owner,
  children,
}: {
  readonly owner: Player;
  readonly children: ReactNode;
}) {
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
