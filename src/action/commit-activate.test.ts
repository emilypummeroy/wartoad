import type { GameState } from '../state-types';
import { createUnit } from '../state-types/card';
import {
  getPondStateAt,
  INITIAL_POND,
  LEAF_COUNT_PER_ROW,
  ROW_COUNT,
  setPondStateAt,
} from '../state-types/pond';
import { activationOf, createStateWith, gameflowOf } from '../state/test-utils';
import { CardClass } from '../types/card';
import { Phase, Player, Subphase } from '../types/gameflow';
import type { Position } from '../types/position';
import { commitActivate } from './commit-activate';

const { Froglet } = CardClass;
const { North, South } = Player;
const { Idle, Upgrading, Deploying, Activating } = Subphase;
const { Start, Main, End } = Phase;

describe(commitActivate, () => {
  describe.for<
    [string, Position, start: Position | undefined, Player, Subphase, Phase]
  >([
    // Not Main phase & Activation subphase
    ['Wrong flow', { x: 1, y: 1 }, undefined, North, Idle, Start],
    ['Wrong flow', { x: 2, y: 4 }, undefined, South, Deploying, Main],
    ['Wrong flow', { x: 2, y: 4 }, undefined, North, Idle, Main],
    ['Wrong flow', { x: 1, y: 2 }, undefined, South, Upgrading, Main],
    ['Wrong flow', { x: 2, y: 1 }, undefined, North, Idle, End],
    // Not Activating
    ['Not activating', { x: 1, y: 3 }, undefined, North, Idle, Main],
    ['Not activating', { x: 0, y: 4 }, undefined, South, Deploying, Main],
    ['Not activating', { x: 1, y: 3 }, undefined, North, Upgrading, Main],
    ['Not activating', { x: 0, y: 4 }, undefined, South, Idle, End],
    ['Not activating', { x: 2, y: 5 }, undefined, North, Idle, Start],
    // Too far from start
    ['Too far', { x: 1, y: 5 }, { x: 1, y: 3 }, North, Activating, Main],
    ['Too far', { x: 0, y: 4 }, { x: 2, y: 0 }, South, Activating, Main],
    ['Too far', { x: 1, y: 1 }, { x: 1, y: 3 }, North, Activating, Main],
    ['Too far', { x: 0, y: 4 }, { x: 2, y: 4 }, South, Activating, Main],
  ])(
    'when precondition failed: %s | target: %s | start: %s | flow: %s %s %s',
    ([_, target, start, ...flow]) => {
      it('should return the input unchanged', () => {
        const old = createStateWith({
          ...activationOf(start),
          ...gameflowOf(...flow),
        });
        const got = commitActivate(target)(old);
        expect(got).toStrictEqual(old);
      });
    },
  );

  const it_should_end_activation_and_return_to_idle_state = (
    target: Position,
    old: GameState,
  ) => {
    it('should unset the activation state', () => {
      const result = commitActivate(target)(old);
      expect(result.activation).toBeUndefined();
    });

    it('should set subphase to Idle', () => {
      const result = commitActivate(target)(old);
      expect(result.flow.subphase).toStrictEqual(Idle);
    });
  };

  const it_should_not_affect_anything_else = (
    target: Position,
    start: Position,
    old: GameState,
  ) => {
    it('should not affect northHand', () => {
      const result = commitActivate(target)(old);
      expect(result.northHand).toStrictEqual(old.northHand);
    });

    it('should not affect southHand', () => {
      const result = commitActivate(target)(old);
      expect(result.southHand).toStrictEqual(old.southHand);
    });

    it('should not affect flow.player or flow.phase', () => {
      const result = commitActivate(target)(old);
      expect(result.flow.player).toStrictEqual(old.flow.player);
      expect(result.flow.phase).toStrictEqual(old.flow.phase);
    });

    it('should not affect isUpgraded of target', () => {
      const result = commitActivate(target)(old);
      const got = getPondStateAt(result.pond, target).isUpgraded;
      const want = getPondStateAt(old.pond, target).isUpgraded;
      expect(got).toStrictEqual(want);
      expect(result.flow.phase).toStrictEqual(old.flow.phase);
    });

    it('should not affect any other positions', () => {
      const result = commitActivate(target)(old);
      for (let x = 0; x < LEAF_COUNT_PER_ROW; x += 1) {
        for (let y = 0; y < ROW_COUNT; y += 1) {
          assert(x === 0 || x === 1 || x === 2);
          assert(
            y === 0 || y === 1 || y === 2 || y === 3 || y === 4 || y === 5,
          );
          if (x === start.x && y === start.y) continue;
          if (x === target.x && y === target.y) continue;
          const want = getPondStateAt(old.pond, { x, y });
          const got = getPondStateAt(result.pond, { x, y });
          expect(got, `${x}-${y}`).toStrictEqual(want);
        }
      }
    });
  };

  describe.for<[target: Position, Player, targetUnits: number]>([
    [{ x: 0, y: 0 }, North, 1],
    [{ x: 1, y: 1 }, North, 2],
    [{ x: 2, y: 4 }, North, 1],
    [{ x: 1, y: 5 }, North, 3],
    [{ x: 2, y: 4 }, South, 1],
    [{ x: 1, y: 2 }, South, 4],
    [{ x: 2, y: 1 }, South, 1],
    [{ x: 0, y: 0 }, South, 5],
    [{ x: 0, y: 3 }, South, 2],
  ])(
    `when moving in place in the ${Activating} subphase | target = activation.start = %s | %s turn player and card owner`,
    ([target, player, targetCount]) => {
      let i = 0;
      const unit = createUnit({
        cardClass: Froglet,
        owner: player,
        key: (i += 1),
      });
      const targetUnits = Array.from({ length: targetCount - 1 }, () =>
        createUnit({ cardClass: Froglet, owner: player, key: (i += 1) }),
      );
      const old = createStateWith({
        ...activationOf(target, unit),
        ...gameflowOf(player, Activating),
        pond: setPondStateAt(INITIAL_POND, target, {
          units: [...targetUnits, unit],
        }),
      });

      it('should move not affect the target position', () => {
        const result = commitActivate(target)(old);
        const got = getPondStateAt(result.pond, target);
        const want = getPondStateAt(old.pond, target);
        expect(got).toStrictEqual(want);
      });

      it_should_end_activation_and_return_to_idle_state(target, old);
      it_should_not_affect_anything_else(target, target, old);
    },
  );

  describe.for<
    [
      target: Position,
      start: Position,
      Player,
      targetUnits: number,
      startUnits: number,
    ]
  >([
    [{ x: 0, y: 0 }, { x: 0, y: 1 }, North, 0, 1],
    [{ x: 1, y: 1 }, { x: 1, y: 2 }, North, 0, 2],
    [{ x: 2, y: 4 }, { x: 2, y: 5 }, North, 1, 1],
    [{ x: 1, y: 5 }, { x: 0, y: 5 }, North, 2, 3],
    [{ x: 2, y: 4 }, { x: 1, y: 4 }, South, 3, 1],
    [{ x: 1, y: 2 }, { x: 0, y: 2 }, South, 0, 4],
    [{ x: 2, y: 1 }, { x: 2, y: 0 }, South, 4, 1],
    [{ x: 0, y: 0 }, { x: 1, y: 0 }, South, 4, 5],
  ])(
    `when in the ${Activating} subphase | target %s | activation.start %s | %s turn player and card owner`,
    ([target, start, player, targetCount, startCount]) => {
      let i = 0;
      const unit = createUnit({
        cardClass: Froglet,
        owner: player,
        key: (i += 1),
      });
      const targetUnits = Array.from({ length: targetCount }, () =>
        createUnit({ cardClass: Froglet, owner: player, key: (i += 1) }),
      );
      const startUnits = Array.from({ length: startCount - 1 }, () =>
        createUnit({ cardClass: Froglet, owner: player, key: (i += 1) }),
      );
      const old = createStateWith({
        ...activationOf(start, unit),
        ...gameflowOf(player, Activating),
        pond: setPondStateAt(
          setPondStateAt(INITIAL_POND, start, { units: [...startUnits, unit] }),
          target,
          {
            units: targetUnits,
          },
        ),
      });

      it('should move the unit to the target position', () => {
        const result = commitActivate(target)(old);
        const { units } = getPondStateAt(result.pond, target);
        expect(units).toHaveLength(targetCount + 1);
        expect(units[targetCount]).toStrictEqual(unit);
      });

      it('should move the unit from the start position', () => {
        const result = commitActivate(target)(old);
        const { units } = getPondStateAt(result.pond, start);
        expect(units).toHaveLength(startCount - 1);
        expect(units.find(({ key }) => key === unit.key)).toBe(undefined);
      });

      it_should_end_activation_and_return_to_idle_state(target, old);
      it_should_not_affect_anything_else(target, start, old);
    },
  );
});
