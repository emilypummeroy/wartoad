import { createUnit } from '../state-types/card';
import {
  activationOf,
  createStateWith,
  gameflowOf,
  pickedCardOf,
  winningPondOf,
} from '../state/test-utils';
import { CardClass, CardKey, type UnitKey } from '../types/card';
import { Phase, Player, Subphase } from '../types/gameflow';
import type { Position } from '../types/position';
import { _, counter } from '../types/test-utils';
import { deploy } from './deploy';

const { LilyPad, Froglet } = CardKey;
const { North, South } = Player;
const { Start, Main, End, GameOver } = Phase;
const { Idle, Upgrading, Deploying, Activating } = Subphase;

describe(deploy, () => {
  // Preconditions:
  describe.for<[Player, Phase, Subphase, CardKey?, Position?, Player?]>([
    // < Idle
    [North, Start, Idle],
    [North, End, Idle],
    [North, GameOver, Idle, _, _, North],
    [North, GameOver, Idle, _, _, South],
    [South, Start, Idle],
    [South, End, Idle],
    [South, GameOver, Idle, _, _, North],
    [South, GameOver, Idle, _, _, South],

    // < Main phase
    [North, Main, Upgrading, LilyPad],
    [North, Main, Deploying, Froglet],
    [North, Main, Activating, _, { x: 0, y: 0 }],
    [South, Main, Upgrading, LilyPad],
    [South, Main, Deploying, Froglet],
    [South, Main, Activating, _, { x: 0, y: 0 }],
  ])(
    'Preconditions failed: need Idle during Main phase | %s %s %s',
    ([player, phase, subphase, cardKey, position, winner]) => {
      const card = createUnit({
        cardClass: CardClass.Froglet,
        owner: player,
        key: counter(),
      });
      const before = createStateWith({
        ...gameflowOf(player, subphase, phase),
        ...winningPondOf(winner),
        ...pickedCardOf(cardKey),
        ...activationOf(position),
      });

      it('should not change state', () => {
        expect(deploy(card.cardClass)(before)).toStrictEqual(before);
      });
    },
  );

  // Postconditions
  describe.for<[Player, UnitKey]>([
    [North, Froglet],
    [South, Froglet],
  ])('Postconditions | %s turn | called with %s', ([player, cardKey]) => {
    const card = createUnit({
      cardClass: CardClass[cardKey],
      owner: player,
      key: counter(),
    });
    const before = createStateWith({
      ...gameflowOf(player),
    });

    // > Subphase := Deploying
    it('should set the subphase to Deploying', () => {
      const after = deploy(card.cardClass)(before);
      expect(after.flow.subphase).toBe(Deploying);
    });

    it('should not change the rest of the gameflow state', () => {
      const { subphase: _, ...got } = deploy(card.cardClass)(before).flow;
      const { subphase: __, ...want } = before.flow;
      expect(got).toStrictEqual(want);
    });

    // > pickedCard set
    it(`should set the picked card to a ${cardKey}`, () => {
      const after = deploy(card.cardClass)(before);
      expect(after.pickedCard).toBe(card.cardClass);
    });

    it(`should set affect the rest of the state`, () => {
      const after = deploy(card.cardClass)(before);
      let got = {};
      let want = {};
      {
        const { flow: _, pickedCard: __, ...rest } = after;
        got = rest;
      }
      {
        const { flow: _, pickedCard: __, ...rest } = before;
        want = rest;
      }
      expect(got).toStrictEqual(want);
    });
  });
});
