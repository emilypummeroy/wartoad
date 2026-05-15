import { StepForward, X } from 'lucide-react';
import { useContext } from 'react';

import { GameContext } from '@/context/GameContext';
import { Phase, Player, type Gameflow } from '@/types/gameflow';

const NOUN = {
  [Phase.Upgrading]: 'Upgrade',
  [Phase.Deploying]: 'Deployment',
  [Phase.Activating]: 'Activation',
};

type PhaseTrackerSlice = [
  {
    flow: Gameflow;
    winner?: Player;
  },
  {
    finishPhase: () => void;
    cancelActivePhase: () => void;
  },
];

export function PhaseTracker() {
  const [
    {
      flow: { phase, player },
      winner,
    },
    { finishPhase, cancelActivePhase },
  ]: PhaseTrackerSlice = useContext(GameContext);
  const isActivePhase =
    phase === Phase.Upgrading ||
    phase === Phase.Deploying ||
    phase === Phase.Activating;

  const phaseName = isActivePhase ? Phase.Main : phase;

  return phase === Phase.GameOver && !!winner ? (
    <section aria-labelledby="current-phase" className="phases">
      <h3 id="current-phase">
        A <span className="accent">WINRAR</span> is {}
        <span className={winner === Player.North ? 'north' : 'south'}>
          {winner}
        </span>
      </h3>
    </section>
  ) : (
    <section aria-labelledby="current-phase" className="phases">
      <h3 id="current-phase">
        <span className={player === Player.North ? 'north' : 'south'}>
          {player}
        </span>
        : <span className="accent">{phaseName}</span> phase
      </h3>
      {isActivePhase ? (
        <button className="icon-text accent" onClick={cancelActivePhase}>
          <X />
          Cancel {NOUN[phase]}
        </button>
      ) : (
        <button className="icon-text accent" onClick={finishPhase}>
          <StepForward />
          Next phase
        </button>
      )}
    </section>
  );
}
