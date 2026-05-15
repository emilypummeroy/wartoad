import { draw } from '@/state-types/card.test-utils';
import {
  getPondStateAt,
  HOME,
  setPondStateAt,
  setPondStateAtEach,
} from '@/state-types/pond';
import {
  INITIAL_POND,
  TEST_LEAVES_BY_KEY,
  TestLeafKey,
} from '@/state-types/pond.test-utils';
import {
  createStateWith,
  deckOf,
  gameflowOf,
  phaseStateOf,
  winningPondOf,
} from '@/state/test-utils';
import { CardClass, CardKey } from '@/types/card';
import { Phase, Player, PLAYER_AFTER } from '@/types/gameflow';
import type { Position } from '@/types/position';

import { finishPhase } from './finish-phase';

const { North, South } = Player;
const { Froglet, LilyPad } = CardKey;
const { Upgrading, Deploying, Activating, Start, Main, End, GameOver } = Phase;

const {
  SOUTH_LILYPAD,
  SOUTH_LILYPAD_UNIT,
  SOUTH_LILYPAD_OTHER_UNIT,
  NORTH_LILYPAD,
  NORTH_LILYPAD_UNIT,
  NORTH_LILYPAD_OTHER_UNIT,
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
      const after = finishPhase()(before);
      expect(after).toStrictEqual(before);
    },
  );

  // TODO 24: Check for deckout
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
      const card = draw(CardClass[drawKey])(player);
      const before = createStateWith({
        ...gameflowOf(player, phase),
        ...deckOf(player, [card]),
      });

      it('should set phase to Main', () => {
        const after = finishPhase()(before);
        expect(after.flow.phase).toBe(Main);
      });

      it(`should draw a ${drawKey} for ${player}`, () => {
        const after = finishPhase()(before);
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
    [North, Main, SOUTH_LILYPAD_UNIT, South],
    [South, Main, NORTH_LILYPAD_UNIT, North],

    // < Main & Idle & can capture other leaf > End & capture
    [North, Main, SOUTH_LILYPAD_OTHER_UNIT, North],
    [South, Main, NORTH_LILYPAD_OTHER_UNIT, South],

    // < Main & Idle & opponent can capture leaf > End & capture
    [North, Main, NORTH_LILYPAD_OTHER_UNIT, South],
    [South, Main, SOUTH_LILYPAD_OTHER_UNIT, North],
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
        const after = finishPhase()(before);
        expect(after.flow.phase).toBe(End);
      });

      it(`should result in that central leaf controller being ${wantController}`, () => {
        const after = finishPhase()(before);
        const got = getPondStateAt(after.pond, POSITION);
        expect(got.controller).toStrictEqual(wantController);
      });
    },
  );

  // Postconditions
  describe.for<
    [
      ...Inputs,
      opponentHome: TestLeafKey,
      wantWinner: Player,
      playerHome?: TestLeafKey,
    ]
  >([
    // < Main & can capture opponent Home > GameOver
    [North, Main, SOUTH_LILYPAD_OTHER_UNIT, North],
    [South, Main, NORTH_LILYPAD_OTHER_UNIT, South],

    // < Main & opponent can capture Home > GameOver
    [North, Main, SOUTH_LILYPAD, South, NORTH_LILYPAD_OTHER_UNIT],
    [South, Main, NORTH_LILYPAD, North, SOUTH_LILYPAD_OTHER_UNIT],

    // < Main & opponent can capture Home > GameOver
    [North, Main, SOUTH_LILYPAD_OTHER_UNIT, South, NORTH_LILYPAD_OTHER_UNIT],
    [South, Main, NORTH_LILYPAD_OTHER_UNIT, North, SOUTH_LILYPAD_OTHER_UNIT],
  ])(
    'Preconditions met | during %s %s | opponent Home is %s | want winner: %s | own home: %s',
    ([player, phase, opponentLeaf, wantWinner, ownLeaf]) => {
      const before = createStateWith({
        ...gameflowOf(player, phase),
        pond: ownLeaf
          ? setPondStateAtEach(
              INITIAL_POND,
              [HOME[PLAYER_AFTER[player]], TEST_LEAVES_BY_KEY[opponentLeaf]],
              [HOME[player], TEST_LEAVES_BY_KEY[ownLeaf]],
            )
          : setPondStateAt(
              INITIAL_POND,
              HOME[PLAYER_AFTER[player]],
              TEST_LEAVES_BY_KEY[opponentLeaf],
            ),
      });

      it(`should make ${wantWinner} win`, () => {
        const after = finishPhase()(before);
        expect(after.flow.phase).toBe(GameOver);
        expect(after.winner).toBe(wantWinner);
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
      const after = finishPhase()(before);
      expect(after.flow.phase).toBe(Start);
    });

    const opponent = PLAYER_AFTER[player];
    it(`should go to ${opponent} turn]`, () => {
      const after = finishPhase()(before);
      expect(after.flow.player).toBe(opponent);
    });
  });
});
