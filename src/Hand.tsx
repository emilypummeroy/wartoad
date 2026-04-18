import './App.css';
import { useCallback, useId } from 'react';

import { CardBack, Froglet, LilyPad } from './Card';
import { CardClass, type CardKey } from './card-types';
import { Player } from './PhaseTracker';

export const INITIAL_HAND_SIZE = 7;
export const SMALL_HAND_SIZE = 8;
export const BIG_HAND_HAND_SIZE = 12;

type HandCardProps = Readonly<{
  isEnabled?: boolean;
  // TODO 9: use card: Card
  cardClass: CardClass;
  player: Player;
  // TODO 9: use onPick(Card), fix parameter name
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
      className={`highlighting-card pickable-card ${Player.STYLES[player]}`}
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
      className={`highlighting-card ${Player.STYLES[player]}`}
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
  // TODO 9: use Card[]
  handCards: readonly CardClass[];
  // TODO 9: use onPick(Card)
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
  // TODO 9: use central Player.STYLES
  const playerStyle = {
    [Player.North]: 'north',
    [Player.South]: 'south',
  }[player];
  // TODO 9: use card.key instead of counts, can remove the record
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
          // TODO 9: cards instead of cardClasses
          const i = countsSoFar[cardClass.key] ?? 0;
          countsSoFar[cardClass.key] = i + 1;

          // TODO 9: card.key
          // TODO 9: card.owner
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
            // TODO 9: card.key
            // TODO 9: card.owner
            <div key={`${cardClass.key} ${i}`} className="stacking">
              <CardBack player={player} />
            </div>
          );
        })}
      </div>
    </section>
  );
}
