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
import { useId } from 'react';

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
export const BIG_HAND_CARD_COUNT = 12;

type UnitStats = {
  readonly life: number;
  readonly movement: number;
  readonly power: number;
  readonly range: number;
};
function UnitStats({ life, movement, power, range }: UnitStats) {
  return (
    <div className="card-section-column">
      <div className="card-item">
        <span>{life}</span>{' '}
        <Heart>
          <title>Life</title>
        </Heart>
      </div>
      <div className="card-item">
        <span>{movement}</span>{' '}
        <Move>
          <title>Movement</title>
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

export function LilyPad() {
  const id = useId();
  const titleId = useId();
  return (
    <section
      id={id}
      aria-labelledby={`${id} ${titleId}`}
      aria-label="Card face"
      className="card"
    >
      <div className="card-title" id={titleId}>
        Lily Pad
      </div>
      <div className="card-section-row">
        <div className="card-item">
          <small>Cost:</small>0
        </div>
      </div>
      <div className="card-section-row">
        <div className="card-item">
          <small>Gives:</small>+0
        </div>
      </div>
    </section>
  );
}

export function Froglet() {
  const id = useId();
  const titleId = useId();
  return (
    <section
      id={id}
      aria-labelledby={`${id} ${titleId}`}
      aria-label="Card face"
      className="card"
    >
      <div className="card-title" id={titleId}>
        Froglet
      </div>
      <div className="card-section-split">
        <UnitStats life={1} movement={1} power={0} range={0} />
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
  onPick: () => void;
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
  return (
    <div className="stacking jiggling">
      {isEnabled ? (
        <div
          role="button"
          tabIndex={0}
          className={`highlighting-card pickable-card ${playerStyle}`}
          onClick={onPick}
        >
          {isFroglet ? <Froglet /> : <LilyPad />}
        </div>
      ) : (
        <div tabIndex={0} className={`highlighting-card ${playerStyle}`}>
          {isFroglet ? <Froglet /> : <LilyPad />}
        </div>
      )}
    </div>
  );
}

export const classForHandSize = (n: number): string => {
  if (n <= INITIAL_HAND_CARD_COUNT) return '';
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
  onPick: () => void;
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
        className={`${isPlayerTurn ? 'jiggle-row' : 'splay-row'} ${classForHandSize(hasFroglet ? 1 : 0)}`}
        style={{
          '--hand-size': `${handSize + (hasFroglet ? 1 : 0)}`,
        }}
      >
        {isPlayerTurn && hasFroglet && (
          <HandCard isFroglet player={player} onPick={() => {}} />
        )}
        {Array.from(
          { length: isPlayerTurn && hasFroglet ? handSize - 1 : handSize },
          (_, i) =>
            isPlayerTurn ? (
              <HandCard
                key={i}
                player={player}
                isEnabled={isMainPhase && !isPlacing}
                onPick={onPick}
              />
            ) : (
              <div key={i} className="stacking ">
                <CardBack />
              </div>
            ),
        )}
      </div>
    </section>
  );
}
