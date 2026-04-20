import { Replace } from 'lucide-react';
import { useId, useCallback, useContext } from 'react';

import { CardBack, Froglet, LilyPad } from '../base/Card';
import { GameContext } from '../context/GameContext';
import { HOME, type ZoneState } from '../state/pond';
import type { UnitCard } from '../types/card';
import {
  Phase,
  PLAYER_CLASSNAME,
  Subphase,
  type Gameflow,
  type Player,
} from '../types/gameflow';
import { positionsAreEqual, type Position } from '../types/position';

type ZoneProps = {
  readonly controller: Player;
  readonly position: Position;
  readonly zone: ZoneState;
  // TODO 9: Get from context
  // TODO 9: onUpgrade, onDeploy, onCommitActivation
  readonly onPlace: (position: Position) => void;
};

type ZoneContext = readonly [
  {
    flow: { subphase: Subphase; phase: Phase; player: Player };
  },
  {},
];

export function Zone({
  zone: { isUpgraded, units },
  controller,
  position,
  onPlace,
}: ZoneProps) {
  const [
    {
      flow: { subphase, phase, player },
    },
  ]: ZoneContext = useContext(GameContext);
  const handleClick = useCallback(() => onPlace(position), [position, onPlace]);
  const isUpgradeDropzone =
    phase === Phase.Main &&
    subphase === Subphase.Upgrading &&
    player === controller &&
    !isUpgraded;
  const isDeployDropzone =
    phase === Phase.Main &&
    subphase === Subphase.Deploying &&
    position.y === HOME[player].y;
  // TODO 9: Activation dropzone
  const isHome = positionsAreEqual(HOME[controller], position);
  const buttonId = useId();
  const leafNameId = useId();
  const leafSymbolId = useId();
  const isDropzone = isUpgradeDropzone || isDeployDropzone;

  return (
    <div
      role="gridcell"
      aria-colindex={position.x}
      className={`${isDropzone ? 'dropzone' : ''} zone ${PLAYER_CLASSNAME[controller]}`}
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
              className={`highlighting-card ${PLAYER_CLASSNAME[controller]}`}
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
        {units.map(card => (
          <ZoneUnit key={card.key} card={card} position={position} />
        ))}
      </div>
    </div>
  );
}

type ZoneUnitContext = readonly [
  { flow: Gameflow },
  {
    readonly activate: (unit: UnitCard, position: Position) => void;
  },
];
type ZoneUnitProps = { readonly card: UnitCard; readonly position: Position };

const ZoneUnit = ({ card, position }: ZoneUnitProps) => {
  const [
    {
      flow: { player, phase, subphase },
    },
    { activate },
  ]: ZoneUnitContext = useContext(GameContext);
  const buttonId = useId();
  const symbolId = useId();
  const nameId = useId();
  const handleClick = useCallback(
    () => activate(card, position),
    [card, position, activate],
  );
  // TODO 9: no activation outside main phase
  const canActivate =
    player === card.owner && phase === Phase.Main && subphase === Subphase.Idle;
  return canActivate ? (
    <div className="stacking peeking">
      <div
        role="button"
        aria-labelledby={`${buttonId} ${symbolId} ${nameId}`}
        id={buttonId}
        aria-label="Activate"
        tabIndex={0}
        onClick={handleClick}
        className={`highlighting-card pickable-card ${PLAYER_CLASSNAME[card.owner]}`}
      >
        <Froglet
          nameId={nameId}
          symbolId={symbolId}
          player={card.owner}
          isOnLeaf
        />
      </div>
    </div>
  ) : (
    <div className="stacking peeking">
      <div
        role="listitem"
        className={`highlighting-card ${PLAYER_CLASSNAME[card.owner]}`}
      >
        <Froglet
          nameId={nameId}
          symbolId={symbolId}
          player={card.owner}
          isOnLeaf
        />
      </div>
    </div>
  );
};
