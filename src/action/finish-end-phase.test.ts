import { createStateWith, gameflowOf } from '../state/test-utils';
import { Phase, Player, PLAYER_AFTER } from '../types/gameflow';
import { finishEndPhase } from './finish-end-phase';

const { North, South } = Player;
const { Start, Main, End } = Phase;

type Preconditions = [Player, Phase];
type Inputs = [Player];

describe(finishEndPhase, () => {
  // Preconditions:
  describe.for<[...Preconditions]>([
    // < phase = End
    [North, Start],
    [North, Main],
    [South, Start],
    [South, Main],
  ])('Precondition failed: need End phase | %s %s', ([player, phase]) => {
    it('should not change state', () => {
      const old = createStateWith(gameflowOf(player, undefined, phase));
      expect(finishEndPhase()(old)).toStrictEqual(old);
    });
  });

  // Postconditions:
  // TODO 10: old.phase = End & p of positions: cancapture(p) -> capture(p, player)
  describe.for<Inputs>([[North], [South]])(
    'Postconditions | %s %s | drawing %s',
    ([player]) => {
      const before = createStateWith(gameflowOf(player, undefined, End));

      // > old.phase = End -> phase = Start
      it('should go to the Start phase', () => {
        const after = finishEndPhase()(before);
        expect(after.flow.phase).toBe(Start);
      });

      // > old.phase = End -> player = after(old.player)
      it(`should start the ${PLAYER_AFTER[player]} turn`, () => {
        const after = finishEndPhase()(before);
        expect(after.flow.player).toBe(PLAYER_AFTER[player]);
      });

      // > old.phase = End -> hands unchanged
      it('should not change the hands', () => {
        const after = finishEndPhase()(before);
        expect(after.northHand).toBe(before.northHand);
        expect(after.southHand).toBe(before.southHand);
      });
    },
  );
});
