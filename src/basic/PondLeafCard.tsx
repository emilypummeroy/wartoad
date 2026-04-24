import { useContext } from 'react';

import { GameContext } from '../context/GameContext';
import type { PondState } from '../state-types/pond';
import { getPondStateAt, HOME } from '../state-types/pond';
import { PLAYER_CLASSNAME } from '../types/gameflow';
import type { Position } from '../types/position';
import { arePositionsEqual } from '../types/position';
import { CardBack, LilyPad } from '../view/Card';

type PondLeafCardSlice = [
  {
    pond: PondState;
  },
  unknown,
];
type PondLeafCardProps = Readonly<{
  leafSymbolId: string;
  leafNameId: string;
  position: Position;
}>;
export function PondLeafCard({
  leafSymbolId,
  leafNameId,
  position,
}: PondLeafCardProps) {
  const [{ pond }]: PondLeafCardSlice = useContext(GameContext);
  const { controller, isUpgraded } = getPondStateAt(pond, position);
  const isHome = arePositionsEqual(HOME[controller], position);
  return isUpgraded ? (
    // TODO 11: Implement a non-splay-row hack to display cards on leaves
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
