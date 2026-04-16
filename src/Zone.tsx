import { Replace, Leaf, Clover, Eye } from 'lucide-react';
import { useId, useCallback } from 'react';

import { CardClass, type UnitClass } from './card-types';
import { Position } from './Grid';
import { UnitStatsDisplay } from './Hand';
import { Player, Subphase, type FlowState } from './PhaseTracker';

export type ZoneState = Readonly<{
  units: readonly UnitClass[];
  isUpgraded: boolean;
}>;

function LilyPad({
  owner,
  isHome = false,
  nameId,
  symbolId,
}: {
  readonly owner: Player;
  readonly nameId: string;
  readonly symbolId: string;
  readonly isHome?: boolean;
}) {
  const playerStyle = {
    [Player.North]: 'north',
    [Player.South]: 'south',
  }[owner];
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

export function Froglet({ owner }: { readonly owner: Player }) {
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
        Froglet
      </div>
      <div className="card-section-split">
        <UnitStatsDisplay stats={CardClass.Froglet.details} />
        <div className="card-section-fill">
          <Eye>
            <title id={symbolId}>{owner} controlled</title>
          </Eye>
        </div>
      </div>
    </section>
  );
}

function Facedown({
  player,
  id,
}: {
  readonly id: string;
  readonly player: Player;
}) {
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
            />
          </div>
        ) : (
          <div className="stacking">
            <Facedown
              id={leafSymbolId}
              key="facedown-card"
              player={controller}
            />
          </div>
        )}
        {units.map((_, i) => (
          <div key={i} className="stacking peeking">
            <Froglet owner={controller} />
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
            />
          </div>
        ) : (
          <div className="stacking">
            <Facedown
              id={leafSymbolId}
              key="facedown-card"
              player={controller}
            />
          </div>
        )}
        {units.map((_, i) => (
          <div key={i} className="stacking peeking">
            <Froglet owner={controller} />
          </div>
        ))}
      </div>
    </div>
  );
}
