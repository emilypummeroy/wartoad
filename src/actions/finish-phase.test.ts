import { createCard } from '../state-types/card';
import { draw } from '../state-types/card.test-utils';
import {
  getPondStateAt,
  HOME,
  INITIAL_POND,
  setPondStateAt,
} from '../state-types/pond';
import {
  TEST_LEAVES_BY_KEY,
  TestLeafKey,
} from '../state-types/pond.test-utils';
import {
  createStateWith,
  gameflowOf,
  phaseStateOf,
  winningPondOf,
} from '../state/test-utils';
import { CardClass, CardKey } from '../types/card';
import { Phase, Player, PLAYER_AFTER } from '../types/gameflow';
import type { Position } from '../types/position';
import { counter } from '../types/test-utils';
import { finishPhase } from './finish-phase';

const { North, South } = Player;
const { Froglet, LilyPad } = CardKey;
const { Upgrading, Deploying, Activating, Start, Main, End, GameOver } = Phase;

const {
  SOUTH_UPGRADED_UNIT,
  SOUTH_UPGRADED_OTHER_UNIT,
  NORTH_UPGRADED_UNIT,
  NORTH_UPGRADED_OTHER_UNIT,
} = TestLeafKey;

type Preconditions = [Player, Phase, Player?];
type Inputs = [Player, Phase];

describe(finishPhase, () => {
  // Preconditions
  it.for<Preconditions>([
    // < Not in an active phase
    [North, Upgrading],
    [North, Deploying],
    [North, Activating],
    [South, Upgrading],
    [South, Deploying],
    [South, Activating],
    // < Phase is not GameOver
    [North, GameOver, North],
    [North, GameOver, South],
    [South, GameOver, North],
    [South, GameOver, South],
  ])(
    'Preconditions failed: should not make any changes during %s %s | winner %s',
    ([player, phase, winner]) => {
      const before = createStateWith({
        ...gameflowOf(player, phase),
        ...phaseStateOf(player, phase),
        ...winningPondOf(winner),
      });
      const after = finishPhase(draw(CardClass.Froglet))(before);
      expect(after).toStrictEqual(before);
    },
  );

  // Postconditions
  describe.for<[...Inputs, draw: CardKey]>([
    // < Start > Main & card drawn
    [North, Start, Froglet],
    [North, Start, LilyPad],
    [South, Start, Froglet],
    [South, Start, LilyPad],
  ])(
    'Preconditions met | during %s %s | drawing %s',
    ([player, phase, drawKey]) => {
      const before = createStateWith({
        ...gameflowOf(player, phase),
      });

      it('should set phase to Main', () => {
        const after = finishPhase(draw(CardClass[drawKey]))(before);
        expect(after.flow.phase).toBe(Main);
      });

      it(`should draw a ${drawKey} for ${player}`, () => {
        const card = createCard({
          cardClass: CardClass[drawKey],
          owner: player,
          key: counter(),
        });
        const after = finishPhase(() => card)(before);
        const gotHand = player === North ? after.northHand : after.southHand;
        const beforeHand =
          player === North ? before.northHand : before.southHand;
        expect(gotHand).toHaveLength(beforeHand.length + 1);
        expect(gotHand).toContain(card);
      });
    },
  );

  // Postconditions
  describe.for<[...Inputs, opponentLeaf: TestLeafKey, wantController: Player]>([
    // < Main & Idle & cannot capture > End
    [North, Main, SOUTH_UPGRADED_UNIT, South],
    [South, Main, NORTH_UPGRADED_UNIT, North],

    // < Main & Idle & can capture other leaf > End & capture
    [North, Main, SOUTH_UPGRADED_OTHER_UNIT, North],
    [South, Main, NORTH_UPGRADED_OTHER_UNIT, South],
  ])(
    'Preconditions met | during %s %s | when a centre leaf is %s',
    ([player, phase, opponentLeaf, wantController]) => {
      const POSITION: Position = { x: 1, y: 2 };
      const before = createStateWith({
        ...gameflowOf(player, phase),
        pond: setPondStateAt(
          INITIAL_POND,
          POSITION,
          TEST_LEAVES_BY_KEY[opponentLeaf],
        ),
      });

      it('should set phase to End', () => {
        const after = finishPhase(draw())(before);
        expect(after.flow.phase).toBe(End);
      });

      it(`should result in that central leaf controller being ${wantController}`, () => {
        const after = finishPhase(draw())(before);
        const got = getPondStateAt(after.pond, POSITION);
        expect(got.controller).toStrictEqual(wantController);
      });
    },
  );

  // Postconditions
  describe.for<[...Inputs, opponentHome: TestLeafKey]>([
    // < Main & Idle & can capture opponent Home > GameOver
    [North, Main, SOUTH_UPGRADED_OTHER_UNIT],
    [South, Main, NORTH_UPGRADED_OTHER_UNIT],
  ])(
    'Preconditions met | during %s %s | when opponent Home is %s',
    ([player, phase, opponentLeaf]) => {
      const before = createStateWith({
        ...gameflowOf(player, phase),
        pond: setPondStateAt(
          INITIAL_POND,
          HOME[PLAYER_AFTER[player]],
          TEST_LEAVES_BY_KEY[opponentLeaf],
        ),
      });

      it('should set phase to GameOver', () => {
        const after = finishPhase(draw())(before);
        expect(after.flow.phase).toBe(GameOver);
      });
    },
  );

  // Postconditions
  describe.for<Inputs>([
    // < End > opponent Start
    [North, End],
    [South, End],
  ])('Preconditions met | during %s %s', ([player, phase]) => {
    const before = createStateWith({
      ...gameflowOf(player, phase),
    });

    it('should set phase to Start', () => {
      const after = finishPhase(draw())(before);
      expect(after.flow.phase).toBe(Start);
    });

    const opponent = PLAYER_AFTER[player];
    it(`should go to ${opponent} turn]`, () => {
      const after = finishPhase(draw())(before);
      expect(after.flow.player).toBe(opponent);
    });
  });
});
