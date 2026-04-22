import { useContext } from 'react';

import { GameContext } from '../context/GameContext';
import { getPondStateAt, HOME, type PondState } from '../state/pond';
import { PLAYER_CLASSNAME, type Player } from '../types/gameflow';
import { positionsAreEqual, type Position } from '../types/position';
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
  readonly controller: Player;
};
export function PondLeafCard({
  leafSymbolId,
  leafNameId,
  position,
  controller,
}: PondLeafCardProps) {
  const context: PondLeafCardContext = useContext(GameContext);
  const { isUpgraded } = getPondStateAt(context[0].pond, position);
  const isHome = positionsAreEqual(HOME[controller], position);
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
