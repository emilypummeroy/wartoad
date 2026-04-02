import './App.css';
import { Pyramid } from 'lucide-react';
import { useId } from 'react';

import { Player } from './App';

export const INITIAL_HAND_CARD_COUNT = 7;
export const BIG_HAND_CARD_COUNT = 12;

type HandCardProps = {
  readonly isPlayerTurn: boolean;
  readonly isMainPhase: boolean;
  readonly playCard: () => void;
};

const BasicField = () => {
  const id = useId();
  return (
    <section aria-labelledby={id} className="card">
      <div id={id}>Basic Field</div>
      <div className="card-line">
        <div>
          <small>Cost:</small>0
        </div>
        <div>
          <small>Gives:</small>+0
        </div>
      </div>
      <div>Home field</div>
    </section>
  );
};

const Facedown = () => {
  const id = useId();
  return (
    <section aria-labelledby={id} className="facedown card">
      <Pyramid>
        <title id={id}>Facedown card</title>
      </Pyramid>
    </section>
  );
};

function HandCard({ isPlayerTurn, isMainPhase, playCard }: HandCardProps) {
  return isPlayerTurn ? (
    <div className="stacking jiggling">
      <button
        className="pickable-card"
        disabled={!isMainPhase}
        onClick={playCard}
      >
        <BasicField />
      </button>
    </div>
  ) : (
    <div className="stacking ">
      <Facedown />
    </div>
  );
}

export const styleForHandSize = (n: number): string => {
  if (n <= INITIAL_HAND_CARD_COUNT) return '';
  if (n <= BIG_HAND_CARD_COUNT) return 'compact';
  return 'super-compact';
};

type HandProps = {
  readonly player: Player;
  readonly isMainPhase: boolean;
  readonly isPlayerTurn: boolean;
  readonly handSize: number;
  readonly playCard: () => void;
};

export function Hand({
  player,
  isMainPhase,
  isPlayerTurn,
  handSize,
  playCard,
}: HandProps) {
  const id = useId();
  const titleStyle = {
    [Player.North]: 'north',
    [Player.South]: 'south',
  }[player];

  return (
    <section className="hand" aria-labelledby={id}>
      <h3 id={id} className={titleStyle}>
        {player} hand
      </h3>
      <div
        className={`${isPlayerTurn ? 'jiggle-row' : 'splay-row'} ${styleForHandSize(handSize)}`}
      >
        {Array.from({ length: handSize }, (_, i) => (
          <HandCard
            key={i}
            isPlayerTurn={isPlayerTurn}
            isMainPhase={isMainPhase}
            playCard={playCard}
          />
        ))}
      </div>
    </section>
  );
}
