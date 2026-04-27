import { StepForward } from 'lucide-react';
import { useContext } from 'react';

import { GameContext } from '../context/GameContext';
import { Phase, Player, Subphase, type Gameflow } from '../types/gameflow';

// TODO 12: Turn all props into context slice
type PhaseTrackerSlice = [
  {
    winner?: Player;
  },
  {},
];
export function PhaseTracker({
  flow: { player, phase, subphase },
  onNextPhaseClicked,
}: {
  readonly flow: Gameflow;
  readonly onNextPhaseClicked: () => void;
}) {
  const [{ winner }]: PhaseTrackerSlice = useContext(GameContext);
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
        : <span className="accent">{phase}</span> phase
      </h3>
      <button
        className="icon-text accent"
        disabled={subphase !== Subphase.Idle}
        onClick={onNextPhaseClicked}
      >
        <StepForward />
        Next phase
      </button>
    </section>
  );
}
