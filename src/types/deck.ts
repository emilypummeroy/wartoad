import type {
  CardClass,
  CardClassOf,
  CardState,
  CardStateOf,
  CardType,
  Leaf,
  Unit,
} from './card';
import type { Player } from './gameflow';

export type Tutor = (player: Player) => (cardClass: CardClass) => CardState;
export type LeafTutor = TutorOf<Leaf>;
export type UnitTutor = TutorOf<Unit>;
export type TutorOf<T extends CardType = CardType> = (
  player: Player,
) => (cardClass: CardClassOf<T>) => CardStateOf<T>;

export type Draw = (player: Player) => () => CardState;
