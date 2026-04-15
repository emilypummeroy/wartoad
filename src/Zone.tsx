import { Replace, Leaf, Clover } from 'lucide-react';
import { useId, useCallback } from 'react';

import type { UnitClass } from './card-types';
import { Position } from './Grid';
import { Player, Subphase, type FlowState } from './PhaseTracker';

export type ZoneState = Readonly<{
  units: readonly UnitClass[];
  isUpgraded: boolean;
}>;

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
            <title id={symbolId}>{owner} controlled</title>
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
  zone: ZoneState;
  onPlace: (position: Position) => void;
}>;

export function Zone({
  flow: { subphase, player },
  controller,
  position,
  zone: { isUpgraded },
  onPlace,
}: ZoneProps) {
  const handleClick = useCallback(() => onPlace(position), [position, onPlace]);
  const isUpgradeDropzone =
    subphase === Subphase.Upgrading && !isUpgraded && player === controller;
  const isDeployDropzone =
    subphase === Subphase.Deploying && position.y === Position.HOME[player].y;

  return isUpgradeDropzone || isDeployDropzone ? (
    <div
      role="gridcell"
      aria-colindex={position.x}
      className={`placeable-zone zone ${Player.STYLES[controller]}`}
      onClick={handleClick}
      tabIndex={0}
    >
      <div role="button" className="overlay-container">
        <Replace>
          <title>{isUpgradeDropzone ? 'Upgrade' : 'Deploy on'}</title>
        </Replace>
      </div>
      {isUpgraded ? (
        <LilyPad
          isHome={Position.equals(Position.HOME[controller], position)}
          owner={controller}
        />
      ) : (
        <Facedown key="facedown-card" player={controller} />
      )}
    </div>
  ) : (
    <div
      className={`zone ${Player.STYLES[controller]}`}
      role="gridcell"
      aria-colindex={position.x}
    >
      {
        // TODO 8: Render units as well as the leaf
        isUpgraded ? (
          <LilyPad
            isHome={Position.equals(Position.HOME[controller], position)}
            owner={controller}
          />
        ) : (
          <Facedown key="facedown-card" player={controller} />
        )
      }
    </div>
  );
}
