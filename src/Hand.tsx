import './App.css';
import {
  Leaf,
  Heart,
  Move,
  Crosshair,
  Sword,
  Book,
  BookPlus,
  Diamond,
  DiamondPlus,
  Battery,
  BatteryPlus,
  Package,
  PackagePlus,
  Circle,
  CirclePlus,
  ListFilter,
  ListFilterPlus,
} from 'lucide-react';
import { useCallback, useId } from 'react';

import {
  CardClass,
  type UnitStats,
  type LeafStats,
  type CardKey,
} from './card-types';

export {
  // Amphibeans
  // Tadpoles
  Circle,
  CirclePlus,
  // Research
  Book,
  BookPlus,
  // Food
  Diamond,
  DiamondPlus,

  // Bugs
  // Energy
  Battery,
  BatteryPlus,
  // Matter
  Package,
  PackagePlus,

  // Deep ones
  // Zeal
  ListFilter,
  ListFilterPlus,
};

import { Player } from './PhaseTracker';

export const INITIAL_HAND_SIZE = 7;
export const SMALL_HAND_SIZE = 8;
export const BIG_HAND_HAND_SIZE = 12;

function UnitStats({
  stats: { power, range, speed, life },
}: {
  readonly stats: UnitStats;
}) {
  return (
    <div className="card-section-column">
      <div className="card-item">
        <span>{power}</span>{' '}
        <Sword>
          <title>Power</title>
        </Sword>
      </div>
      <div className="card-item">
        <span>{range}</span>{' '}
        <Crosshair>
          <title>Range</title>
        </Crosshair>
      </div>
      <div className="card-item">
        <span>{speed}</span>{' '}
        <Move>
          <title>Speed</title>
        </Move>
      </div>
      <div className="card-item">
        <span>{life}</span>{' '}
        <Heart>
          <title>Life</title>
        </Heart>
      </div>
    </div>
  );
}

function LeafStats({ stats: { gives } }: { readonly stats: LeafStats }) {
  return (
    <div className="card-section-row">
      <div className="card-item">
        <small>Gives:</small>+{gives}
      </div>
    </div>
  );
}

export function LilyPad({ titleId }: { readonly titleId?: string }) {
  const id = useId();
  const titleIdFallback = useId();
  return (
    <section
      id={id}
      aria-labelledby={`${id} ${titleId ?? titleIdFallback}`}
      aria-label="Card face of"
      className="card"
    >
      <div className="card-title" id={titleId ?? titleIdFallback}>
        Lily Pad
      </div>
      <div className="card-section-row">
        <div className="card-item">
          <small>Cost:</small>0
        </div>
      </div>
      <LeafStats stats={CardClass.LilyPad.details} />
    </section>
  );
}

export function Froglet({ titleId }: { readonly titleId?: string }) {
  const id = useId();
  const titleIdFallback = useId();
  return (
    <section
      id={id}
      aria-labelledby={`${id} ${titleId ?? titleIdFallback}`}
      aria-label="Card face of"
      className="card"
    >
      <div className="card-title" id={titleId ?? titleIdFallback}>
        Froglet
      </div>
      <div className="card-section-split">
        <UnitStats stats={CardClass.Froglet.details} />
        <div className="card-section-fill">
          <div className="card-item">
            <small>Cost:</small>0
          </div>
        </div>
      </div>
    </section>
  );
}

const CardBack = () => {
  const id = useId();
  return (
    <section aria-labelledby={id} className="facedown card">
      <Leaf>
        <title id={id}>Card back</title>
      </Leaf>
    </section>
  );
};

type HandCardProps = Readonly<{
  isEnabled?: boolean;
  cardClass: CardClass;
  player: Player;
  onPick: (cardKey: CardClass) => void;
}>;
function HandCard({
  isEnabled = false,
  cardClass,
  player,
  onPick,
}: HandCardProps) {
  const playerStyle = {
    [Player.North]: 'north',
    [Player.South]: 'south',
  }[player];
  const handleClick = useCallback(() => onPick(cardClass), [cardClass, onPick]);
  const buttonId = useId();
  const titleId = useId();
  return (
    <div className="stacking jiggling">
      {isEnabled ? (
        <div
          role="button"
          aria-labelledby={`${buttonId} ${titleId}`}
          id={buttonId}
          aria-label="Pick"
          tabIndex={0}
          className={`highlighting-card pickable-card ${playerStyle}`}
          onClick={handleClick}
        >
          {cardClass === CardClass.Froglet ? (
            <Froglet titleId={titleId} />
          ) : (
            <LilyPad titleId={titleId} />
          )}
        </div>
      ) : (
        <div tabIndex={0} className={`highlighting-card ${playerStyle}`}>
          {cardClass === CardClass.Froglet ? (
            <Froglet titleId={titleId} />
          ) : (
            <LilyPad titleId={titleId} />
          )}
        </div>
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
  handCards: readonly CardClass[];
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
  const playerStyle = {
    [Player.North]: 'north',
    [Player.South]: 'south',
  }[player];
  const countsSoFar: Partial<Record<CardKey, number>> = {};

  return (
    <section className="hand" aria-labelledby={id}>
      <h3 id={id} className={playerStyle}>
        {player} hand
      </h3>
      <div
        className={`${isPlayerTurn ? 'jiggle-row' : 'splay-row'} ${classForHand(handCards)}`}
        style={{
          '--hand-size': `${handCards.length}`,
        }}
      >
        {handCards.map((cardClass: CardClass) => {
          const i = countsSoFar[cardClass.key] ?? 0;
          countsSoFar[cardClass.key] = i + 1;

          return isPlayerTurn ? (
            <HandCard
              key={`${cardClass.key} ${i}`}
              cardClass={cardClass}
              player={player}
              isEnabled={isMainPhase && !isPlacing}
              onPick={onPick}
            />
          ) : (
            <div key={`${cardClass.key} ${i}`} className="stacking">
              <CardBack />
            </div>
          );
        })}
      </div>
    </section>
  );
}
