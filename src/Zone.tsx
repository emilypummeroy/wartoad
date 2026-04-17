import { Replace } from 'lucide-react';
import { useId, useCallback } from 'react';

import { type UnitClass } from './card-types';
import { CardBack, Froglet, LilyPad } from './Cards';
import { Position } from './Grid';
import { Player, Subphase, type FlowState } from './PhaseTracker';

export type ZoneState = Readonly<{
  units: readonly UnitClass[];
  isUpgraded: boolean;
}>;

type ZoneProps = Readonly<{
  flow: FlowState;
  controller: Player;
  position: Position;
  zone: ZoneState;
  onPlace: (position: Position) => void;
}>;

// oxlint-disable-next-line max-lines-per-function
export function Zone({
  flow: { subphase, player },
  controller,
  position,
  zone: { isUpgraded, units },
  onPlace,
}: ZoneProps) {
  const handleClick = useCallback(() => onPlace(position), [position, onPlace]);
  const isUpgradeDropzone =
    subphase === Subphase.Upgrading && !isUpgraded && player === controller;
  const isDeployDropzone =
    subphase === Subphase.Deploying && position.y === Position.HOME[player].y;
  const isHome = Position.equals(Position.HOME[controller], position);
  const buttonId = useId();
  const leafNameid = useId();
  const leafSymbolId = useId();
  return isUpgradeDropzone || isDeployDropzone ? (
    <div
      role="gridcell"
      aria-colindex={position.x}
      className={`placeable-zone zone ${Player.STYLES[controller]}`}
      onClick={handleClick}
      tabIndex={0}
    >
      <div
        id={buttonId}
        aria-labelledby={`${buttonId} ${leafSymbolId} ${leafNameid}`}
        role="button"
        className="overlay-container"
      >
        <Replace>
          <title>{isUpgradeDropzone ? 'Upgrade' : 'Deploy on'}</title>
        </Replace>
      </div>
      <div
        key="card-list"
        role="list"
        className="splay-row in-zone"
        style={{
          '--hand-size': 0,
        }}
      >
        {isUpgraded ? (
          <div className="stacking peeking">
            <LilyPad
              symbolId={leafSymbolId}
              nameId={leafNameid}
              isHome={isHome}
              owner={controller}
              isLeaf
            />
          </div>
        ) : (
          <div className="stacking">
            <CardBack
              id={leafSymbolId}
              key="facedown-card"
              player={controller}
              isLeaf
            />
          </div>
        )}
        {units.map((_, i) => (
          <div key={i} className="stacking peeking">
            <Froglet owner={controller} isOnLeaf />
          </div>
        ))}
      </div>
    </div>
  ) : (
    <div
      className={`zone ${Player.STYLES[controller]}`}
      role="gridcell"
      aria-colindex={position.x}
    >
      <div
        key="card-list"
        role="list"
        className="splay-row in-zone"
        style={{
          '--hand-size': 0,
        }}
      >
        {isUpgraded ? (
          // TODO 9: Implement a non-splay-row hack to display cards on leaves
          <div className="stacking peeking">
            <LilyPad
              symbolId={leafSymbolId}
              nameId={leafNameid}
              isHome={isHome}
              owner={controller}
              isLeaf
            />
          </div>
        ) : (
          <div className="stacking">
            <CardBack
              id={leafSymbolId}
              key="facedown-card"
              player={controller}
              isLeaf
            />
          </div>
        )}
        {units.map((_, i) => (
          <div key={i} className="stacking peeking">
            <Froglet owner={controller} isOnLeaf />
          </div>
        ))}
      </div>
    </div>
  );
}
