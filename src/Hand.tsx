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

import { CardClass, type UnitDetails, type LeafDetails } from './card-types';

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

export const INITIAL_HAND_CARD_COUNT = 7;
export const SMALL_HAND_CARD_COUNT = 8;
export const BIG_HAND_CARD_COUNT = 12;

function UnitStats({
  stats: { life, speed, power, range },
}: {
  readonly stats: UnitDetails;
}) {
  return (
    <div className="card-section-column">
      <div className="card-item">
        <span>{life}</span>{' '}
        <Heart>
          <title>Life</title>
        </Heart>
      </div>
      <div className="card-item">
        <span>{speed}</span>{' '}
        <Move>
          <title>Speed</title>
        </Move>
      </div>
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
    </div>
  );
}

function LeafStats({ stats: { gives } }: { readonly stats: LeafDetails }) {
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
  isFroglet?: boolean;
  player: Player;
  onPick: (isFroglet: boolean) => void;
}>;
function HandCard({
  isEnabled = false,
  isFroglet = false,
  player,
  onPick,
}: HandCardProps) {
  const playerStyle = {
    [Player.North]: 'north',
    [Player.South]: 'south',
  }[player];
  const handleClick = useCallback(() => onPick(isFroglet), [isFroglet, onPick]);
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
          {isFroglet ? (
            <Froglet titleId={titleId} />
          ) : (
            <LilyPad titleId={titleId} />
          )}
        </div>
      ) : (
        <div tabIndex={0} className={`highlighting-card ${playerStyle}`}>
          {isFroglet ? (
            <Froglet titleId={titleId} />
          ) : (
            <LilyPad titleId={titleId} />
          )}
        </div>
      )}
    </div>
  );
}

export const classForHandSize = (n: number): string => {
  if (n <= SMALL_HAND_CARD_COUNT) return '';
  if (n <= BIG_HAND_CARD_COUNT) return 'compact';
  return 'super-compact';
};

type HandProps = Readonly<{
  player: Player;
  isMainPhase: boolean;
  isPlayerTurn: boolean;
  isPlacing: boolean;
  hasFroglet?: boolean;
  handSize: number;
  onPick: (isFroglet: boolean) => void;
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
  hasFroglet = false,
  handSize,
  onPick,
}: HandProps) {
  const id = useId();
  const playerStyle = {
    [Player.North]: 'north',
    [Player.South]: 'south',
  }[player];

  return (
    <section className="hand" aria-labelledby={id}>
      <h3 id={id} className={playerStyle}>
        {player} hand
      </h3>
      <div
        className={`${isPlayerTurn ? 'jiggle-row' : 'splay-row'} ${classForHandSize(handSize)}`}
        style={{
          '--hand-size': `${handSize}`,
        }}
      >
        {hasFroglet &&
          (isPlayerTurn ? (
            <HandCard
              isFroglet
              player={player}
              isEnabled={isMainPhase && !isPlacing}
              onPick={onPick}
            />
          ) : (
            <div className="stacking">
              <CardBack />
            </div>
          ))}
        {Array.from({ length: hasFroglet ? handSize - 1 : handSize }, (_, i) =>
          isPlayerTurn ? (
            <HandCard
              key={i}
              player={player}
              isEnabled={isMainPhase && !isPlacing}
              onPick={onPick}
            />
          ) : (
            <div key={i} className="stacking">
              <CardBack />
            </div>
          ),
        )}
      </div>
    </section>
  );
}
