import { useCallback, useContext, useId } from 'react';

import { GameContext } from '../context/GameContext';
import type { Read } from '../types';
import type { UnitCard } from '../types/card';
import {
  Phase,
  PLAYER_CLASSNAME,
  Subphase,
  type Gameflow,
} from '../types/gameflow';
import type { Position } from '../types/position';
import { Froglet } from '../view/Card';

type PondUnitCardContext = [
  { flow: Gameflow },
  {
    activate: (unit: UnitCard, position: Position) => void;
  },
];
type PondUnitCardProps = {
  card: UnitCard;
  position: Position;
};

export const PondUnitCard = ({ card, position }: Read<PondUnitCardProps>) => {
  const [
    {
      flow: { player, phase, subphase },
    },
    { activate },
  ]: PondUnitCardContext = useContext(GameContext);
  const buttonId = useId();
  const symbolId = useId();
  const nameId = useId();
  const handleClick = useCallback(
    () => activate(card, position),
    [card, position, activate],
  );
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
