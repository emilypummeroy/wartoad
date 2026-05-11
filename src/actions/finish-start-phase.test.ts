import { draw } from '../state-types/card.test-utils';
import {
  createStateWith,
  gameflowOf,
  phaseStateOf,
  winningPondOf,
} from '../state/test-utils';
import { CardClass, CardKey } from '../types/card';
import { Phase, Player, PLAYER_AFTER } from '../types/gameflow';
import { partial } from '../types/test-utils';
import { finishStartPhase } from './finish-start-phase';

const { North, South } = Player;
const { Froglet, LilyPad } = CardKey;
const { Upgrading, Deploying, Activating, Start, Main, End, GameOver } = Phase;

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
          ...phaseStateOf(player, phase),
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

    // > player funds increased by 5
    it(`should increase ${player} funds`, () => {
      const after = finishStartPhase(draw(cardClass))(before);
      const beforeFunds =
        player === North ? before.northFunds : before.southFunds;
      const afterFunds = player === North ? after.northFunds : after.southFunds;
      expect(afterFunds).toStrictEqual(beforeFunds + 5);
    });

    // > opponent hand unchanged
    it(`should not change the ${opponent} hand`, () => {
      const after = finishStartPhase(draw(cardClass))(before);
      const beforeHand = player === South ? before.northHand : before.southHand;
      const afterHand = player === South ? after.northHand : after.southHand;
      expect(afterHand).toStrictEqual(beforeHand);
    });

    // > opponent funds unchanged
    it(`should not change the ${opponent} funds`, () => {
      const after = finishStartPhase(draw(cardClass))(before);
      const beforeFunds =
        player === South ? before.northFunds : before.southFunds;
      const afterFunds = player === South ? after.northFunds : after.southFunds;
      expect(afterFunds).toStrictEqual(beforeFunds);
    });

    it('should not change the rest of the flow state', () => {
      const after = finishStartPhase(draw(cardClass))(before);
      const { ...want } = partial(before);
      const { ...got } = partial(after);
      if (player === South) {
        delete want.southHand;
        delete got.southHand;
        delete want.southFunds;
        delete got.southFunds;
      } else {
        delete want.northHand;
        delete got.northHand;
        delete want.northFunds;
        delete got.northFunds;
      }
      delete want.flow;
      delete got.flow;
      expect(got).toStrictEqual(want);
    });

    it('should not change the rest of the flow state', () => {
      const after = finishStartPhase(draw(cardClass))(before);
      const { ...want } = partial(before.flow);
      const { ...got } = partial(after.flow);
      delete want.phase;
      delete got.phase;
      expect(got).toStrictEqual(want);
    });
  });
});
