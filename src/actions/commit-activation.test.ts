import type { GameState } from '../state-types';
import { createUnit } from '../state-types/card';
import {
  getPondStateAt,
  INITIAL_POND,
  LEAF_COUNT_PER_ROW,
  ROW_COUNT,
  setPondStateAtEach,
} from '../state-types/pond';
import {
  activationOf,
  createStateWith,
  gameflowOf,
  pickedCardOf,
} from '../state/test-utils';
import { CardClass, CardKey, type UnitCard } from '../types/card';
import { Phase, Player, Subphase } from '../types/gameflow';
import type { Position } from '../types/position';
import { _, counter } from '../types/test-utils';
import { commitActivation } from './commit-activation';

const { Froglet, LilyPad } = CardKey;
const { North, South } = Player;
const { Idle, Upgrading, Deploying, Activating } = Subphase;
const { Start, Main, End } = Phase;

type Input = [
  target: Position,
  Player,
  targetUnits: number,
  startUnits?: number,
  start?: Position,
];
type Preconditions = [
  Position,
  Player,
  Subphase,
  Phase,
  start?: Position,
  CardKey?,
];

describe(commitActivation, () => {
  describe.for<Preconditions>([
    // Not Activating
    [{ x: 1, y: 3 }, North, Idle, Main, _],
    [{ x: 2, y: 4 }, South, Deploying, Main, _, Froglet],
    [{ x: 1, y: 3 }, North, Upgrading, Main, _, LilyPad],
    [{ x: 0, y: 4 }, South, Idle, End, _],
    [{ x: 2, y: 5 }, North, Idle, Start, _],
  ])(
    'Precondition failed: Need Activating | target: %s | flow: %s %s %s | start: %s | pickedCard: %s',
    input => it_should_return_state_unchanged(input),
  );

  describe.for<Preconditions>([
    // Too far from start
    [{ x: 1, y: 5 }, North, Activating, Main, { x: 1, y: 3 }],
    [{ x: 0, y: 4 }, South, Activating, Main, { x: 2, y: 0 }],
    [{ x: 1, y: 1 }, North, Activating, Main, { x: 1, y: 3 }],
    [{ x: 0, y: 4 }, South, Activating, Main, { x: 2, y: 4 }],
  ])(
    'Precondition failed: Too far to move | target: %s | flow: %s %s %s | start: %s',
    input => it_should_return_state_unchanged(input),
  );

  const it_should_return_state_unchanged = ([
    target,
    player,
    subphase,
    phase,
    start,
    pickedCard,
  ]: Preconditions) => {
    it('should return the input unchanged', () => {
      const old = createStateWith({
        ...gameflowOf(player, subphase, phase),
        ...activationOf(start),
        ...pickedCardOf(pickedCard),
      });
      const got = commitActivation(target)(old);
      expect(got).toStrictEqual(old);
    });
  };

  describe.for<Input>([
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
    input => {
      const [target] = input;
      const [before] = state_for(input);

      it('should not affect the target position', () => {
        const result = commitActivation(target)(before);
        const got = getPondStateAt(result.pond, target);
        const want = getPondStateAt(before.pond, target);
        expect(got).toStrictEqual(want);
      });

      it_should_end_activation_and_return_to_idle_state(target, before);
      it_should_not_affect_the_rest_of_the_leaf(target, before);
      it_should_not_affect_the_rest_of_the_pond(target, target, before);
      it_should_not_affect_the_rest_of_gameflow(target, before);
      it_should_not_affect_the_rest_of_game_state(target, before);
    },
  );

  describe.for<Input>([
    [{ x: 0, y: 0 }, North, 0, 1, { x: 0, y: 1 }],
    [{ x: 1, y: 1 }, North, 0, 2, { x: 1, y: 2 }],
    [{ x: 2, y: 4 }, North, 1, 1, { x: 2, y: 5 }],
    [{ x: 1, y: 5 }, North, 2, 3, { x: 0, y: 5 }],
    [{ x: 2, y: 4 }, South, 3, 1, { x: 1, y: 4 }],
    [{ x: 1, y: 2 }, South, 0, 4, { x: 0, y: 2 }],
    [{ x: 2, y: 1 }, South, 4, 1, { x: 2, y: 0 }],
    [{ x: 0, y: 0 }, South, 4, 5, { x: 1, y: 0 }],
  ])(
    `when in the ${Activating} subphase | target %s | activation.start %s | %s turn player and card owner`,
    input => {
      const [target, , targetCount, startCount = targetCount, start = target] =
        input;
      const [before, unit] = state_for(input);

      it('should move the unit to the target position', () => {
        const result = commitActivation(target)(before);
        const { units } = getPondStateAt(result.pond, target);
        expect(units).toHaveLength(targetCount + 1);
        expect(units[targetCount]).toStrictEqual(unit);
      });

      it('should move the unit from the start position', () => {
        const result = commitActivation(target)(before);
        const { units } = getPondStateAt(result.pond, start);
        expect(units).toHaveLength(startCount - 1);
        expect(units.find(({ key }) => key === unit.key)).toBe(undefined);
      });

      it_should_end_activation_and_return_to_idle_state(target, before);
      it_should_not_affect_the_rest_of_the_leaf(start, before);
      it_should_not_affect_the_rest_of_the_leaf(target, before);
      it_should_not_affect_the_rest_of_the_pond(target, start, before);
      it_should_not_affect_the_rest_of_gameflow(target, before);
      it_should_not_affect_the_rest_of_game_state(target, before);
    },
  );

  const state_for = ([
    target,
    player,
    targetCount,
    startCount,
    start = target,
  ]: Input): [GameState, UnitCard] => {
    const unit = createUnit({
      cardClass: CardClass.Froglet,
      owner: player,
      key: counter(),
    });
    const targetUnits = Array.from({ length: targetCount }, () =>
      createUnit({
        cardClass: CardClass.Froglet,
        owner: player,
        key: counter(),
      }),
    );
    const startUnits =
      startCount !== undefined
        ? Array.from({ length: startCount - 1 }, () =>
            createUnit({
              cardClass: CardClass.Froglet,
              owner: player,
              key: counter(),
            }),
          )
        : [];
    const before = createStateWith({
      ...activationOf(start, unit),
      ...gameflowOf(player, Activating),
      pond:
        start !== target
          ? setPondStateAtEach(
              INITIAL_POND,
              [start, { units: [...startUnits, unit] }],
              [target, { units: targetUnits }],
            )
          : setPondStateAtEach(INITIAL_POND, [
              target,
              { units: [...targetUnits, unit] },
            ]),
    });
    return [before, unit];
  };

  const it_should_end_activation_and_return_to_idle_state = (
    target: Position,
    old: GameState,
  ) => {
    it('should unset the activation state', () => {
      const result = commitActivation(target)(old);
      expect(result.activation).toBeUndefined();
    });

    it('should set subphase to Idle', () => {
      const result = commitActivation(target)(old);
      expect(result.flow.subphase).toStrictEqual(Idle);
    });
  };

  const it_should_not_affect_the_rest_of_gameflow = (
    target: Position,
    before: GameState,
  ) => {
    it('should not affect the rest of gameflow state', () => {
      const after = commitActivation(target)(before);
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
  };

  const it_should_not_affect_the_rest_of_the_pond = (
    target: Position,
    start: Position,
    before: GameState,
  ) =>
    it('should not affect any other positions', () => {
      const after = commitActivation(target)(before);
      // Excluding rows/leaves by spreading shenanigans isn't
      // worth it, it's more annoying than just iterating.
      for (let x = 0; x < LEAF_COUNT_PER_ROW; x += 1) {
        for (let y = 0; y < ROW_COUNT; y += 1) {
          assert(x === 0 || x === 1 || x === 2);
          assert(
            y === 0 || y === 1 || y === 2 || y === 3 || y === 4 || y === 5,
          );
          if (x === start.x && y === start.y) continue;
          if (x === target.x && y === target.y) continue;
          const want = getPondStateAt(before.pond, { x, y });
          const got = getPondStateAt(after.pond, { x, y });
          expect(got, `${x}-${y}`).toStrictEqual(want);
        }
      }
    });

  const it_should_not_affect_the_rest_of_the_leaf = (
    xy: Position,
    before: GameState,
  ) =>
    it(`should not affect the rest of the leaf at ${JSON.stringify(xy)}`, () => {
      const after = commitActivation(xy)(before);
      const { units: _, ...got } = getPondStateAt(after.pond, xy);
      const { units: __, ...want } = getPondStateAt(before.pond, xy);
      expect(got).toStrictEqual(want);
    });

  const it_should_not_affect_the_rest_of_game_state = (
    target: Position,
    before: GameState,
  ) =>
    it('should not affect the rest of game state', () => {
      const after = commitActivation(target)(before);
      let got = {};
      let want = {};
      {
        const { flow: _, pond: __, activation: ___, ...rest } = after;
        got = rest;
      }
      {
        const { flow: _, pond: __, activation: ___, ...rest } = before;
        want = rest;
      }
      expect(got).toStrictEqual(want);
    });
});
