import type { GameState } from '../state-types';
import type { CardClass } from '../types/card';
import {
  Phase,
  PHASE_AFTER,
  Player,
  PLAYER_AFTER,
  Subphase,
} from '../types/gameflow';

// TODO 11: test
export const endPhase =
  (draw: () => CardClass) =>
  ({
    flow: { player, phase },
    northHand,
    southHand,
    ...rest
  }: GameState): GameState => ({
    ...rest,
    flow: {
      player: phase === Phase.End ? PLAYER_AFTER[player] : player,
      phase: PHASE_AFTER[phase],
      subphase: Subphase.Idle,
    },
    // TODO 11: Extract to draw function
    northHand:
      PHASE_AFTER[phase] === Phase.Start &&
      PLAYER_AFTER[player] === Player.North
        ? [...northHand, draw()]
        : northHand,
    // TODO 11: Extract to draw function
    southHand:
      PHASE_AFTER[phase] === Phase.Start &&
      PLAYER_AFTER[player] === Player.South
        ? [...southHand, draw()]
        : southHand,
  });
