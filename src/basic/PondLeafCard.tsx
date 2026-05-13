import { useContext } from 'react';

import { GameContext } from '../context/GameContext';
import { type PondState, getPondStateAt, HOME } from '../state-types/pond';
import { CardLocation } from '../types/card';
import { PLAYER_CLASSNAME } from '../types/gameflow';
import { type Position, arePositionsEqual } from '../types/position';
import { CardBack, LeafCard } from '../view/Card';

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
  const { controller, leaf } = getPondStateAt(pond, position);
  const isHome = arePositionsEqual(HOME[controller], position);
  return leaf ? (
    <div className="leaf showing">
      <div
        role="listitem"
        className={`highlighting-card ${PLAYER_CLASSNAME[controller]}`}
      >
        <LeafCard
          leaf={leaf}
          symbolId={leafSymbolId}
          nameId={leafNameId}
          location={isHome ? CardLocation.Home : CardLocation.Pond}
        />
      </div>
    </div>
  ) : (
    <div className="leaf peeking">
      <CardBack
        iconId={leafSymbolId}
        key="facedown-card"
        player={controller}
        isLeaf
      />
    </div>
  );
}
