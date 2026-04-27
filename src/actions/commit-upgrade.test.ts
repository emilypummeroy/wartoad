import type { GameState } from '../state-types';
import { createLeaf, DETERMINISTIC_STARTING_HAND } from '../state-types/card';
import {
  getPondStateAt,
  INITIAL_POND,
  LEAF_COUNT_PER_ROW,
  ROW_COUNT,
  setPondStateAt,
} from '../state-types/pond';
import {
  TEST_LEAVES_BY_KEY,
  TestLeafKey,
} from '../state-types/pond.test-utils';
import {
  createStateWith,
  gameflowOf,
  subphaseStateOf,
  upgradeOf,
} from '../state/test-utils';
import { CardClass, CardKey, type LeafKey } from '../types/card';
import { Phase, Player, PLAYER_AFTER, Subphase } from '../types/gameflow';
import type { Position } from '../types/position';
import { counter } from '../types/test-utils';
import { commitUpgrade } from './commit-upgrade';

const { LilyPad } = CardKey;
const { North, South } = Player;
const { Idle, Upgrading, Deploying, Activating } = Subphase;
const { Start, Main, End } = Phase;

const { NORTH_LEAF, SOUTH_LEAF, NORTH_UPGRADED, SOUTH_UPGRADED } = TestLeafKey;

type Input = [Position, Player, LeafKey];
type Preconditions = [Position, TestLeafKey, turn: Player, Subphase, Phase];

describe(commitUpgrade, () => {
  describe.for<Preconditions>([
    // < Upgrading
    [{ x: 1, y: 1 }, NORTH_LEAF, North, Idle, Main],
    [{ x: 2, y: 5 }, SOUTH_LEAF, South, Activating, Main],
    [{ x: 2, y: 0 }, NORTH_LEAF, North, Deploying, Main],
    [{ x: 0, y: 4 }, SOUTH_LEAF, South, Idle, End],
    [{ x: 0, y: 2 }, NORTH_LEAF, North, Idle, Start],
  ])(
    'Precondition failed: Need Upgrading | target: %s %s | flow: %s %s %s',
    input => it_should_return_state_unchanged(input),
  );

  describe.for<Preconditions>([
    // < Target is controlled by player
    [{ x: 2, y: 5 }, SOUTH_LEAF, North, Upgrading, Main],
    [{ x: 0, y: 4 }, SOUTH_LEAF, North, Upgrading, Main],
    [{ x: 2, y: 1 }, NORTH_LEAF, South, Upgrading, Main],
    [{ x: 0, y: 2 }, NORTH_LEAF, South, Upgrading, Main],
  ])(
    'Precondition failed: Target controlled by player | target: %s %s | flow: %s %s %s',
    input => it_should_return_state_unchanged(input),
  );

  describe.for<Preconditions>([
    // < Target is not upgraded
    [{ x: 2, y: 5 }, NORTH_UPGRADED, North, Upgrading, Main],
    [{ x: 0, y: 4 }, NORTH_UPGRADED, North, Upgrading, Main],
    [{ x: 2, y: 1 }, SOUTH_UPGRADED, South, Upgrading, Main],
    [{ x: 0, y: 2 }, SOUTH_UPGRADED, South, Upgrading, Main],
  ])(
    'Precondition failed: Target not already upgraded | target: %s %s | flow: %s %s %s',
    input => it_should_return_state_unchanged(input),
  );

  const it_should_return_state_unchanged = ([
    target,
    leafKey,
    player,
    subphase,
    phase,
  ]: Preconditions) => {
    it('should return the input unchanged', () => {
      const old = createStateWith({
        ...gameflowOf(player, subphase, phase),
        ...subphaseStateOf(player, subphase),
        pond: setPondStateAt(INITIAL_POND, target, TEST_LEAVES_BY_KEY[leafKey]),
      });
      const got = commitUpgrade(target)(old);
      expect(got).toStrictEqual(old);
    });
  };

  describe.for<Input>([
    [{ x: 0, y: 0 }, North, LilyPad],
    [{ x: 2, y: 0 }, South, LilyPad],
    [{ x: 2, y: 0 }, North, LilyPad],
    [{ x: 0, y: 1 }, South, LilyPad],
    [{ x: 1, y: 1 }, North, LilyPad],
    [{ x: 2, y: 1 }, South, LilyPad],
    [{ x: 0, y: 2 }, North, LilyPad],
    [{ x: 1, y: 2 }, South, LilyPad],
    [{ x: 2, y: 2 }, North, LilyPad],
    [{ x: 0, y: 3 }, South, LilyPad],
    [{ x: 2, y: 3 }, North, LilyPad],
    [{ x: 2, y: 3 }, South, LilyPad],
    [{ x: 0, y: 4 }, North, LilyPad],
    [{ x: 1, y: 4 }, South, LilyPad],
    [{ x: 2, y: 4 }, North, LilyPad],
    [{ x: 0, y: 5 }, South, LilyPad],
    [{ x: 2, y: 5 }, North, LilyPad],
  ])(
    `Postconditions: target = %s | %s turn player and leaf controller | picked: %s`,
    ([target, player, leafKey]) => {
      const leaf = createLeaf({
        cardClass: CardClass[leafKey],
        owner: player,
        key: counter(),
      });
      const restOfHand =
        player === North
          ? DETERMINISTIC_STARTING_HAND
          : DETERMINISTIC_STARTING_HAND.toReversed();
      const playerHand =
        player === North
          ? [...restOfHand, leaf.cardClass]
          : [leaf.cardClass, ...restOfHand];

      const before = createStateWith({
        ...upgradeOf(player, leaf),
        ...gameflowOf(player, Upgrading),
        ...(player === North
          ? { northHand: playerHand }
          : { southHand: playerHand }),
        pond: setPondStateAt(INITIAL_POND, target, {
          controller: player,
          isUpgraded: false,
        }),
      });

      it('should upgrade the target position', () => {
        const after = commitUpgrade(target)(before);
        const got = getPondStateAt(after.pond, target);
        expect(got.isUpgraded).toBe(true);
      });

      it('should unset the upgrade state', () => {
        const result = commitUpgrade(target)(before);
        expect(result.upgrade).toBeUndefined();
      });

      it(`should remove the card from the ${player} hand`, () => {
        const after = commitUpgrade(target)(before);
        const got = player === North ? after.northHand : after.southHand;
        // TODO 11: Check for individual card
        expect(got).toHaveLength(restOfHand.length);
      });

      const opponent = PLAYER_AFTER[player];
      it(`should not change the ${opponent} hand`, () => {
        const after = commitUpgrade(target)(before);
        const got = opponent === North ? after.northHand : after.southHand;
        const want = opponent === North ? before.northHand : before.southHand;
        expect(got).toStrictEqual(want);
      });

      it('should set subphase to Idle', () => {
        const result = commitUpgrade(target)(before);
        expect(result.flow.subphase).toBe(Idle);
      });

      it_should_not_affect_anything_else(target, before);
    },
  );

  const it_should_not_affect_anything_else = (
    target: Position,
    before: GameState,
  ) => {
    it('should not affect the rest of gameflow state', () => {
      const after = commitUpgrade(target)(before);
      let got = {};
      let want = {};
      {
        const { subphase: _, ...rest } = after.flow;
        got = rest;
      }
      {
        const { subphase: _, ...rest } = before.flow;
        want = rest;
      }
      expect(got).toStrictEqual(want);
    });

    it('should not affect any other positions', () => {
      const after = commitUpgrade(target)(before);
      // Excluding rows/leaves by spreading shenanigans isn't
      // worth it, it's more annoying than just iterating.
      for (let x = 0; x < LEAF_COUNT_PER_ROW; x += 1) {
        for (let y = 0; y < ROW_COUNT; y += 1) {
          assert(x === 0 || x === 1 || x === 2);
          assert(
            y === 0 || y === 1 || y === 2 || y === 3 || y === 4 || y === 5,
          );
          if (x === target.x && y === target.y) continue;
          const want = getPondStateAt(before.pond, { x, y });
          const got = getPondStateAt(after.pond, { x, y });
          expect(got, `${x}-${y}`).toStrictEqual(want);
        }
      }
    });

    it(`should not affect the rest of the leaf at the target`, () => {
      const after = commitUpgrade(target)(before);
      const { isUpgraded: _, ...got } = getPondStateAt(after.pond, target);
      const { isUpgraded: __, ...want } = getPondStateAt(before.pond, target);
      expect(got).toStrictEqual(want);
    });

    it('should not affect the rest of game state', () => {
      const after = commitUpgrade(target)(before);
      let got = {};
      let want = {};
      {
        const {
          flow: _,
          pond: __,
          upgrade: ___,
          northHand: ____,
          southHand: _____,
          ...rest
        } = after;
        got = rest;
      }
      {
        const {
          flow: _,
          pond: __,
          upgrade: ___,
          northHand: ____,
          southHand: _____,
          ...rest
        } = after;
        want = rest;
      }
      expect(got).toStrictEqual(want);
    });
  };
});
