import { StepForward } from 'lucide-react';

import { Player, Subphase, type FlowState } from '../types/gameflow';

// TODO 9: Tests for Activation subphase
export function PhaseTracker({
  flow: { player, phase, subphase },
  onNextPhaseClicked,
}: {
  readonly flow: FlowState;
  readonly onNextPhaseClicked: () => void;
}) {
  return (
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
