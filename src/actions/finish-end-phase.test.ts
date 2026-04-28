import {
  createStateWith,
  gameflowOf,
  phaseStateOf,
  winningPondOf,
} from '../state/test-utils';
import { Phase, Player, PLAYER_AFTER } from '../types/gameflow';
import { finishEndPhase } from './finish-end-phase';

const { North, South } = Player;
const { Upgrading, Deploying, Activating, Start, Main, End, GameOver } = Phase;

type Preconditions = [Player, Phase, winner?: Player];
type Inputs = [Player];

describe(finishEndPhase, () => {
  // Preconditions:
  describe.for<Preconditions>([
    // < phase = End
    [North, Start],
    [North, Main],
    [North, Upgrading],
    [North, Deploying],
    [North, Activating],
    [North, GameOver, North],
    [North, GameOver, South],
    [South, Start],
    [South, Main],
    [South, Upgrading],
    [South, Deploying],
    [South, Activating],
    [North, GameOver, North],
    [North, GameOver, South],
  ])(
    'Precondition failed: need End phase | %s %s | winner %s',
    ([player, phase, winner]) => {
      it('should not change state', () => {
        const before = createStateWith({
          ...gameflowOf(player, phase),
          ...phaseStateOf(player, phase),
          ...winningPondOf(winner),
        });
        expect(finishEndPhase()(before)).toStrictEqual(before);
      });
    },
  );

  // Postconditions:
  describe.for<Inputs>([[North], [South]])(
    'Postconditions | %s %s | drawing %s',
    ([player]) => {
      const before = createStateWith(gameflowOf(player, End));

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
