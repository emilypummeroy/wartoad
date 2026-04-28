import { draw } from '../state-types/card.test-utils';
import {
  createStateWith,
  gameflowOf,
  subphaseStateOf,
  winningPondOf,
} from '../state/test-utils';
import { CardClass, CardKey } from '../types/card';
import { Phase, Player, PLAYER_AFTER, Subphase } from '../types/gameflow';
import { finishStartPhase } from './finish-start-phase';

const { Upgrading, Deploying, Activating } = Subphase;
const { North, South } = Player;
const { Froglet, LilyPad } = CardKey;
const { Start, Main, End, GameOver } = Phase;

type Preconditions = [Player, Phase, winner?: Player];
type Inputs = [Player, draw: CardKey];

describe(finishStartPhase, () => {
  // Preconditions:
  describe.for<Preconditions>([
    // < phase = Start
    [North, Main],
    [North, End],
    [North, Upgrading],
    [North, Deploying],
    [North, Activating],
    [North, GameOver, North],
    [North, GameOver, South],
    [South, Main],
    [South, End],
    [South, Upgrading],
    [South, Deploying],
    [South, Activating],
    [North, GameOver, North],
    [North, GameOver, South],
  ])(
    'Precondition failed: need Main phase Idle | %s %s | winner %s',
    ([player, phase, winner]) => {
      it('should not change state', () => {
        const before = createStateWith({
          ...gameflowOf(player, phase),
          ...subphaseStateOf(player, phase),
          ...winningPondOf(winner),
        });
        expect(finishStartPhase(draw())(before)).toStrictEqual(before);
      });
    },
  );

  // Postconditions:
  describe.for<Inputs>([
    [North, Froglet],
    [North, LilyPad],
    [South, Froglet],
    [South, LilyPad],
  ])('Postconditions | %s | drawing %s', ([player, cardKey]) => {
    const cardClass = CardClass[cardKey];
    const before = createStateWith(gameflowOf(player, Start));
    const opponent = PLAYER_AFTER[player];

    // > old.phase = Start -> phase = Main
    it('should go to the Main phase', () => {
      const after = finishStartPhase(draw(cardClass))(before);
      expect(after.flow.phase).toBe(Main);
    });

    // > old.phase = Start -> player unchanged
    it('should not change the player', () => {
      const after = finishStartPhase(draw(cardClass))(before);
      expect(after.flow.player).toBe(player);
    });

    // > old.phase = Start -> draw(player)
    it(`should add a ${cardKey} to the ${player} hand`, () => {
      const card = draw(cardClass)(player);
      const after = finishStartPhase(() => card)(before);
      const beforeHand = player === North ? before.northHand : before.southHand;
      const afterHand = player === North ? after.northHand : after.southHand;
      expect(afterHand).toHaveLength(beforeHand.length + 1);
      expect(afterHand).toStrictEqual([...beforeHand, card]);
    });

    // > opponent hand unchanged
    it(`should not change the ${opponent} hand`, () => {
      const after = finishStartPhase(draw(cardClass))(before);
      const beforeHand = player === South ? before.northHand : before.southHand;
      const afterHand = player === South ? after.northHand : after.southHand;
      expect(afterHand).toStrictEqual(beforeHand);
    });
  });
});
