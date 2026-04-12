import { Replace, Leaf, Clover } from 'lucide-react';
import { useId, useCallback } from 'react';

import { Position } from './Grid';
import { Player, Subphase, type FlowState } from './PhaseTracker';

function LilyPad({
  owner,
  isHome = false,
}: {
  readonly owner: Player;
  readonly isHome?: boolean;
}) {
  const playerStyle = {
    [Player.North]: 'north',
    [Player.South]: 'south',
  }[owner];
  const nameId = useId();
  const symbolId = useId();
  return (
    <section
      aria-labelledby={`${symbolId} ${nameId}`}
      className={`card ${playerStyle}`}
    >
      <div className="card-title" id={nameId}>
        Lily Pad
      </div>
      <div className="card-section-row">
        {isHome ? (
          <Clover>
            <title id={symbolId}>{owner} Home</title>
          </Clover>
        ) : (
          <Leaf>
            <title id={symbolId}>{owner} owned</title>
          </Leaf>
        )}
      </div>
      <div className="card-section-row">
        <div className="card-item">
          <small>Gives:</small>+0
        </div>
      </div>
    </section>
  );
}

function Facedown({ player }: { readonly player: Player }) {
  const id = useId();
  return (
    <section
      aria-labelledby={id}
      className={`facedown card ${Player.STYLES[player]}`}
    >
      <Leaf>
        <title id={id}>{player} controlled leaf</title>
      </Leaf>
    </section>
  );
}

type ZoneProps = Readonly<{
  flow: FlowState;
  controller: Player;
  position: Position;
  isUpgraded: boolean;
  onPlace: (position: Position) => void;
}>;

export function Zone({
  flow: { subphase, player },
  controller,
  position,
  isUpgraded,
  onPlace,
}: ZoneProps) {
  const isDropzone =
    !isUpgraded && player === controller && subphase === Subphase.Placing;
  return (
    <button
      className={`placeable-zone ${Player.STYLES[controller]}`}
      disabled={!isDropzone}
      onClick={useCallback(() => onPlace(position), [position, onPlace])}
    >
      <div className={`zone ${Player.STYLES[controller]}`} role="gridcell">
        {isDropzone && (
          <div className="overlay-container">
            <Replace>
              <title>Place on</title>
            </Replace>
          </div>
        )}
        {isUpgraded ? (
          <LilyPad
            isHome={Position.equals(Position.HOME[controller], position)}
            owner={controller}
          />
        ) : (
          <Facedown player={controller} />
        )}
      </div>
    </button>
  );
}
