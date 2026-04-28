import { StepForward } from 'lucide-react';
import { useContext } from 'react';

import { GameContext } from '../context/GameContext';
import { Phase, Player, type Gameflow } from '../types/gameflow';

// TODO 12: Turn all props into context slice
type PhaseTrackerSlice = [
  {
    flow: Gameflow;
    winner?: Player;
  },
  {
    finishPhase: () => void;
  },
];
export function PhaseTracker() {
  const [
    {
      flow: { phase, player },
      winner,
    },
    { finishPhase },
  ]: PhaseTrackerSlice = useContext(GameContext);
  const isBusy =
    phase === Phase.Upgrading ||
    phase === Phase.Deploying ||
    phase === Phase.Activating ||
    phase === Phase.GameOver;
  const phaseName =
    phase === Phase.Main ||
    phase === Phase.Upgrading ||
    phase === Phase.Deploying ||
    phase === Phase.Activating
      ? Phase.Main
      : phase;
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
      <button
        className="icon-text accent"
        disabled={isBusy}
        onClick={finishPhase}
      >
        <StepForward />
        Next phase
      </button>
    </section>
  );
}
