import { Replace } from 'lucide-react';
import { useId, useCallback } from 'react';

import { CardBack, Froglet, LilyPad } from './Card';
import { type UnitClass } from './card-types';
import { Position } from './Grid';
import { Player, Subphase, type FlowState } from './PhaseTracker';

export type ZoneState = Readonly<{
  // TODO 9: UnitCard[]
  units: readonly UnitClass[];
  isUpgraded: boolean;
  // TODO 10: Controller in ZoneState
}>;

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
  zone: { isUpgraded, units },
  onPlace,
}: ZoneProps) {
  const handleClick = useCallback(() => onPlace(position), [position, onPlace]);
  const isUpgradeDropzone =
    subphase === Subphase.Upgrading && !isUpgraded && player === controller;
  const isDeployDropzone =
    subphase === Subphase.Deploying && position.y === Position.HOME[player].y;
  // 9: Activation dropzone
  const isHome = Position.equals(Position.HOME[controller], position);
  const buttonId = useId();
  const leafNameId = useId();
  const leafSymbolId = useId();
  const isDropzone = isUpgradeDropzone || isDeployDropzone;

  return (
    <div
      role="gridcell"
      aria-colindex={position.x}
      className={`${isDropzone ? 'dropzone' : ''} zone ${Player.STYLES[controller]}`}
      onClick={isDropzone ? handleClick : undefined}
      tabIndex={isDropzone ? 0 : undefined}
    >
      {isDropzone && (
        <div
          id={buttonId}
          aria-labelledby={`${buttonId} ${leafSymbolId} ${leafNameId}`}
          role="button"
          className="overlay-container"
        >
          <Replace>
            <title>{isUpgradeDropzone ? 'Upgrade' : 'Deploy on'}</title>
          </Replace>
        </div>
      )}
      <div
        key="card-list"
        role="list"
        className="splay-row in-zone"
        style={{
          '--hand-size': 0,
        }}
      >
        {isUpgraded ? (
          // TODO 11: Implement a non-splay-row hack to display cards on leaves
          // TODO 10: Controller based on ZoneState not on position
          <div className="stacking peeking">
            <div
              role="listitem"
              className={`highlighting-card ${Player.STYLES[controller]}`}
            >
              <LilyPad
                symbolId={leafSymbolId}
                nameId={leafNameId}
                isHome={isHome}
                player={controller}
                isLeaf
              />
            </div>
          </div>
        ) : (
          <div className="stacking">
            <CardBack
              iconId={leafSymbolId}
              key="facedown-card"
              player={controller}
              isLeaf
            />
          </div>
        )}
        {units.map((_, i) => (
          // TODO 9: Click to activate a unit
          <div key={`Froglet-${i}`} className="stacking peeking">
            <div
              role="listitem"
              className={`highlighting-card pickable-card ${Player.STYLES[controller]}`}
            >
              {
                // TODO 9: controller based on card not on zone position
              }
              <Froglet player={controller} isOnLeaf />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
