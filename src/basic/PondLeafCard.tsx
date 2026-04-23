import { useContext } from 'react';

import { GameContext } from '../context/GameContext';
import { getPondStateAt, HOME, type PondState } from '../state/pond';
import { PLAYER_CLASSNAME } from '../types/gameflow';
import { arePositionsEqual, type Position } from '../types/position';
import { CardBack, LilyPad } from '../view/Card';

type PondLeafCardContext = readonly [
  {
    pond: PondState;
  },
  unknown,
];
type PondLeafCardProps = {
  readonly leafSymbolId: string;
  readonly leafNameId: string;
  readonly position: Position;
};
export function PondLeafCard({
  leafSymbolId,
  leafNameId,
  position,
}: PondLeafCardProps) {
  const [{ pond }]: PondLeafCardContext = useContext(GameContext);
  const { controller, isUpgraded } = getPondStateAt(pond, position);
  const isHome = arePositionsEqual(HOME[controller], position);
  return isUpgraded ? (
    // TODO 11: Implement a non-splay-row hack to display cards on leaves
    // TODO 10: Set the controller based on ZoneState not on position
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
  );
}
