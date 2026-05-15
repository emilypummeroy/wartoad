import { useCallback, useId } from 'react';

import { CardLocation, CardType, type CardState } from '@/types/card';
import { Phase, type Player, PLAYER_CLASSNAME } from '@/types/gameflow';
import { CardBack, Froglet, LeafCard } from '@/view/Card';

export const INITIAL_HAND_SIZE = 7;
export const SMALL_HAND_SIZE = 8;
export const BIG_HAND_HAND_SIZE = 12;

type HandProps = Readonly<{
  player: Player;
  funds: number;
  phase: Phase;
  isPlayerTurn: boolean;
  handCards: readonly CardState[];
  onPick: (cardClass: CardState) => void;
}>;
export function Hand({
  player,
  funds,
  phase,
  isPlayerTurn,
  handCards,
  onPick,
}: HandProps) {
  const id = useId();
  const isActivePhase =
    phase === Phase.Upgrading ||
    phase === Phase.Deploying ||
    phase === Phase.Activating;
  const listClass = isActivePhase
    ? 'stack-row'
    : phase === Phase.Main && isPlayerTurn
      ? 'jiggle-row'
      : 'splay-row';

  return (
    <section className="hand" aria-labelledby={id}>
      <div className="player-stats">
        <h3 id={id} className={PLAYER_CLASSNAME[player]}>
          {player}
        </h3>
        Funds: {funds}
      </div>
      <div
        role="list"
        className={`${listClass} ${classForHand(handCards)}`}
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
                isEnabled={phase === Phase.Main}
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

type HandCardProps = Readonly<{
  isEnabled?: boolean;
  card: CardState;
  player: Player;
  onPick: (cardKey: CardState) => void;
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
      {
        // TODO 21: Check cost
        card.type === CardType.Unit && <Froglet nameId={titleId} />
      }
      {
        // TODO 19: Check cost
        card.type === CardType.Leaf && (
          <LeafCard leaf={card} location={CardLocation.Hand} nameId={titleId} />
        )
      }
    </div>
  ) : (
    <div
      role="listitem"
      aria-labelledby={titleId}
      tabIndex={0}
      className={`highlighting-card ${PLAYER_CLASSNAME[player]}`}
    >
      {card.type === CardType.Unit && <Froglet nameId={titleId} />}
      {card.type === CardType.Leaf && (
        <LeafCard leaf={card} location={CardLocation.Hand} nameId={titleId} />
      )}
    </div>
  );
}

export const classForHand = (cards: readonly unknown[]): string => {
  if (cards.length <= SMALL_HAND_SIZE) return '';
  if (cards.length <= BIG_HAND_HAND_SIZE) return 'compact';
  return 'super-compact';
};
