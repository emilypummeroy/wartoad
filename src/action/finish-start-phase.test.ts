import { createStateWith, gameflowOf } from '../state/test-utils';
import { CardClass, CardKey } from '../types/card';
import { Phase, Player, PLAYER_AFTER, Subphase } from '../types/gameflow';
import type { Position } from '../types/position';
import { finishStartPhase } from './finish-start-phase';

const { Idle } = Subphase;
const { North, South } = Player;
const { Froglet, LilyPad } = CardKey;
const { Start, Main, End } = Phase;

type Preconditions = [Player, Phase];
type Inputs = [Player, draw: CardKey];

describe(finishStartPhase, () => {
  // Preconditions:
  // phase = Start
  describe.for<[...Preconditions, CardKey, Position?]>([
    [North, Main, Froglet, { x: 2, y: 2 }],
    [North, End, LilyPad, { x: 1, y: 3 }],
    [South, Main, Froglet, { x: 2, y: 5 }],
    [South, End, LilyPad, { x: 0, y: 0 }],
  ])(
    'Precondition failed: need Idle | %s %s | %s %s',
    ([player, phase, cardClass]) => {
      const draw = () => CardClass[cardClass];
      it('should not change state', () => {
        const old = createStateWith({
          ...gameflowOf(player, undefined, phase),
        });
        expect(finishStartPhase(draw)(old)).toStrictEqual(old);
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
    const draw = () => CardClass[cardKey];
    const before = createStateWith(gameflowOf(player, Idle, Start));
    const opponent = PLAYER_AFTER[player];

    // > old.phase = Start -> phase = Main
    it('should go to the Main phase', () => {
      const after = finishStartPhase(draw)(before);
      expect(after.flow.phase).toBe(Main);
    });

    // > old.phase = Start -> player unchanged
    it('should not change the player', () => {
      const after = finishStartPhase(draw)(before);
      expect(after.flow.player).toBe(player);
    });

    // > old.phase = Start -> draw(player)
    it(`should add a ${cardKey} to the ${player} hand`, () => {
      const after = finishStartPhase(draw)(before);
      const beforeHand = player === North ? before.northHand : before.southHand;
      const afterHand = player === North ? after.northHand : after.southHand;
      expect(afterHand).toHaveLength(beforeHand.length + 1);
      expect(afterHand).toStrictEqual([...beforeHand, CardClass[cardKey]]);
    });

    // > opponent hand unchanged
    it(`should not change the ${opponent} hand`, () => {
      const after = finishStartPhase(draw)(before);
      const beforeHand = player === South ? before.northHand : before.southHand;
      const afterHand = player === South ? after.northHand : after.southHand;
      expect(afterHand).toStrictEqual(beforeHand);
    });
  });
});
