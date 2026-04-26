import {
  activationOf,
  createStateWith,
  gameflowOf,
  pickedCardOf,
} from '../state/test-utils';
import { CardClass, type CardKey } from '../types/card';
import { Phase, Player, PLAYER_AFTER, Subphase } from '../types/gameflow';
import type { Position } from '../types/position';
import { finishPhase } from './finish-phase';

const { Idle, Upgrading, Deploying, Activating } = Subphase;
const { North, South } = Player;
const { Froglet, LilyPad } = CardClass;
const { Start, Main, End } = Phase;

type Preconditions = [Player, Subphase];
type Inputs = [Player, Phase, draw: CardClass];

describe(finishPhase, () => {
  // Preconditions:
  // subphase = Idle
  describe.for<[...Preconditions, CardKey, Position]>([
    [North, Upgrading, 'Froglet', { x: 2, y: 2 }],
    [North, Deploying, 'LilyPad', { x: 1, y: 3 }],
    [North, Activating, 'Froglet', { x: 0, y: 4 }],
    [South, Upgrading, 'Froglet', { x: 2, y: 5 }],
    [South, Deploying, 'LilyPad', { x: 0, y: 0 }],
    [South, Activating, 'Froglet', { x: 1, y: 1 }],
  ])(
    'Precondition failed: need Idle | %s %s | %s %s',
    ([player, subphase, cardKey, position]) => {
      const draw = () => CardClass[cardKey];
      it('should not change state', () => {
        const old = createStateWith({
          ...gameflowOf(player, subphase),
          ...(subphase === Activating
            ? activationOf(position)
            : pickedCardOf(CardClass[cardKey])),
        });
        expect(finishPhase(draw)(old)).toStrictEqual(old);
      });
    },
  );

  // Postconditions:
  describe.for<Inputs>([
    [North, Start, Froglet],
    [North, Start, LilyPad],
    [South, Start, Froglet],
    [South, Start, LilyPad],
  ])('Postconditions | %s %s | drawing %s', ([player, phase, card]) => {
    const draw = () => card;
    const before = createStateWith(gameflowOf(player, Idle, phase));
    const opponent = PLAYER_AFTER[player];

    // > old.phase = Start -> phase = Main
    it('should go to the Main phase', () => {
      const after = finishPhase(draw)(before);
      expect(after.flow.phase).toBe(Main);
    });

    // > old.phase = Start -> player unchanged
    it('should not change the player', () => {
      const after = finishPhase(draw)(before);
      expect(after.flow.player).toBe(player);
    });

    // > old.phase = Start -> draw(player)
    it(`should add a ${card.name} to the ${player} hand`, () => {
      const after = finishPhase(draw)(before);
      const beforeHand = player === North ? before.northHand : before.southHand;
      const afterHand = player === North ? after.northHand : after.southHand;
      expect(afterHand).toHaveLength(beforeHand.length + 1);
      expect(afterHand).toStrictEqual([...beforeHand, card]);
    });

    // > opponent hand unchanged
    it(`should not change the ${opponent} hand`, () => {
      const after = finishPhase(draw)(before);
      const beforeHand = player === South ? before.northHand : before.southHand;
      const afterHand = player === South ? after.northHand : after.southHand;
      expect(afterHand).toStrictEqual(beforeHand);
    });
  });

  // Postconditions:
  describe.for<Inputs>([
    [North, Main, Froglet],
    [North, Main, LilyPad],
    [South, Main, Froglet],
    [South, Main, LilyPad],
  ])('Postconditions | %s %s | drawing %s', ([player, phase, card]) => {
    const draw = () => card;
    const before = createStateWith(gameflowOf(player, Idle, phase));

    // > old.phase = Main -> phase = End
    it('should go to the End phase', () => {
      const after = finishPhase(draw)(before);
      expect(after.flow.phase).toBe(End);
    });

    // > old.phase = Main -> player unchanged
    it('should not change the player', () => {
      const after = finishPhase(draw)(before);
      expect(after.flow.player).toBe(player);
    });

    // > old.phase = Main -> hands unchanged
    it('should not change the hands', () => {
      const after = finishPhase(draw)(before);
      expect(after.northHand).toBe(before.northHand);
      expect(after.southHand).toBe(before.southHand);
    });
  });

  // Postconditions:
  // TODO 10: old.phase = End & p of positions: cancapture(p) -> capture(p, player)
  describe.for<Inputs>([
    [North, End, Froglet],
    [North, End, LilyPad],
    [South, End, Froglet],
    [South, End, LilyPad],
  ])('Postconditions | %s %s | drawing %s', ([player, phase, card]) => {
    const draw = () => card;
    const before = createStateWith(gameflowOf(player, Idle, phase));

    // > old.phase = End -> phase = Start
    it('should go to the Start phase', () => {
      const after = finishPhase(draw)(before);
      expect(after.flow.phase).toBe(Start);
    });

    // > old.phase = End -> player = after(old.player)
    it(`should start the ${PLAYER_AFTER[player]} turn`, () => {
      const after = finishPhase(draw)(before);
      expect(after.flow.player).toBe(PLAYER_AFTER[player]);
    });

    // > old.phase = End -> hands unchanged
    it('should not change the hands', () => {
      const after = finishPhase(draw)(before);
      expect(after.northHand).toBe(before.northHand);
      expect(after.southHand).toBe(before.southHand);
    });
  });
});
