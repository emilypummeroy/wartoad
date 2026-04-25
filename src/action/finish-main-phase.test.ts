import {
  activationOf,
  createStateWith,
  gameflowOf,
  pickedCardOf,
} from '../state/test-utils';
import { CardClass, CardKey } from '../types/card';
import { Phase, Player, Subphase } from '../types/gameflow';
import type { Position } from '../types/position';
import { finishMainPhase } from './finish-main-phase';

const { Idle, Upgrading, Deploying, Activating } = Subphase;
const { North, South } = Player;
const { Froglet, LilyPad } = CardKey;
const { Start, Main, End } = Phase;

type Preconditions = [Player, Phase, Subphase];
type Inputs = [Player];

describe(finishMainPhase, () => {
  // Preconditions:
  describe.for<[...Preconditions, CardKey?, Position?]>([
    // < subphase = Idle
    [North, Main, Upgrading, Froglet],
    [North, Main, Deploying, LilyPad],
    [North, Main, Activating, undefined, { x: 0, y: 4 }],
    [South, Main, Upgrading, Froglet],
    [South, Main, Deploying, LilyPad],
    [South, Main, Activating, undefined, { x: 1, y: 1 }],

    // < phase = Main
    [North, Start, Idle],
    [North, End, Idle],
    [South, Start, Idle],
    [South, End, Idle],
  ])(
    'Precondition failed: need Main & Idle | %s %s %s',
    ([player, phase, subphase, cardKey, position]) => {
      const cardClass = cardKey && CardClass[cardKey];
      it('should not change state', () => {
        const old = createStateWith({
          ...gameflowOf(player, subphase, phase),
          ...(subphase === Activating
            ? activationOf(position)
            : pickedCardOf(cardClass)),
        });
        expect(finishMainPhase()(old)).toStrictEqual(old);
      });
    },
  );

  // Postconditions:
  describe.for<Inputs>([[North], [South]])(
    'Postconditions | %s %s | drawing %s',
    ([player]) => {
      const before = createStateWith(gameflowOf(player, Idle, Main));

      // > old.phase = Main -> phase = End
      it('should go to the End phase', () => {
        const after = finishMainPhase()(before);
        expect(after.flow.phase).toBe(End);
      });

      // > old.phase = Main -> player unchanged
      it('should not change the player', () => {
        const after = finishMainPhase()(before);
        expect(after.flow.player).toBe(player);
      });

      // > old.phase = Main -> hands unchanged
      it('should not change the hands', () => {
        const after = finishMainPhase()(before);
        expect(after.northHand).toBe(before.northHand);
        expect(after.southHand).toBe(before.southHand);
      });
    },
  );
});
