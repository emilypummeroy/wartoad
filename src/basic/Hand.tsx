import { useCallback, useId } from 'react';

import { CardClass, type Card } from '../types/card';
import { type Player, PLAYER_CLASSNAME } from '../types/gameflow';
import { CardBack, Froglet, LilyPad } from '../view/Card';

export const INITIAL_HAND_SIZE = 7;
export const SMALL_HAND_SIZE = 8;
export const BIG_HAND_HAND_SIZE = 12;

type HandCardProps = Readonly<{
  isEnabled?: boolean;
  card: Card;
  player: Player;
  onPick: (cardKey: Card) => void;
}>;
function HandCard({ isEnabled = false, card, player, onPick }: HandCardProps) {
  const handleClick = useCallback(() => onPick(card), [card, onPick]);
  const buttonId = useId();
  const titleId = useId();
  return isEnabled ? (
    <div
      role="button"
      aria-labelledby={`${buttonId} ${titleId}`}
      id={buttonId}
      aria-label="Pick"
      tabIndex={0}
      className={`highlighting-card pickable-card ${PLAYER_CLASSNAME[player]}`}
      onClick={handleClick}
    >
      {card.cardClass === CardClass.Froglet ? (
        <Froglet nameId={titleId} />
      ) : (
        <LilyPad nameId={titleId} />
      )}
    </div>
  ) : (
    <div
      role="listitem"
      aria-labelledby={titleId}
      tabIndex={0}
      className={`highlighting-card ${PLAYER_CLASSNAME[player]}`}
    >
      {card.cardClass === CardClass.Froglet ? (
        <Froglet nameId={titleId} />
      ) : (
        <LilyPad nameId={titleId} />
      )}
    </div>
  );
}

export const classForHand = (cards: readonly unknown[]): string => {
  if (cards.length <= SMALL_HAND_SIZE) return '';
  if (cards.length <= BIG_HAND_HAND_SIZE) return 'compact';
  return 'super-compact';
};

type HandProps = Readonly<{
  player: Player;
  isMainPhase: boolean;
  isPlayerTurn: boolean;
  isPlacing: boolean;
  handCards: readonly Card[];
  onPick: (cardClass: Card) => void;
}>;
declare module 'react' {
  // oxlint-disable-next-line typescript/consistent-type-definitions
  interface CSSProperties {
    // Allow any CSS variable starting with '--'
    // oxlint-disable-next-line typescript/consistent-indexed-object-style
    [key: `--${string}`]: string | number;
  }
}
export function Hand({
  player,
  isMainPhase,
  isPlayerTurn,
  isPlacing,
  handCards,
  onPick,
}: HandProps) {
  const id = useId();
  const isJiggling = isMainPhase && !isPlacing && isPlayerTurn;

  return (
    <section className="hand" aria-labelledby={id}>
      <h3 id={id} className={PLAYER_CLASSNAME[player]}>
        {player} hand
      </h3>
      <div
        role={isJiggling ? 'listbox' : 'list'}
        className={`${isJiggling ? 'jiggle-row' : 'splay-row'} ${classForHand(handCards)}`}
        style={{
          '--hand-size': handCards.length,
        }}
      >
        {handCards.map(card =>
          isPlayerTurn ? (
            <div key={card.key} className="stacking jiggling">
              <HandCard
                card={card}
                player={player}
                isEnabled={isMainPhase && !isPlacing}
                onPick={onPick}
              />
            </div>
          ) : (
            <div key={card.key} className="stacking">
              <CardBack player={player} />
            </div>
          ),
        )}
      </div>
    </section>
  );
}
