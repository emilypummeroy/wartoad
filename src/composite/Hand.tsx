import { useCallback, useId } from 'react';

import { CardBack, Froglet, LilyPad } from '../base/Card';
import { CardClass, type CardKey } from '../types/card-class';
import { Player, PLAYER_CLASSNAME } from '../types/gameflow';

export const INITIAL_HAND_SIZE = 7;
export const SMALL_HAND_SIZE = 8;
export const BIG_HAND_HAND_SIZE = 12;

type HandCardProps = Readonly<{
  isEnabled?: boolean;
  // TODO 11: use card: Card
  cardClass: CardClass;
  player: Player;
  // TODO 11: use onPick(Card), fix parameter name
  onPick: (cardKey: CardClass) => void;
}>;
function HandCard({
  isEnabled = false,
  cardClass,
  player,
  onPick,
}: HandCardProps) {
  const handleClick = useCallback(() => onPick(cardClass), [cardClass, onPick]);
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
      {cardClass === CardClass.Froglet ? (
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
      {cardClass === CardClass.Froglet ? (
        <Froglet nameId={titleId} />
      ) : (
        <LilyPad nameId={titleId} />
      )}
    </div>
  );
}

export const classForHand = (cards: readonly CardClass[]): string => {
  if (cards.length <= SMALL_HAND_SIZE) return '';
  if (cards.length <= BIG_HAND_HAND_SIZE) return 'compact';
  return 'super-compact';
};

type HandProps = Readonly<{
  player: Player;
  isMainPhase: boolean;
  isPlayerTurn: boolean;
  isPlacing: boolean;
  // TODO 11: use Card[]
  handCards: readonly CardClass[];
  // TODO 11: use onPick(Card)
  onPick: (cardClass: CardClass) => void;
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
  // TODO 11: use central Player.STYLES
  const playerStyle = {
    [Player.North]: 'north',
    [Player.South]: 'south',
  }[player];
  // TODO 11: use card.key instead of counts, can remove the record
  const countsSoFar: Partial<Record<CardKey, number>> = {};
  const isJiggling = isMainPhase && !isPlacing && isPlayerTurn;

  return (
    <section className="hand" aria-labelledby={id}>
      <h3 id={id} className={playerStyle}>
        {player} hand
      </h3>
      <div
        role={isJiggling ? 'listbox' : 'list'}
        className={`${isJiggling ? 'jiggle-row' : 'splay-row'} ${classForHand(handCards)}`}
        style={{
          '--hand-size': handCards.length,
        }}
      >
        {handCards.map((cardClass: CardClass) => {
          // TODO 11: card.key instead of counts
          const i = countsSoFar[cardClass.key] ?? 0;
          countsSoFar[cardClass.key] = i + 1;

          // TODO 11: card.key
          // TODO 11: card.owner
          return isPlayerTurn ? (
            <div key={`${cardClass.key} ${i}`} className="stacking jiggling">
              <HandCard
                cardClass={cardClass}
                player={player}
                isEnabled={isMainPhase && !isPlacing}
                onPick={onPick}
              />
            </div>
          ) : (
            // TODO 11: card.key
            // TODO 11: card.owner
            <div key={`${cardClass.key} ${i}`} className="stacking">
              <CardBack player={player} />
            </div>
          );
        })}
      </div>
    </section>
  );
}
