import { Replace } from 'lucide-react';
import { useId, useCallback } from 'react';

import { CardBack, Froglet, LilyPad } from './Card';
import { type UnitCard } from './card-types';
import { Player, Subphase, type FlowState } from './PhaseTracker';
import { type Position, HOME, positionsEqual } from './position';

export type ZoneState = Readonly<{
  units: readonly UnitCard[];
  isUpgraded: boolean;
  // TODO 10: Controller in ZoneState
}>;

type ZoneProps = Readonly<{
  flow: FlowState;
  controller: Player;
  position: Position;
  zone: ZoneState;
  // TODO 9: Get from context
  // TODO 9: onUpgrade, onDeploy, onCommitActivation
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
    subphase === Subphase.Deploying && position.y === HOME[player].y;
  // TODO 9: Activation dropzone
  const isHome = positionsEqual(HOME[controller], position);
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
        {units.map(({ key, owner }) => (
          // TODO 9: Click to activate a unit
          <div key={key} className="stacking peeking">
            <div
              role="listitem"
              className={`highlighting-card pickable-card ${Player.STYLES[controller]}`}
            >
              <Froglet player={owner} isOnLeaf />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
